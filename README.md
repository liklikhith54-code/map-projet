# MapSphere | Spatial Intelligence Platform

A modern, full-stack Geographic Information System (GIS) application named **"Get your way"** that features real-time search suggestions, interactive mapping layers, custom category filtering, and an integrated smart assistant chatbot.

---

## 🌟 Features

### 🖥️ Frontend (Client-Side)
- **Interactive Leaflet Map**: Rich geographical visualization with zoom/pan capabilities.
- **Custom Categorized Markers**: High-visibility orange pulsing markers representing towns/villages, and color-coded markers for hotels (purple), schools (green), and restaurants (cyan).
- **Interactive Sidebar Explorer**: Dynamically synchronized with the active map viewport, featuring filters for Villages, Hotels, Schools, and Restaurants.
- **Real-Time Autocomplete Search**: Interactive search dropdown offering live database matching suggestions.
- **Smart Chatbot Assistant**: An inline chatbot suggesting closest locations (hotels, schools, restaurants) sorted by proximity, complete with click-to-fly (📍 Pan to Place) links and custom recommendation cards.
- **Pulsing Highlight Pins**: Search result landing drops a temporary, high-visibility red pulsing pinpoint at the destination.
- **Responsive Layout**: Mobile-first design featuring collapsible sidebars and multi-row header configurations for smaller screen dimensions.

### ⚙️ Backend (Server-Side)
- **Python Multi-Threaded HTTP Server**: A light, native HTTP server built with standard python libraries.
- **SQLite Database Integration**: Local database storing users, sessions, and points of interest (POIs).
- **Session-Based Authentication**: Secure registration, login session tokens, cookie handling, and automatic expiration.
- **Mock OTP Login Flow**: Integrated login option using 6-digit mock OTP SMS codes sent directly via terminal telemetry logs.
- **Automatic Test Credential Acceptance**: Testing-friendly login handler that automatically registers or updates credentials on any input.

---

## 📁 Repository Structure

```text
├── index.html          # Frontend layout, modal screens, explorer, and chatbot structures
├── style.css           # Custom stylesheets, glassmorphic themes, and pulsing marker animations
├── script.js          # Core map operations, autocomplete search, chatbot logic, and API calls
├── server.py           # Python HTTP server, sqlite schema initialization, and API endpoints
├── mapsphere.db        # SQLite database storing users, sessions, and custom POI markers
├── .gitignore          # File list to prevent tracking IDE folders and temporary system logs
└── README.md           # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.x
- Any web browser

### Running Locally
1. Start the backend Python server:
   ```bash
   python server.py
   ```
2. Open your browser and navigate to:
   ```text
   http://127.0.0.1:8080
   ```

### Accessing Publicly (via SSH Tunnel)
Expose the port `8080` to the internet using a Serveo tunnel:
```bash
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=60 -R 80:127.0.0.1:8080 serveo.net
```
*(The command will print your temporary public URL).*
