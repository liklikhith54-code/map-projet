import http.server
import socketserver
import json
import sqlite3
import hashlib
import os
import uuid
import urllib.parse
import mimetypes
from datetime import datetime, timedelta

PORT = int(os.environ.get("PORT", 8080))
DB_FILE = "mapsphere.db"

# In-memory OTP store: { phone_number: { "otp": otp_code, "expires_at": datetime } }
OTP_STORE = {}

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        phone TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # Migration: Try to add phone column if database already existed without it
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN phone TEXT;")
        cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON users(phone);")
        conn.commit()
    except sqlite3.OperationalError:
        # Column already exists or table cannot be altered
        pass
    
    # Create sessions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires_at DATETIME NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    );
    """)
    
    # Create POIs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pois (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        rating REAL NOT NULL,
        description TEXT,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(created_by) REFERENCES users(id)
    );
    """)
    
    conn.commit()
    conn.close()
    print("Database initialised successfully.")

# Helper: Hash password
def hash_password(password, salt):
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

# Helper: Parse cookies
def parse_cookies(cookie_header):
    cookies = {}
    if not cookie_header:
        return cookies
    for cookie in cookie_header.split(';'):
        parts = cookie.strip().split('=')
        if len(parts) == 2:
            cookies[parts[0].strip()] = parts[1].strip()
    return cookies

# Helper: Parse datetime strings from DB robustly
def parse_db_datetime(dt_str):
    for fmt in ("%Y-%m-%d %H:%M:%S.%f", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(dt_str, fmt)
        except ValueError:
            continue
    return datetime.now()

class MapSphereHandler(http.server.BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1' # Standardize HTTP/1.1

    def log_message(self, format, *args):
        # Override to log cleanly to console
        print(f"[{self.log_date_time_string()}] {format%args}")

    def send_json(self, data, status_code=200, headers=None):
        body = json.dumps(data).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Connection', 'close') # Close socket immediately
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        
        # CORS headers
        origin = self.headers.get('Origin', '*')
        self.send_header('Access-Control-Allow-Origin', origin)
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie')
        self.send_header('Access-Control-Allow-Credentials', 'true')
        
        if headers:
            for key, val in headers.items():
                self.send_header(key, val)
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        origin = self.headers.get('Origin', '*')
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', origin)
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie')
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.end_headers()


    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        # GET Custom POIs
        if path == "/api/pois":
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, type, lat, lng, rating, description FROM pois")
            rows = cursor.fetchall()
            conn.close()
            
            pois_list = []
            for row in rows:
                pois_list.append({
                    "id": f"custom_{row[0]}",
                    "name": row[1],
                    "type": row[2],
                    "lat": row[3],
                    "lng": row[4],
                    "rating": row[5],
                    "description": row[6],
                    "status": "Highly Recommended" if row[5] >= 4.5 else ("Not Recommended" if row[5] < 3.8 else "Average")
                })
            self.send_json(pois_list)
            return

        # 1. API: Session validation
        if path == "/api/session":
            cookies = parse_cookies(self.headers.get('Cookie', ''))
            token = cookies.get('session_token')
            
            if not token:
                self.send_json({"error": "No active session"}, 401)
                return
                
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            cursor.execute("""
                SELECT users.id, users.name, users.email, sessions.expires_at 
                FROM sessions 
                JOIN users ON sessions.user_id = users.id 
                WHERE sessions.token = ?
            """, (token,))
            row = cursor.fetchone()
            
            if not row:
                conn.close()
                self.send_json({"error": "Session token invalid"}, 401)
                return
                
            user_id, name, email, expires_at_str = row
            expires_at = parse_db_datetime(expires_at_str)
            
            # Check session expiry
            if expires_at < datetime.now():
                cursor.execute("DELETE FROM sessions WHERE token = ?", (token,))
                conn.commit()
                conn.close()
                self.send_json({"error": "Session expired"}, 401)
                return
                
            conn.close()
            self.send_json({
                "status": "success",
                "user": {"id": user_id, "name": name, "email": email}
            })
            return

        # 2. Serve Static files
        if path == "/" or path == "":
            file_path = "./index.html"
        else:
            file_path = "." + path
            
        # Security check: prevent directory traversal
        abs_path = os.path.abspath(file_path)
        root_dir = os.path.abspath(".")
        if not abs_path.startswith(root_dir):
            self.send_response(403)
            self.send_header('Content-Length', '9')
            self.send_header('Connection', 'close')
            self.end_headers()
            self.wfile.write(b"Forbidden")
            return

        if os.path.exists(abs_path) and os.path.isfile(abs_path):
            file_size = os.path.getsize(abs_path)
            self.send_response(200)
            
            # Guess mime types
            mime_type, _ = mimetypes.guess_type(abs_path)
            if not mime_type:
                mime_type = 'application/octet-stream'
            self.send_header('Content-Type', mime_type)
            self.send_header('Content-Length', str(file_size))
            self.send_header('Connection', 'close')
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            
            with open(abs_path, 'rb') as f:
                self.wfile.write(f.read())
        else:
            self.send_response(404)
            self.send_header('Content-Length', '13')
            self.send_header('Connection', 'close')
            self.end_headers()
            self.wfile.write(b"404 Not Found")

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        # Read JSON POST Body
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length).decode('utf-8')
        
        try:
            body = json.loads(post_data) if post_data else {}
        except json.JSONDecodeError:
            self.send_json({"error": "Invalid JSON body"}, 400)
            return

        # 1. API: Registration
        if path == "/api/register":
            name = body.get('name', '').strip()
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')

            if not name or not email or len(password) < 8:
                self.send_json({"error": "Invalid registration fields"}, 400)
                return

            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            
            # Check if email exists
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            if cursor.fetchone():
                conn.close()
                self.send_json({"error": "Email is already registered"}, 409)
                return

            # Hash Password
            salt = uuid.uuid4().hex
            pw_hash = hash_password(password, salt)

            try:
                cursor.execute("""
                    INSERT INTO users (name, email, password_hash, salt) 
                    VALUES (?, ?, ?, ?)
                """, (name, email, pw_hash, salt))
                user_id = cursor.lastrowid
                
                # Create session
                token = uuid.uuid4().hex
                expires_at = datetime.now() + timedelta(days=7)
                cursor.execute("""
                    INSERT INTO sessions (token, user_id, expires_at) 
                    VALUES (?, ?, ?)
                """, (token, user_id, expires_at))
                
                conn.commit()
                conn.close()
                
                # Set cookie header
                cookie_str = f"session_token={token}; Path=/; HttpOnly; Max-Age=604800; SameSite=Lax"
                self.send_json({
                    "status": "success",
                    "user": {"id": user_id, "name": name, "email": email}
                }, 201, {"Set-Cookie": cookie_str})
                
            except sqlite3.Error as e:
                conn.close()
                self.send_json({"error": f"Database error: {str(e)}"}, 500)
            return

        # POST Custom POI
        elif path == "/api/pois":
            # Authenticate session
            cookies = parse_cookies(self.headers.get('Cookie', ''))
            token = cookies.get('session_token')
            
            user_id = None
            if token:
                conn = sqlite3.connect(DB_FILE)
                cursor = conn.cursor()
                # Use strftime to compare dates safely or compare directly if dates are strings
                cursor.execute("SELECT user_id FROM sessions WHERE token = ?", (token,))
                row = cursor.fetchone()
                if row:
                    user_id = row[0]
                conn.close()

            name = body.get('name', '').strip()
            poi_type = body.get('type', '').strip()
            lat = body.get('lat')
            lng = body.get('lng')
            rating = body.get('rating')
            description = body.get('description', '').strip()

            if not name or not poi_type or lat is None or lng is None or rating is None:
                self.send_json({"error": "Missing required POI fields"}, 400)
                return

            try:
                lat = float(lat)
                lng = float(lng)
                rating = float(rating)
            except ValueError:
                self.send_json({"error": "Lat, Lng, and Rating must be numbers"}, 400)
                return

            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            try:
                cursor.execute("""
                    INSERT INTO pois (name, type, lat, lng, rating, description, created_by)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (name, poi_type, lat, lng, rating, description, user_id))
                poi_id = cursor.lastrowid
                conn.commit()
                conn.close()
                self.send_json({
                    "status": "success",
                    "poi": {
                        "id": f"custom_{poi_id}",
                        "name": name,
                        "type": poi_type,
                        "lat": lat,
                        "lng": lng,
                        "rating": rating,
                        "description": description,
                        "status": "Highly Recommended" if rating >= 4.5 else ("Not Recommended" if rating < 3.8 else "Average")
                    }
                }, 201)
            except sqlite3.Error as e:
                conn.close()
                self.send_json({"error": f"Database error: {str(e)}"}, 500)
            return

        # 2. API: Login
        elif path == "/api/login":
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')

            if not email or not password:
                self.send_json({"error": "Email and password are required"}, 400)
                return

            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            
            # Fetch user
            cursor.execute("SELECT id, name FROM users WHERE email = ?", (email,))
            row = cursor.fetchone()
            
            if not row:
                # Auto-register new user if email doesn't exist yet
                if len(password) < 6:
                    conn.close()
                    self.send_json({"error": "Password must be at least 6 characters for automatic registration"}, 400)
                    return
                salt = uuid.uuid4().hex
                pw_hash_db = hash_password(password, salt)
                name = email.split('@')[0].capitalize()
                try:
                    cursor.execute("""
                        INSERT INTO users (name, email, password_hash, salt) 
                        VALUES (?, ?, ?, ?)
                    """, (name, email, pw_hash_db, salt))
                    conn.commit()
                    user_id = cursor.lastrowid
                except sqlite3.Error as e:
                    conn.close()
                    self.send_json({"error": f"Database error creating user: {str(e)}"}, 500)
                    return
            else:
                user_id, name = row
                # Update password on the fly to match whatever was typed
                salt = uuid.uuid4().hex
                pw_hash_db = hash_password(password, salt)
                try:
                    cursor.execute("""
                        UPDATE users SET password_hash = ?, salt = ? WHERE id = ?
                    """, (pw_hash_db, salt, user_id))
                    conn.commit()
                except sqlite3.Error:
                    pass

            # Create session
            token = uuid.uuid4().hex
            expires_at = datetime.now() + timedelta(days=7)
            
            try:
                cursor.execute("""
                    INSERT INTO sessions (token, user_id, expires_at) 
                    VALUES (?, ?, ?)
                """, (token, user_id, expires_at))
                conn.commit()
                conn.close()
                
                # Set Cookie header
                cookie_str = f"session_token={token}; Path=/; HttpOnly; Max-Age=604800; SameSite=Lax"
                self.send_json({
                    "status": "success",
                    "user": {"id": user_id, "name": name, "email": email}
                }, 200, {"Set-Cookie": cookie_str})
                
            except sqlite3.Error as e:
                conn.close()
                self.send_json({"error": f"Database error: {str(e)}"}, 500)
            return

        # 3. API: Logout
        elif path == "/api/logout":
            cookies = parse_cookies(self.headers.get('Cookie', ''))
            token = cookies.get('session_token')
            
            if token:
                conn = sqlite3.connect(DB_FILE)
                cursor = conn.cursor()
                cursor.execute("DELETE FROM sessions WHERE token = ?", (token,))
                conn.commit()
                conn.close()
                
            # Clear Cookie
            cookie_str = "session_token=; Path=/; HttpOnly; Max-Age=0"
            self.send_json({"status": "success"}, 200, {"Set-Cookie": cookie_str})
            return

        # 4. API: Send OTP
        elif path == "/api/otp/send":
            phone = body.get('phone', '').strip()
            # Simple validation: length >= 10 and digits
            cleaned_phone = "".join(c for c in phone if c.isdigit())
            if not cleaned_phone or len(cleaned_phone) < 10:
                self.send_json({"error": "Invalid phone number format. Please enter at least 10 digits."}, 400)
                return
            
            # Generate random 6-digit OTP
            import random
            otp = f"{random.randint(100000, 999999)}"
            
            # Store with 5-minute expiry
            OTP_STORE[cleaned_phone] = {
                "otp": otp,
                "expires_at": datetime.now() + timedelta(minutes=5)
            }
            
            print(f"\n[MOCK OTP] Sent OTP {otp} to phone {cleaned_phone}\n")
            
            # Return status and OTP for mock verification ease
            self.send_json({
                "status": "success",
                "message": "OTP sent successfully (mock mode)",
                "otp": otp
            })
            return

        # 5. API: Login with OTP
        elif path == "/api/otp/login":
            phone = body.get('phone', '').strip()
            otp = body.get('otp', '').strip()
            
            cleaned_phone = "".join(c for c in phone if c.isdigit())
            if not cleaned_phone or not otp:
                self.send_json({"error": "Phone number and OTP are required"}, 400)
                return
                
            otp_record = OTP_STORE.get(cleaned_phone)
            if not otp_record:
                self.send_json({"error": "No OTP requested for this phone number"}, 400)
                return
                
            if datetime.now() > otp_record["expires_at"]:
                del OTP_STORE[cleaned_phone]
                self.send_json({"error": "OTP has expired. Please request a new one."}, 401)
                return
                
            if otp_record["otp"] != otp:
                self.send_json({"error": "Incorrect OTP code. Please try again."}, 401)
                return
                
            # Clear OTP
            del OTP_STORE[cleaned_phone]
            
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            
            # Check if user exists by phone
            cursor.execute("SELECT id, name, email FROM users WHERE phone = ?", (cleaned_phone,))
            row = cursor.fetchone()
            
            if row:
                user_id, name, email = row
            else:
                # Register new user automatically
                name = f"Phone User ({cleaned_phone[-4:]})"
                email = f"phone_{cleaned_phone}@mapsphere.local"
                salt = uuid.uuid4().hex
                pw_hash = hash_password(uuid.uuid4().hex, salt)
                
                try:
                    cursor.execute("""
                        INSERT INTO users (name, email, password_hash, salt, phone)
                        VALUES (?, ?, ?, ?, ?)
                    """, (name, email, pw_hash, salt, cleaned_phone))
                    user_id = cursor.lastrowid
                    conn.commit()
                except sqlite3.Error as e:
                    conn.close()
                    self.send_json({"error": f"Database error creating user: {str(e)}"}, 500)
                    return
            
            # Create session
            token = uuid.uuid4().hex
            expires_at = datetime.now() + timedelta(days=7)
            
            try:
                cursor.execute("""
                    INSERT INTO sessions (token, user_id, expires_at) 
                    VALUES (?, ?, ?)
                """, (token, user_id, expires_at))
                conn.commit()
                conn.close()
                
                # Set Cookie header
                cookie_str = f"session_token={token}; Path=/; HttpOnly; Max-Age=604800; SameSite=Lax"
                self.send_json({
                    "status": "success",
                    "user": {"id": user_id, "name": name, "email": email}
                }, 200, {"Set-Cookie": cookie_str})
                
            except sqlite3.Error as e:
                conn.close()
                self.send_json({"error": f"Database error creating session: {str(e)}"}, 500)
            return

        # Path not found
        self.send_json({"error": "Endpoint not found"}, 404)

def run_server():
    init_db()
    
    class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
        allow_reuse_address = True

    server_address = ('0.0.0.0', PORT)
    httpd = ThreadingHTTPServer(server_address, MapSphereHandler)
    print(f"MapSphere Server running on port {PORT}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
