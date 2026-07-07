/**
 * MapSphere Spatial Intelligence Platform
 * Client-Side Interactive Engine v2
 */

// Dynamic API URL Resolver
function getApiUrl(endpoint) {
  if (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') || window.location.protocol === 'file:') {
    // If running locally but not on port 8080 (e.g. Live Server on port 5500, or raw file:///), point to local python server on port 8080
    if (!window.location.origin.includes(':8080')) {
      return 'http://127.0.0.1:8080' + endpoint;
    }
  }
  return endpoint;
}

let clientSideOnly = false;

async function checkBackendAvailability() {
  try {
    const response = await fetch(getApiUrl('/api/session'));
    if (response.ok || response.status === 401) {
      clientSideOnly = false;
      console.log("MapSphere Backend is active. Using full-stack mode.");
    } else {
      clientSideOnly = true;
      console.warn("MapSphere Backend returned error status. Using client-side fallback mode.");
    }
  } catch (err) {
    clientSideOnly = true;
    console.warn("MapSphere Backend is unreachable. Using client-side fallback mode.", err);
  }
}

function mockApiCall(endpoint, options = {}) {
  let body = {};
  if (options.body) {
    try {
      body = JSON.parse(options.body);
    } catch(e) {}
  }
  
  let responseData = {};
  let status = 200;
  
  if (endpoint === '/api/session') {
    const savedUser = localStorage.getItem('mapsphere_user_session');
    if (savedUser) {
      responseData = { status: 'success', user: JSON.parse(savedUser) };
      status = 200;
    } else {
      responseData = { error: 'No active session' };
      status = 401;
    }
  } 
  else if (endpoint === '/api/login') {
    const email = body.email || 'guest@mapsphere.local';
    const name = email.split('@')[0].split('.')[0];
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    
    responseData = {
      status: 'success',
      user: { id: 999, name: capitalizedName, email: email }
    };
    localStorage.setItem('mapsphere_user_session', JSON.stringify(responseData.user));
    status = 200;
  } 
  else if (endpoint === '/api/register') {
    const name = body.name || 'New User';
    const email = body.email || 'guest@mapsphere.local';
    
    responseData = {
      status: 'success',
      user: { id: 999, name: name, email: email }
    };
    localStorage.setItem('mapsphere_user_session', JSON.stringify(responseData.user));
    status = 201;
  } 
  else if (endpoint === '/api/logout') {
    localStorage.removeItem('mapsphere_user_session');
    responseData = { status: 'success' };
    status = 200;
  } 
  else if (endpoint === '/api/otp/send') {
    responseData = {
      status: 'success',
      message: 'OTP sent (mock offline mode)',
      otp: '123456'
    };
    status = 200;
  } 
  else if (endpoint === '/api/otp/login') {
    responseData = {
      status: 'success',
      user: { id: 999, name: 'Phone User', email: 'phone@mapsphere.local' }
    };
    localStorage.setItem('mapsphere_user_session', JSON.stringify(responseData.user));
    status = 200;
  } 
  else if (endpoint === '/api/pois') {
    if (options.method === 'POST') {
      const customPois = JSON.parse(localStorage.getItem('mapsphere_custom_pois') || '[]');
      const newPoi = {
        id: `custom_${Date.now()}`,
        name: body.name,
        type: body.type,
        lat: parseFloat(body.lat),
        lng: parseFloat(body.lng),
        rating: parseFloat(body.rating),
        description: body.description,
        status: parseFloat(body.rating) >= 4.5 ? "Highly Recommended" : (parseFloat(body.rating) < 3.8 ? "Not Recommended" : "Average")
      };
      customPois.push(newPoi);
      localStorage.setItem('mapsphere_custom_pois', JSON.stringify(customPois));
      responseData = { status: 'success', poi: newPoi };
      status = 201;
    } else {
      const customPois = JSON.parse(localStorage.getItem('mapsphere_custom_pois') || '[]');
      responseData = customPois;
      status = 200;
    }
  }

  return {
    ok: status >= 200 && status < 300,
    status: status,
    json: async () => responseData,
    text: async () => JSON.stringify(responseData)
  };
}

async function safeFetch(endpoint, options = {}) {
  if (clientSideOnly) {
    return mockApiCall(endpoint, options);
  }
  
  try {
    const response = await fetch(getApiUrl(endpoint), options);
    if (response.status === 404) {
      console.warn(`Backend returned 404 for ${endpoint}. Falling back to client-side simulation.`);
      clientSideOnly = true;
      return mockApiCall(endpoint, options);
    }
    return response;
  } catch (err) {
    console.warn(`Backend connection failed for ${endpoint}. Falling back to client-side simulation.`, err);
    clientSideOnly = true;
    return mockApiCall(endpoint, options);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  initBackgroundCanvas();
  startGlobeVisualizer();
  await checkBackendAvailability();
  initFormInteractivity();
  initMockDashboard();
  checkSession(); // Enable session validation on startup
});

/* ==========================================================================
   1. CONSTELLATION NODE BACKGROUND
   ========================================================================== */
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  
  let particles = [];
  let mouse = { x: null, y: null, radius: 150 };
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
  }
  
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 1;
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
      if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
      
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          this.x -= (dx / distance) * force * 1.2;
          this.y -= (dy / distance) * force * 1.2;
        }
      }
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 242, 254, 0.35)';
      ctx.fill();
    }
  }
  
  function initParticles() {
    particles = [];
    const density = Math.floor((canvas.width * canvas.height) / 15000);
    const count = Math.min(Math.max(density, 40), 120);
    
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }
  
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < 110) {
          const alpha = (110 - distance) / 110 * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
      
      if (mouse.x !== null && mouse.y !== null) {
        const dx = particles[i].x - mouse.x;
        const dy = particles[i].y - mouse.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < mouse.radius) {
          const alpha = (mouse.radius - distance) / mouse.radius * 0.25;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(127, 0, 255, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    drawConnections();
    requestAnimationFrame(animate);
  }
  
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });
  
  resizeCanvas();
  animate();
}

/* ==========================================================================
   2. 3D SPINNING DOT-GLOBE (UNIFIED CARD LOGO)
   ========================================================================== */
function startGlobeVisualizer() {
  const canvas = document.getElementById('globe-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const width = canvas.width;
  const height = canvas.height;
  const radius = 32;
  
  let angleY = 0;
  
  // Plotting points on a sphere surface using Fibonacci Spiral algorithm
  const points = [];
  const count = 150;
  for (let i = 0; i < count; i++) {
    const theta = Math.acos(1 - 2 * i / count);
    const phi = Math.PI * (1 + Math.sqrt(5)) * i;
    
    const x = radius * Math.sin(theta) * Math.cos(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi);
    const z = radius * Math.cos(theta);
    
    points.push({ x, y, z });
  }
  
  function render() {
    ctx.clearRect(0, 0, width, height);
    
    // Atmospheric outer ring glow
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 242, 254, 0.02)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    angleY += 0.006; // Rotate Y speed
    
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    
    // Transform coordinates and sort by Z-depth
    const projected = points.map(p => {
      const xRot = p.x * cosY - p.z * sinY;
      const zRot = p.x * sinY + p.z * cosY;
      
      return {
        x: width / 2 + xRot,
        y: height / 2 + p.y,
        z: zRot
      };
    });
    
    projected.sort((a, b) => a.z - b.z);
    
    // Render projected nodes
    projected.forEach((p, idx) => {
      // Map depth Z to size and alpha values
      const opacity = (p.z + radius) / (2 * radius) * 0.75 + 0.15;
      const dotSize = (p.z + radius) / (2 * radius) * 1.5 + 0.5;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, dotSize, 0, Math.PI * 2);
      
      // Give a few random points an accent purple/cyan pulsing state
      if (idx === 120 || idx === 80) {
        ctx.fillStyle = `rgba(127, 0, 255, ${opacity})`;
        ctx.shadowColor = 'rgba(127, 0, 255, 0.8)';
        ctx.shadowBlur = 4;
        ctx.arc(p.x, p.y, dotSize + 1, 0, Math.PI * 2);
      } else {
        ctx.fillStyle = `rgba(0, 242, 254, ${opacity})`;
        ctx.shadowBlur = 0;
      }
      
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    });
    
    requestAnimationFrame(render);
  }
  
  render();
}

/* ==========================================================================
   3. AUTO-AUTHENTICATION (SESSION COOKIE CHECK)
   ========================================================================== */
async function checkSession() {
  try {
    const response = await safeFetch('/api/session');
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success') {
        // Bypass login screen
        document.getElementById('auth-container').classList.add('hide');
        enterDashboard(data.user.name);
      }
    }
  } catch (error) {
    console.warn('API Session validation skipped or unavailable:', error);
  }
}

/* ==========================================================================
   4. FORM INTERACTIVE CONTROL & API HOOKS
   ========================================================================== */
function initFormInteractivity() {
  const card = document.getElementById('auth-card');
  const forms = {
    login: document.getElementById('login-form'),
    signup: document.getElementById('signup-form'),
    reset: document.getElementById('reset-form'),
    phone: document.getElementById('phone-form')
  };
  
  let countdownInterval = null;
  let otpCountdown = 0;
  
  function switchPanel(panelId) {
    const panels = document.querySelectorAll('.form-panel');
    const targetPanel = document.getElementById(panelId);
    
    card.style.height = card.offsetHeight + 'px';
    panels.forEach(p => p.classList.remove('active'));
    
    targetPanel.style.display = 'flex';
    targetPanel.style.opacity = '0';
    targetPanel.style.position = 'absolute';
    targetPanel.style.width = (card.clientWidth - 80) + 'px';
    
    // Unified Logo area height is static now, adjust target size offsets
    const targetHeight = targetPanel.scrollHeight + 148; 
    
    targetPanel.style.display = '';
    targetPanel.style.opacity = '';
    targetPanel.style.position = '';
    targetPanel.style.width = '';
    
    setTimeout(() => {
      card.style.height = targetHeight + 'px';
      targetPanel.classList.add('active');
    }, 20);
    
    setTimeout(() => {
      card.style.height = '';
    }, 450);
  }

  // Toggles
  document.getElementById('goto-signup').addEventListener('click', () => switchPanel('signup-panel'));
  document.getElementById('goto-reset').addEventListener('click', () => switchPanel('reset-panel'));
  document.getElementById('goto-login-from-signup').addEventListener('click', () => switchPanel('login-panel'));
  document.getElementById('goto-login-from-reset').addEventListener('click', () => {
    document.getElementById('reset-success-box').classList.add('hide');
    document.getElementById('reset-form').classList.remove('hide');
    switchPanel('login-panel');
  });
  document.getElementById('goto-phone').addEventListener('click', () => switchPanel('phone-panel'));
  document.getElementById('goto-login-from-phone').addEventListener('click', () => {
    // Reset phone panel state
    document.getElementById('phone-number').value = '';
    document.getElementById('phone-otp').value = '';
    document.getElementById('otp-group').classList.add('hide');
    document.getElementById('otp-status-info').classList.add('hide');
    document.getElementById('phone-submit').disabled = true;
    if (countdownInterval) clearInterval(countdownInterval);
    document.getElementById('btn-send-otp').disabled = false;
    document.getElementById('btn-send-otp').textContent = 'Send OTP';
    document.getElementById('phone-number').closest('.input-group').classList.remove('invalid');
    document.getElementById('phone-otp').closest('.input-group').classList.remove('invalid');
    switchPanel('login-panel');
  });

  // Password visibility
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      const eyeIcon = btn.querySelector('.eye-icon');
      const eyeOffIcon = btn.querySelector('.eye-off-icon');
      
      if (input.type === 'password') {
        input.type = 'text';
        eyeIcon.classList.add('hide');
        eyeOffIcon.classList.remove('hide');
      } else {
        input.type = 'password';
        eyeIcon.classList.remove('hide');
        eyeOffIcon.classList.add('hide');
      }
    });
  });

  document.querySelectorAll('.input-wrapper input').forEach(input => {
    input.addEventListener('input', () => {
      input.closest('.input-group').classList.remove('invalid');
    });
  });

  // Password Strength
  const signupPass = document.getElementById('signup-password');
  const strengthBar = document.getElementById('strength-bar');
  const strengthIndicator = signupPass.closest('.input-group').querySelector('.strength-indicator');

  signupPass.addEventListener('input', () => {
    const val = signupPass.value;
    if (val === '') {
      strengthIndicator.style.display = 'none';
      return;
    }
    
    strengthIndicator.style.display = 'block';
    let strength = 0;
    if (val.length >= 8) strength++;
    if (/[a-zA-Z]/.test(val)) strength++;
    if (/[0-9]/.test(val)) strength++;
    if (/[^a-zA-Z0-9]/.test(val)) strength++;
    
    strengthBar.style.width = (strength * 25) + '%';
    
    if (strength <= 1) {
      strengthBar.style.backgroundColor = 'var(--text-error)';
    } else if (strength === 2 || strength === 3) {
      strengthBar.style.backgroundColor = 'var(--text-warning)';
    } else {
      strengthBar.style.backgroundColor = 'var(--text-success)';
    }
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function shakeCard() {
    card.classList.add('shake');
    setTimeout(() => card.classList.remove('shake'), 400);
  }

  // API Call: LOGIN
  forms.login.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email');
    const pass = document.getElementById('login-password');
    let isValid = true;

    if (!isValidEmail(email.value)) {
      email.closest('.input-group').classList.add('invalid');
      isValid = false;
    }
    if (pass.value.length < 6) {
      pass.closest('.input-group').classList.add('invalid');
      isValid = false;
    }

    if (!isValid) {
      shakeCard();
      return;
    }

    const btn = document.getElementById('login-submit');
    const text = btn.querySelector('.btn-text');
    const spinner = btn.querySelector('.spinner');

    btn.disabled = true;
    text.classList.add('hide');
    spinner.classList.remove('hide');

    try {
      const response = await safeFetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value, password: pass.value })
      });
      
      const resData = await response.json();
      
      if (response.ok) {
        showSuccessOverlay('Welcome to Get your way', () => {
          enterDashboard(resData.user.name);
        });
      } else {
        // Render login error API messaging
        pass.closest('.input-group').classList.add('invalid');
        document.getElementById('login-password-error').textContent = resData.error || 'Invalid credentials';
        shakeCard();
      }
    } catch (err) {
      console.error(err);
      pass.closest('.input-group').classList.add('invalid');
      document.getElementById('login-password-error').textContent = 'Server connection failed';
      shakeCard();
    } finally {
      btn.disabled = false;
      text.classList.remove('hide');
      spinner.classList.add('hide');
    }
  });

  // API Call: SIGN UP
  forms.signup.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name');
    const email = document.getElementById('signup-email');
    const pass = document.getElementById('signup-password');
    const terms = document.getElementById('terms-accept');
    let isValid = true;

    if (name.value.trim() === '') {
      name.closest('.input-group').classList.add('invalid');
      isValid = false;
    }
    if (!isValidEmail(email.value)) {
      email.closest('.input-group').classList.add('invalid');
      isValid = false;
    }
    if (pass.value.length < 8) {
      pass.closest('.input-group').classList.add('invalid');
      isValid = false;
    }
    if (!terms.checked) {
      document.getElementById('terms-error').style.display = 'block';
      isValid = false;
    } else {
      document.getElementById('terms-error').style.display = 'none';
    }

    if (!isValid) {
      shakeCard();
      return;
    }

    const btn = document.getElementById('signup-submit');
    const text = btn.querySelector('.btn-text');
    const spinner = btn.querySelector('.spinner');

    btn.disabled = true;
    text.classList.add('hide');
    spinner.classList.remove('hide');

    try {
      const response = await safeFetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.value, email: email.value, password: pass.value })
      });
      
      const resData = await response.json();
      
      if (response.status === 201) {
        showSuccessOverlay('Profile Charted', () => {
          enterDashboard(resData.user.name);
        });
      } else {
        // Render sign up duplicate API message
        email.closest('.input-group').classList.add('invalid');
        document.getElementById('signup-email-error').textContent = resData.error || 'Registration failed';
        shakeCard();
      }
    } catch (err) {
      console.error(err);
      email.closest('.input-group').classList.add('invalid');
      document.getElementById('signup-email-error').textContent = 'Server connection failed';
      shakeCard();
    } finally {
      btn.disabled = false;
      text.classList.remove('hide');
      spinner.classList.add('hide');
    }
  });

  // Success Checkmark overlay injector
  function showSuccessOverlay(msgText, callback) {
    const successScreen = document.createElement('div');
    successScreen.className = 'auth-success-screen';
    successScreen.innerHTML = `
      <div class="checkmark-circle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div class="success-text">${msgText}</div>
    `;
    card.appendChild(successScreen);

    setTimeout(() => {
      const container = document.getElementById('auth-container');
      container.classList.add('shrink-card');
      
      setTimeout(() => {
        container.classList.add('hide');
        successScreen.remove();
        callback();
      }, 600);
    }, 1200);
  }

  // Password reset simulation
  forms.reset.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('reset-email');
    if (!isValidEmail(email.value)) {
      email.closest('.input-group').classList.add('invalid');
      shakeCard();
      return;
    }

    const submitBtn = document.getElementById('reset-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');

    submitBtn.disabled = true;
    btnText.classList.add('hide');
    spinner.classList.remove('hide');

    setTimeout(() => {
      submitBtn.disabled = false;
      btnText.classList.remove('hide');
      spinner.classList.add('hide');
      
      document.getElementById('sent-email-placeholder').textContent = email.value;
      forms.reset.classList.add('hide');
      
      const successBox = document.getElementById('reset-success-box');
      successBox.classList.remove('hide');
      
      const targetHeight = successBox.scrollHeight + 170;
      card.style.height = targetHeight + 'px';
      
      setTimeout(() => { card.style.height = ''; }, 450);
    }, 1200);
  });

  // OTP Form Interactive Logic
  const phoneInput = document.getElementById('phone-number');
  const otpInput = document.getElementById('phone-otp');
  const otpGroup = document.getElementById('otp-group');
  const sendOtpBtn = document.getElementById('btn-send-otp');
  const phoneSubmitBtn = document.getElementById('phone-submit');
  const otpStatusInfo = document.getElementById('otp-status-info');
  
  function startOtpCountdown() {
    otpCountdown = 30;
    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = `Resend (${otpCountdown}s)`;
    
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
      otpCountdown--;
      if (otpCountdown <= 0) {
        clearInterval(countdownInterval);
        sendOtpBtn.disabled = false;
        sendOtpBtn.textContent = 'Send OTP';
      } else {
        sendOtpBtn.textContent = `Resend (${otpCountdown}s)`;
      }
    }, 1000);
  }

  function validatePhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10;
  }

  // Handle Send OTP click
  sendOtpBtn.addEventListener('click', async () => {
    const phoneVal = phoneInput.value;
    if (!validatePhoneNumber(phoneVal)) {
      phoneInput.closest('.input-group').classList.add('invalid');
      shakeCard();
      return;
    }
    
    phoneInput.closest('.input-group').classList.remove('invalid');
    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = 'Sending...';
    
    try {
      const response = await safeFetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneVal })
      });
      
      const resData = await response.json();
      
      if (response.ok) {
        // Show OTP fields
        otpGroup.classList.remove('hide');
        otpStatusInfo.classList.remove('hide');
        otpStatusInfo.innerHTML = `OTP Sent! For mock testing, enter code: <strong>${resData.otp}</strong>`;
        
        // Enable submit button
        phoneSubmitBtn.disabled = false;
        
        // Start resend countdown
        startOtpCountdown();
        
        // Trigger card height recalculation if needed
        card.style.height = card.scrollHeight + 'px';
        setTimeout(() => card.style.height = '', 450);
      } else {
        phoneInput.closest('.input-group').classList.add('invalid');
        document.getElementById('phone-number-error').textContent = resData.error || 'Failed to send OTP';
        sendOtpBtn.disabled = false;
        sendOtpBtn.textContent = 'Send OTP';
        shakeCard();
      }
    } catch (err) {
      console.error(err);
      phoneInput.closest('.input-group').classList.add('invalid');
      document.getElementById('phone-number-error').textContent = 'Server connection failed';
      sendOtpBtn.disabled = false;
      sendOtpBtn.textContent = 'Send OTP';
      shakeCard();
    }
  });

  // Handle OTP Sign In Submit
  forms.phone.addEventListener('submit', async (e) => {
    e.preventDefault();
    const phoneVal = phoneInput.value;
    const otpVal = otpInput.value.trim();
    let isValid = true;
    
    if (!validatePhoneNumber(phoneVal)) {
      phoneInput.closest('.input-group').classList.add('invalid');
      isValid = false;
    }
    if (otpVal.length !== 6 || !/^\d+$/.test(otpVal)) {
      otpInput.closest('.input-group').classList.add('invalid');
      isValid = false;
    }
    
    if (!isValid) {
      shakeCard();
      return;
    }
    
    const textSpan = phoneSubmitBtn.querySelector('.btn-text');
    const spinner = phoneSubmitBtn.querySelector('.spinner');
    
    phoneSubmitBtn.disabled = true;
    textSpan.classList.add('hide');
    spinner.classList.remove('hide');
    
    try {
      const response = await safeFetch('/api/otp/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneVal, otp: otpVal })
      });
      
      const resData = await response.json();
      
      if (response.ok) {
        // Clear countdown
        if (countdownInterval) clearInterval(countdownInterval);
        
        showSuccessOverlay('Welcome to Get your way', () => {
          enterDashboard(resData.user.name);
        });
      } else {
        otpInput.closest('.input-group').classList.add('invalid');
        document.getElementById('phone-otp-error').textContent = resData.error || 'Incorrect OTP code';
        shakeCard();
      }
    } catch (err) {
      console.error(err);
      otpInput.closest('.input-group').classList.add('invalid');
      document.getElementById('phone-otp-error').textContent = 'Server connection failed';
      shakeCard();
    } finally {
      phoneSubmitBtn.disabled = false;
      textSpan.classList.remove('hide');
      spinner.classList.add('hide');
    }
  });
}

/* ==========================================================================
   5. REAL MAP & GPS VEHICLE TRACKER SIMULATOR (LEAFLET.JS)
   ========================================================================== */
let map = null;
let googleTileLayer = null;
let activeRouteLine = null;
let activeRouteTooltips = [];
let clickedCoords = null;
let markers = {};
const villageStreets = [
  "Grama Panchayat Road", "Mandir Street", "Bazaar Marg", 
  "School Link Road", "Kalyan Mandapam Lane", "Gandhi Path", 
  "Nehru Bypass Road", "Nala Street", "Station Road", 
  "Subhash Chandra Marg", "Post Office Link", "Temple Lane", 
  "Bada Bazar Road", "Riverbank Path", "Harijan Wada Road", 
  "Main Crossing Lane", "Kisan Marg", "Well Street"
];
let gpsIntervalId = null;
let statisticsIntervalId = null;

// Real-world coordinates routes around San Francisco
const trackerRoutes = {
  drone: [
    [37.7749, -122.4194], [37.7762, -122.4175], [37.7778, -122.4158],
    [37.7794, -122.4140], [37.7810, -122.4132], [37.7828, -122.4145],
    [37.7840, -122.4168], [37.7825, -122.4192], [37.7802, -122.4208],
    [37.7775, -122.4215], [37.7758, -122.4205]
  ],
  truck: [
    [37.7705, -122.4080], [37.7718, -122.4102], [37.7732, -122.4124],
    [37.7745, -122.4108], [37.7760, -122.4092], [37.7750, -122.4072],
    [37.7735, -122.4055], [37.7720, -122.4064]
  ],
  surveyor: [
    [37.7820, -122.4280], [37.7834, -122.4295], [37.7850, -122.4312],
    [37.7842, -122.4334], [37.7824, -122.4348], [37.7808, -122.4332],
    [37.7802, -122.4310], [37.7810, -122.4290]
  ]
};

const routeIndices = { drone: 0, truck: 0, surveyor: 0 };

let poiMarkersGroup = null;
let currentPOIs = [];
let allCustomPOIs = [];
let allMapPOIs = [];
let searchHighlightMarker = null;
let currentCategory = 'all';
let searchCenterName = 'Tumkur';
let trackerCenter = [13.3492, 77.1035];

function shiftTrackerRoutes(newLat, newLng) {
  const latDiff = newLat - trackerCenter[0];
  const lngDiff = newLng - trackerCenter[1];
  for (let k in trackerRoutes) {
    trackerRoutes[k] = trackerRoutes[k].map(p => [p[0] + latDiff, p[1] + lngDiff]);
  }
  trackerCenter = [newLat, newLng];
  
  // Update markers instantly if simulator is running
  if (markers.drone) markers.drone.setLatLng(trackerRoutes.drone[routeIndices.drone]);
  if (markers.truck) markers.truck.setLatLng(trackerRoutes.truck[routeIndices.truck]);
  if (markers.surveyor) markers.surveyor.setLatLng(trackerRoutes.surveyor[routeIndices.surveyor]);
}

function initLeafletMap() {
  if (map) return; // Map already loaded
  
  // Center of Tumkur region (user's PamPam map coordinates)
  map = L.map('leaflet-map', {
    zoomControl: false,
    attributionControl: false
  }).setView([13.3492, 77.1035], 12);
  
  // Google Maps street base tiles
  googleTileLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  }).addTo(map);
  
  // Initialize Map Layer switcher controls
  initMapLayerSwitcher();
  
  // Create layer group for POIs
  poiMarkersGroup = L.layerGroup().addTo(map);
  
  // Reposition zoom controls
  L.control.zoom({
    position: 'topright'
  }).addTo(map);
  
  // Track mouse coordinates hover event
  map.on('mousemove', (e) => {
    document.getElementById('map-coord').textContent = `LAT: ${e.latlng.lat.toFixed(4)} | LNG: ${e.latlng.lng.toFixed(4)}`;
  });
  
  // Dynamic Recenter button
  document.getElementById('map-recenter').addEventListener('click', () => {
    map.flyTo([13.3492, 77.1035], 12, { duration: 1.2 });
    addConsoleLog('RECENTERING TO TUMKUR REGION...', 'warning');
    searchCenterName = 'Tumkur';
    shiftTrackerRoutes(13.3492, 77.1035);
    updateNearbyExplorer(13.3492, 77.1035);
  });

  // Map drag/moveend listener to auto-regenerate POIs reactively
  map.on('moveend', () => {
    const center = map.getCenter();
    shiftTrackerRoutes(center.lat, center.lng);
    updateNearbyExplorer(center.lat, center.lng);
  });

  // Contextmenu listener for custom POIs
  map.on('contextmenu', (e) => {
    clickedCoords = e.latlng;
    const modal = document.getElementById('poi-modal');
    modal.classList.remove('hide');
    setTimeout(() => {
      document.getElementById('poi-name').focus();
    }, 50);
  });

  // Click on map to trigger street routing navigation simulator
  map.on('click', (e) => {
    // Check if we have active tracker Surveyor-Beta (markers.truck)
    const startMarker = markers.truck;
    if (!startMarker) return;
    
    const startLatLng = startMarker.getLatLng();
    const endLatLng = e.latlng;
    
    const pathNodes = solveDijkstraPath(startLatLng, endLatLng);
    
    // Clear old route line
    if (activeRouteLine) {
      map.removeLayer(activeRouteLine);
    }
    // Clear old route tooltips
    if (activeRouteTooltips && activeRouteTooltips.length > 0) {
      activeRouteTooltips.forEach(t => map.removeLayer(t));
    }
    activeRouteTooltips = [];
    
    // Draw neon route line
    const coords = pathNodes.map(n => [n.lat, n.lng]);
    
    activeRouteLine = L.polyline(coords, {
      color: '#00f2fe',
      weight: 4,
      opacity: 0.8,
      dashArray: '8, 8',
      className: 'neon-route-polyline'
    }).addTo(map);
    
    // Create tooltips display along the path segments
    const segmentNames = [];
    for (let i = 0; i < pathNodes.length - 1; i++) {
      const p1 = pathNodes[i];
      const p2 = pathNodes[i+1];
      const midLat = (p1.lat + p2.lat) / 2;
      const midLng = (p1.lng + p2.lng) / 2;
      
      // Seed index deterministically
      const streetIndex = Math.abs(Math.round(p1.lat * 100000 + p2.lng * 100000)) % villageStreets.length;
      const streetName = villageStreets[streetIndex];
      segmentNames.push(streetName);
      
      // Bind floating street label tooltip
      const tooltip = L.tooltip({
        permanent: true,
        direction: 'center',
        className: 'road-label'
      })
      .setLatLng([midLat, midLng])
      .setContent(streetName)
      .addTo(map);
      
      activeRouteTooltips.push(tooltip);
    }
    
    // Animate map view to path
    map.fitBounds(activeRouteLine.getBounds(), { padding: [40, 40], maxZoom: 16 });
    
    // Output directions to chat assistant console log
    addConsoleLog('RESOLVING LOCAL STREET GRID ROUTE...', 'warning');
    setTimeout(() => {
      addConsoleLog('ROUTE COMPLETED ALONG VILLAGE STREETS.', 'success');
      if (segmentNames.length > 0) {
        addConsoleLog(`1. Head onto ${segmentNames[0]} for 200m`, 'success');
      }
      if (segmentNames.length > 1) {
        addConsoleLog(`2. Turn onto ${segmentNames[1]} at intersection`, 'success');
      }
      if (segmentNames.length > 2) {
        addConsoleLog(`3. Continue onto ${segmentNames[2]} to reach destination`, 'success');
      } else {
        addConsoleLog(`3. Reach destination on left`, 'success');
      }
    }, 550);
  });

  // Setup search bar controls
  initSearchControls();

  // Setup custom POI form controls
  initCustomPOIHandlers();

  // Setup explorer filters
  initExplorerFilters();

  // Setup suggestion console
  initSuggestionConsole();

  // Shift trackers to Tumkur on startup
  shiftTrackerRoutes(13.3492, 77.1035);

  // Generate initial POIs around center
  updateNearbyExplorer(13.3492, 77.1035);
}

function initMapLayerSwitcher() {
  const tabs = document.querySelectorAll('.layer-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const layerType = tab.getAttribute('data-layer');
      let url = '';
      
      if (layerType === 'streets') {
        url = 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
      } else if (layerType === 'satellite') {
        url = 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      } else if (layerType === 'terrain') {
        url = 'https://{s}.google.com/vt/lyrs=t&x={x}&y={y}&z={z}';
      }
      
      if (googleTileLayer && url) {
        googleTileLayer.setUrl(url);
        addConsoleLog(`SWITCHED MAP LAYER TO: ${layerType.toUpperCase()}`, 'success');
      }
    });
  });
}

function startGPSSimulator() {
  const logStream = document.getElementById('log-stream');
  
  // Custom pulsing markers builder
  function createPulsingMarker(colorClass) {
    return L.divIcon({
      html: `<div class="custom-map-marker marker-${colorClass}">
               <div class="marker-pulse"></div>
               <div class="marker-core"></div>
             </div>`,
      className: '',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  }

  // Instantiate agents on map
  markers.drone = L.marker(trackerRoutes.drone[0], {
    icon: createPulsingMarker('cyan')
  }).addTo(map).bindPopup('<h4>Drone-Alpha</h4>Status: Cruising<br>Alt: 140m<br>Speed: 42 km/h');

  markers.truck = L.marker(trackerRoutes.truck[0], {
    icon: createPulsingMarker('purple')
  }).addTo(map).bindPopup('<h4>Surveyor-Beta</h4>Status: Tracking<br>Speed: 18 km/h');

  markers.surveyor = L.marker(trackerRoutes.surveyor[0], {
    icon: createPulsingMarker('green')
  }).addTo(map).bindPopup('<h4>Unit-Gamma</h4>Status: Collecting Data<br>Accuracy: 99.8%');

  // Animation intervals
  gpsIntervalId = setInterval(() => {
    // 1. Move Drone
    routeIndices.drone = (routeIndices.drone + 1) % trackerRoutes.drone.length;
    const dronePos = trackerRoutes.drone[routeIndices.drone];
    markers.drone.setLatLng(dronePos);

    // 2. Move Truck
    routeIndices.truck = (routeIndices.truck + 1) % trackerRoutes.truck.length;
    const truckPos = trackerRoutes.truck[routeIndices.truck];
    markers.truck.setLatLng(truckPos);

    // 3. Move Surveyor
    routeIndices.surveyor = (routeIndices.surveyor + 1) % trackerRoutes.surveyor.length;
    const surveyorPos = trackerRoutes.surveyor[routeIndices.surveyor];
    markers.surveyor.setLatLng(surveyorPos);
  }, 2200);

  // Statistics counter & ping emulator
  let totalPackets = 2481;
  statisticsIntervalId = setInterval(() => {
    totalPackets += Math.floor(Math.random() * 4 + 1);
    document.getElementById('stat-packets').textContent = totalPackets.toLocaleString();
    
    const latency = Math.floor(10 + Math.random() * 8);
    document.getElementById('ping-latency').textContent = `${latency} ms`;
  }, 1500);
}

function stopGPSSimulator() {
  if (gpsIntervalId) clearInterval(gpsIntervalId);
  if (statisticsIntervalId) clearInterval(statisticsIntervalId);
  
  // Prune map layers
  if (markers.drone) map.removeLayer(markers.drone);
  if (markers.truck) map.removeLayer(markers.truck);
  if (markers.surveyor) map.removeLayer(markers.surveyor);
  markers = {};
}

function addConsoleLog(text, type) {
  const chatLog = document.getElementById('suggestion-chat-log');
  if (!chatLog) return;
  
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const cssClass = type === 'success' ? 'assistant-msg' : (type === 'warning' ? 'system-msg' : 'system-msg');
  
  const div = document.createElement('div');
  div.className = `chat-line ${cssClass}`;
  div.textContent = `[${time}] ${text}`;
  
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
  
  if (chatLog.children.length > 30) {
    chatLog.removeChild(chatLog.firstChild);
  }
}

/* ==========================================================================
   6. MOCK DASHBOARD WRAPPER
   ========================================================================== */
function enterDashboard(username) {
  const chatLog = document.getElementById('suggestion-chat-log');
  if (chatLog) {
    chatLog.innerHTML = `
      <div class="chat-line system-msg">[${new Date().toLocaleTimeString()}] INJECTING PROFILE: ${username.toUpperCase()}...</div>
      <div class="chat-line system-msg">[${new Date().toLocaleTimeString()}] SECURING PERSISTENT DB ACCESS...</div>
      <div class="chat-line assistant-msg">[${new Date().toLocaleTimeString()}] AUTHORIZATION GRANTED. STREAMING ACTIVE.</div>
    `;
  }

  document.getElementById('welcome-user-name').textContent = username;
  document.getElementById('profile-avatar').textContent = username.charAt(0).toUpperCase();

  const db = document.getElementById('dashboard-view');
  db.classList.remove('hide');
  db.offsetWidth; 
  db.classList.add('reveal');

  // Trigger leaflet layout sync
  setTimeout(() => {
    initLeafletMap();
    map.invalidateSize(); // Force resize repaint
    startGPSSimulator();
  }, 100);
}

async function exitDashboard() {
  const db = document.getElementById('dashboard-view');
  db.classList.remove('reveal');
  stopGPSSimulator();

  try {
    // Call server logout to invalidate SQLite token session
    await safeFetch('/api/logout', { method: 'POST' });
  } catch (e) {
    console.warn('API Logout error:', e);
  }
  
  setTimeout(() => {
    db.classList.add('hide');
    const auth = document.getElementById('auth-container');
    auth.classList.remove('hide');
    auth.offsetWidth;
    auth.classList.remove('shrink-card');
    
    // Clear forms
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('signup-name').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
    document.getElementById('terms-accept').checked = false;
  }, 600);
}

function initMockDashboard() {
  document.getElementById('logout-btn').addEventListener('click', exitDashboard);
  
  const sidebarLogout = document.getElementById('logout-btn-sidebar');
  if (sidebarLogout) {
    sidebarLogout.addEventListener('click', exitDashboard);
  }
  
  const chatbotLogout = document.getElementById('logout-btn-chatbot');
  if (chatbotLogout) {
    chatbotLogout.addEventListener('click', exitDashboard);
  }
}

/* ==========================================================================
   7. GEOLOCATION SEARCH, POI EXPLORER, & MOCK CHATBOT ASSISTANT
   ========================================================================== */

const poiNames = {
  hotel: [
    "Grand Plaza Hotel", "Apex Luxury Suites", "The Meridian Inn", 
    "Urban Oasis Stay", "Boutique Central", "Summit View Lodge", 
    "Elysian Heights Hotel", "Standard Regency", "Crown Park Hotel"
  ],
  school: [
    "St. Mary's Academy", "Oakridge Prep High", "Summit Charter School", 
    "Pinecrest STEM Academy", "Metropolitan Tech", "Greenwood Montessori",
    "Jefferson Community School", "SF Heights Elementary"
  ],
  restaurant: [
    "Ocean Breeze Diner", "The Golden Grill", "Sizzle & Spice", 
    "Bistro 101", "Verde Vegan Kitchen", "Bella Italia", 
    "Sushi Wave", "The Roast & Toast Cafe", "Diner Deluxe"
  ]
};

const localLocations = {
  "india": { lat: 20.5937, lon: 78.9629, zoom: 5, name: "India" },
  "tumkur": { lat: 13.3492, lon: 77.1035, zoom: 12, name: "Tumkur" },
  "tumakuru": { lat: 13.3492, lon: 77.1035, zoom: 12, name: "Tumakuru" },
  "delhi": { lat: 28.6139, lon: 77.2090, zoom: 12, name: "Delhi" },
  "new delhi": { lat: 28.6139, lon: 77.2090, zoom: 12, name: "New Delhi" },
  "mumbai": { lat: 19.0760, lon: 72.8777, zoom: 11, name: "Mumbai" },
  "bangalore": { lat: 12.9716, lon: 77.5946, zoom: 12, name: "Bangalore" },
  "bengaluru": { lat: 12.9716, lon: 77.5946, zoom: 12, name: "Bengaluru" },
  "kolkata": { lat: 22.5726, lon: 88.3639, zoom: 12, name: "Kolkata" },
  "chennai": { lat: 13.0827, lon: 80.2707, zoom: 12, name: "Chennai" },
  "hyderabad": { lat: 17.3850, lon: 78.4867, zoom: 12, name: "Hyderabad" },
  "pune": { lat: 18.5204, lon: 73.8567, zoom: 12, name: "Pune" },
  "jaipur": { lat: 26.9124, lon: 75.7873, zoom: 12, name: "Jaipur" },
  "ahmedabad": { lat: 23.0225, lon: 72.5714, zoom: 12, name: "Ahmedabad" },
  "surat": { lat: 21.1702, lon: 72.8311, zoom: 12, name: "Surat" },
  "lucknow": { lat: 26.8467, lon: 80.9462, zoom: 12, name: "Lucknow" },
  "kanpur": { lat: 26.4499, lon: 80.3319, zoom: 12, name: "Kanpur" },
  "nagpur": { lat: 21.1458, lon: 79.0882, zoom: 12, name: "Nagpur" },
  "indore": { lat: 22.7196, lon: 75.8577, zoom: 12, name: "Indore" },
  "thane": { lat: 19.2183, lon: 72.9781, zoom: 12, name: "Thane" },
  "bhopal": { lat: 23.2599, lon: 77.4126, zoom: 12, name: "Bhopal" },
  "visakhapatnam": { lat: 17.6868, lon: 83.2185, zoom: 12, name: "Visakhapatnam" },
  "patna": { lat: 25.5941, lon: 85.1376, zoom: 12, name: "Patna" },
  "vadodara": { lat: 22.3072, lon: 73.1812, zoom: 12, name: "Vadodara" },
  "ghaziabad": { lat: 28.6692, lon: 77.4538, zoom: 12, name: "Ghaziabad" },
  "ludhiana": { lat: 30.9010, lon: 75.8573, zoom: 12, name: "Ludhiana" },
  "agra": { lat: 27.1767, lon: 78.0081, zoom: 12, name: "Agra" },
  "nashik": { lat: 19.9975, lon: 73.7898, zoom: 12, name: "Nashik" },
  "faridabad": { lat: 28.4089, lon: 77.3178, zoom: 12, name: "Faridabad" },
  "meerut": { lat: 28.9845, lon: 77.7064, zoom: 12, name: "Meerut" },
  "rajkot": { lat: 22.3039, lon: 70.8022, zoom: 12, name: "Rajkot" },
  "varanasi": { lat: 25.3176, lon: 82.9739, zoom: 12, name: "Varanasi" },
  "srinagar": { lat: 34.0837, lon: 74.7973, zoom: 12, name: "Srinagar" },
  "amritsar": { lat: 31.6340, lon: 74.8723, zoom: 12, name: "Amritsar" },
  "navi mumbai": { lat: 19.0330, lon: 73.0297, zoom: 12, name: "Navi Mumbai" },
  "allahabad": { lat: 25.4358, lon: 81.8463, zoom: 12, name: "Allahabad" },
  "prayagraj": { lat: 25.4358, lon: 81.8463, zoom: 12, name: "Prayagraj" },
  "howrah": { lat: 22.5769, lon: 88.3186, zoom: 12, name: "Howrah" },
  "ranchi": { lat: 23.3441, lon: 85.3096, zoom: 12, name: "Ranchi" },
  "coimbatore": { lat: 11.0168, lon: 76.9558, zoom: 12, name: "Coimbatore" },
  "jabalpur": { lat: 23.1815, lon: 79.9864, zoom: 12, name: "Jabalpur" },
  "gwalior": { lat: 26.2183, lon: 78.1828, zoom: 12, name: "Gwalior" },
  "vijayawada": { lat: 16.5062, lon: 80.6480, zoom: 12, name: "Vijayawada" },
  "madurai": { lat: 9.9252, lon: 78.1198, zoom: 12, name: "Madurai" },
  "guwahati": { lat: 26.1445, lon: 91.7362, zoom: 12, name: "Guwahati" },
  "chandigarh": { lat: 30.7333, lon: 76.7794, zoom: 12, name: "Chandigarh" },
  "kochi": { lat: 9.9312, lon: 76.2673, zoom: 12, name: "Kochi" },
  "mysore": { lat: 12.2958, lon: 76.6394, zoom: 12, name: "Mysore" },
  "mysuru": { lat: 12.2958, lon: 76.6394, zoom: 12, name: "Mysuru" },
  "dehradun": { lat: 30.3165, lon: 78.0322, zoom: 12, name: "Dehradun" },
  "goa": { lat: 15.2993, lon: 74.1240, zoom: 10, name: "Goa" },
  "panaji": { lat: 15.4909, lon: 73.8278, zoom: 12, name: "Panaji" },
  "pondicherry": { lat: 11.9416, lon: 79.8083, zoom: 12, name: "Pondicherry" },
  "puducherry": { lat: 11.9416, lon: 79.8083, zoom: 12, name: "Puducherry" },
  "guntur": { lat: 16.3067, lon: 80.4365, zoom: 12, name: "Guntur" },
  "nellore": { lat: 14.4426, lon: 79.9865, zoom: 12, name: "Nellore" },
  "tirupati": { lat: 13.6288, lon: 79.4192, zoom: 12, name: "Tirupati" },
  "kakinada": { lat: 16.9891, lon: 82.2475, zoom: 12, name: "Kakinada" },
  "anantapur": { lat: 14.6819, lon: 77.6006, zoom: 12, name: "Anantapur" },
  "kadapa": { lat: 14.4713, lon: 78.8222, zoom: 12, name: "Kadapa" },
  "rajahmundry": { lat: 17.0005, lon: 81.8040, zoom: 12, name: "Rajahmundry" },
  "kurnool": { lat: 15.8281, lon: 78.0373, zoom: 12, name: "Kurnool" },
  "warangal": { lat: 17.9784, lon: 79.5941, zoom: 12, name: "Warangal" },
  "nizamabad": { lat: 18.6725, lon: 78.0941, zoom: 12, name: "Nizamabad" },
  "karimnagar": { lat: 18.4386, lon: 79.1288, zoom: 12, name: "Karimnagar" },
  "khammam": { lat: 17.2473, lon: 80.1514, zoom: 12, name: "Khammam" },
  "salem": { lat: 11.6643, lon: 78.1460, zoom: 12, name: "Salem" },
  "tiruchirappalli": { lat: 10.7905, lon: 78.7047, zoom: 12, name: "Tiruchirappalli" },
  "trichy": { lat: 10.7905, lon: 78.7047, zoom: 12, name: "Trichy" },
  "tirunelveli": { lat: 8.7139, lon: 77.7567, zoom: 12, name: "Tirunelveli" },
  "vellore": { lat: 12.9165, lon: 79.1325, zoom: 12, name: "Vellore" },
  "erode": { lat: 11.3410, lon: 77.7172, zoom: 12, name: "Erode" },
  "thoothukudi": { lat: 8.7973, lon: 78.1348, zoom: 12, name: "Thoothukudi" },
  "hubli": { lat: 15.3647, lon: 75.1240, zoom: 12, name: "Hubli" },
  "dharwad": { lat: 15.4589, lon: 75.0078, zoom: 12, name: "Dharwad" },
  "mangalore": { lat: 12.9141, lon: 74.8560, zoom: 12, name: "Mangalore" },
  "mangaluru": { lat: 12.9141, lon: 74.8560, zoom: 12, name: "Mangaluru" },
  "belgaum": { lat: 15.8497, lon: 74.4977, zoom: 12, name: "Belgaum" },
  "gulbarga": { lat: 17.3297, lon: 76.8344, zoom: 12, name: "Gulbarga" },
  "kalaburagi": { lat: 17.3297, lon: 76.8344, zoom: 12, name: "Kalaburagi" },
  "thiruvananthapuram": { lat: 8.5241, lon: 76.9366, zoom: 12, name: "Thiruvananthapuram" },
  "trivandrum": { lat: 8.5241, lon: 76.9366, zoom: 12, name: "Trivandrum" },
  "kozhikode": { lat: 11.2588, lon: 75.7804, zoom: 12, name: "Kozhikode" },
  "calicut": { lat: 11.2588, lon: 75.7804, zoom: 12, name: "Calicut" },
  "thrissur": { lat: 10.5276, lon: 76.2144, zoom: 12, name: "Thrissur" },
  "kollam": { lat: 8.8932, lon: 76.6141, zoom: 12, name: "Kollam" },
  "kottayam": { lat: 9.5916, lon: 76.5224, zoom: 12, name: "Kottayam" },
  "kolhapur": { lat: 16.7050, lon: 74.2433, zoom: 12, name: "Kolhapur" },
  "solapur": { lat: 17.6599, lon: 75.9064, zoom: 12, name: "Solapur" },
  "amravati": { lat: 20.9374, lon: 77.7796, zoom: 12, name: "Amravati" },
  "nanded": { lat: 19.1383, lon: 77.3210, zoom: 12, name: "Nanded" },
  "bhavnagar": { lat: 21.7645, lon: 72.1519, zoom: 12, name: "Bhavnagar" },
  "jamnagar": { lat: 22.4707, lon: 70.0577, zoom: 12, name: "Jamnagar" },
  "junagadh": { lat: 21.5222, lon: 70.4579, zoom: 12, name: "Junagadh" },
  "jaisalmer": { lat: 26.9157, lon: 70.9083, zoom: 12, name: "Jaisalmer" },
  "bikaner": { lat: 28.0229, lon: 73.3119, zoom: 12, name: "Bikaner" },
  "kota": { lat: 25.2138, lon: 75.8648, zoom: 12, name: "Kota" },
  "ajmer": { lat: 26.4499, lon: 74.6399, zoom: 12, name: "Ajmer" },
  "jalandhar": { lat: 31.3260, lon: 75.5762, zoom: 12, name: "Jalandhar" },
  "patiala": { lat: 30.3398, lon: 76.3869, zoom: 12, name: "Patiala" },
  "panipat": { lat: 29.3909, lon: 76.9635, zoom: 12, name: "Panipat" },
  "ambala": { lat: 30.3782, lon: 76.7767, zoom: 12, name: "Ambala" },
  "aligarh": { lat: 27.8974, lon: 78.0880, zoom: 12, name: "Aligarh" },
  "bareilly": { lat: 28.3640, lon: 79.4150, zoom: 12, name: "Bareilly" },
  "gorakhpur": { lat: 26.7606, lon: 83.3731, zoom: 12, name: "Gorakhpur" },
  "jhansi": { lat: 25.4484, lon: 78.5685, zoom: 12, name: "Jhansi" },
  "moradabad": { lat: 28.8351, lon: 78.7742, zoom: 12, name: "Moradabad" },
  "gaya": { lat: 24.7955, lon: 84.9994, zoom: 12, name: "Gaya" },
  "muzaffarpur": { lat: 26.1197, lon: 85.3910, zoom: 12, name: "Muzaffarpur" },
  "siliguri": { lat: 26.7271, lon: 88.3953, zoom: 12, name: "Siliguri" },
  "durgapur": { lat: 23.5204, lon: 87.3119, zoom: 12, name: "Durgapur" },
  "asansol": { lat: 23.6740, lon: 86.9521, zoom: 12, name: "Asansol" },
  "bhubaneswar": { lat: 20.2961, lon: 85.8245, zoom: 12, name: "Bhubaneswar" },
  "cuttack": { lat: 20.4625, lon: 85.8830, zoom: 12, name: "Cuttack" },
  "rourkela": { lat: 22.2604, lon: 84.8536, zoom: 12, name: "Rourkela" },
  "raipur": { lat: 21.2514, lon: 81.6296, zoom: 12, name: "Raipur" },
  "bilaspur": { lat: 22.0790, lon: 82.1391, zoom: 12, name: "Bilaspur" },
  "jamshedpur": { lat: 22.8046, lon: 86.2029, zoom: 12, name: "Jamshedpur" },
  "bokaro": { lat: 23.6693, lon: 85.8809, zoom: 12, name: "Bokaro" },
  "dibrugarh": { lat: 27.4728, lon: 94.9120, zoom: 12, name: "Dibrugarh" },
  "jorhat": { lat: 26.7509, lon: 94.2037, zoom: 12, name: "Jorhat" },
  "jammu": { lat: 32.7266, lon: 74.8570, zoom: 12, name: "Jammu" },
  "haridwar": { lat: 29.9457, lon: 78.1642, zoom: 12, name: "Haridwar" },
  "rishikesh": { lat: 30.0869, lon: 78.2676, zoom: 12, name: "Rishikesh" },
  "manali": { lat: 32.2396, lon: 77.1887, zoom: 12, name: "Manali" },
  "dharamshala": { lat: 32.2190, lon: 76.3234, zoom: 12, name: "Dharamshala" },
  "margao": { lat: 15.2736, lon: 73.9582, zoom: 12, name: "Margao" },
  "london": { lat: 51.5074, lon: -0.1278, zoom: 11, name: "London" },
  "new york": { lat: 40.7128, lon: -74.0060, zoom: 11, name: "New York" },
  "san francisco": { lat: 37.7749, lon: -122.4194, zoom: 13, name: "San Francisco" },
  "paris": { lat: 48.8566, lon: 2.3522, zoom: 12, name: "Paris" },
  "tokyo": { lat: 35.6762, lon: 139.6503, zoom: 11, name: "Tokyo" }
};

function highlightLocation(lat, lng, name, type) {
  if (searchHighlightMarker) {
    map.removeLayer(searchHighlightMarker);
  }
  
  const icon = L.divIcon({
    html: `<div class="custom-map-marker marker-red" id="search-highlight-marker">
             <div class="marker-pulse"></div>
             <div class="marker-core"></div>
           </div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
  
  searchHighlightMarker = L.marker([lat, lng], { icon: icon })
    .addTo(map)
    .bindPopup(`
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; text-align: center; min-width: 120px;">
        <h4 style="margin:0 0 4px 0; color:var(--text-error); font-size:13px; font-weight:700;">📍 ${name}</h4>
        <div style="font-size:11px; text-transform: capitalize;">Type: <strong>${type}</strong></div>
      </div>
    `);
    
  setTimeout(() => {
    if (searchHighlightMarker) {
      searchHighlightMarker.openPopup();
    }
  }, 1600);
}

// Search Address via OSM Nominatim API + Offline Fallback
async function searchLocation(query) {
  if (!query || query.trim() === '') return;
  
  const cleanQuery = query.trim().toLowerCase();
  addConsoleLog(`GEOCODING ADDRESS QUERY: "${query.toUpperCase()}"`, 'warning');
  
  // 0. Check loaded database places first for instant local resolution
  const matchPOI = allCustomPOIs.find(p => p.name.toLowerCase() === cleanQuery || p.name.toLowerCase().includes(cleanQuery));
  if (matchPOI) {
    searchCenterName = matchPOI.name;
    document.getElementById('viewport-label').textContent = searchCenterName;
    addConsoleLog(`[DATABASE] Location matched: ${matchPOI.name}. Panning...`, 'success');
    map.flyTo([matchPOI.lat, matchPOI.lng], 14, { duration: 1.5 });
    shiftTrackerRoutes(matchPOI.lat, matchPOI.lng);
    await updateNearbyExplorer(matchPOI.lat, matchPOI.lng);
    highlightLocation(matchPOI.lat, matchPOI.lng, matchPOI.name, matchPOI.type);
    return;
  }
  
  // 1. Check offline dictionary first (using keyword containment with specificity weight)
  let foundLoc = null;
  let bestKey = null;
  for (let key in localLocations) {
    if (cleanQuery.includes(key)) {
      if (!bestKey || key.length > bestKey.length || (key.length === bestKey.length && bestKey === "india")) {
        bestKey = key;
        foundLoc = localLocations[key];
      }
    }
  }
  
  if (foundLoc) {
    searchCenterName = foundLoc.name;
    document.getElementById('viewport-label').textContent = searchCenterName;
    
    addConsoleLog(`[LOCAL DB] Location matched: ${foundLoc.name}. Panning...`, 'success');
    map.flyTo([foundLoc.lat, foundLoc.lon], foundLoc.zoom, { duration: 1.5 });
    
    // Snap GPS tracker routes and update explorer immediately
    shiftTrackerRoutes(foundLoc.lat, foundLoc.lon);
    await updateNearbyExplorer(foundLoc.lat, foundLoc.lon);
    highlightLocation(foundLoc.lat, foundLoc.lon, foundLoc.name, 'City');
    return;
  }
  
  // 2. Fallback to API if not in local dictionary
  const searchBtn = document.getElementById('map-search-btn');
  searchBtn.disabled = true;
  
  try {
    // Prioritize India by default unless a global search is detected
    const isGlobalQuery = /london|paris|tokyo|new york|usa|uk|france|japan|germany|italy|canada|australia/i.test(cleanQuery);
    
    let url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}&email=mapsphere-geocoding@outlook.com`;
    if (!isGlobalQuery) {
      url += '&countrycodes=in';
    }
    
    let response = await fetch(url);
    if (response.ok) {
      let data = await response.json();
      
      // Fallback: if prioritized Indian search returned nothing, try global search
      if ((!data || data.length === 0) && !isGlobalQuery) {
        addConsoleLog(`[API] Searching globally for: "${query.toUpperCase()}"`, 'warning');
        url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}&email=mapsphere-geocoding@outlook.com`;
        response = await fetch(url);
        if (response.ok) {
          data = await response.json();
        }
      }
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        
        searchCenterName = result.display_name.split(',')[0];
        document.getElementById('viewport-label').textContent = searchCenterName;
        
        addConsoleLog(`[API] Location found: ${searchCenterName}. Panning...`, 'success');
        map.flyTo([lat, lon], 12, { duration: 1.5 });
        
        // Snap GPS tracker routes and update explorer immediately
        shiftTrackerRoutes(lat, lon);
        await updateNearbyExplorer(lat, lon);
        highlightLocation(lat, lon, searchCenterName, 'Location');
      } else {
        addConsoleLog('GEOLOCATION QUERY FAILED: Address not found.', 'warning');
        shakeSearchInput();
      }
    } else {
      addConsoleLog('GEOLOCATION SERVICE REJECTED THE REQUEST.', 'warning');
      shakeSearchInput();
    }
  } catch (err) {
    console.error(err);
    addConsoleLog('GEOLOCATION SERVICE OFFLINE (CORS or Network issue).', 'warning');
    shakeSearchInput();
  } finally {
    searchBtn.disabled = false;
  }
}

function shakeSearchInput() {
  const searchBar = document.querySelector('.map-search-bar');
  searchBar.classList.add('shake');
  setTimeout(() => searchBar.classList.remove('shake'), 400);
}

function initSearchControls() {
  const searchInput = document.getElementById('map-search-input');
  const searchBtn = document.getElementById('map-search-btn');
  const clearBtn = document.getElementById('map-clear-btn');
  const suggestionsBox = document.getElementById('search-suggestions');
  
  // Show/hide clear button based on text & update suggestions dropdown
  searchInput.addEventListener('input', () => {
    const val = searchInput.value.trim().toLowerCase();
    
    if (val !== '') {
      clearBtn.classList.remove('hide');
    } else {
      clearBtn.classList.add('hide');
      suggestionsBox.classList.add('hide');
      suggestionsBox.innerHTML = '';
      return;
    }
    
    // Find matching items from allCustomPOIs and localLocations
    const matches = [];
    
    // 1. Scan database places
    allCustomPOIs.forEach(item => {
      if (item.name.toLowerCase().includes(val)) {
        matches.push({
          name: item.name,
          type: item.type,
          lat: item.lat,
          lng: item.lng
        });
      }
    });
    
    // 2. Scan offline dictionary places
    for (let key in localLocations) {
      if (key.includes(val) || localLocations[key].name.toLowerCase().includes(val)) {
        // Avoid duplicate names if they are already in the database matches
        if (!matches.some(m => m.name.toLowerCase() === localLocations[key].name.toLowerCase())) {
          matches.push({
            name: localLocations[key].name,
            type: 'city',
            lat: localLocations[key].lat,
            lng: localLocations[key].lon
          });
        }
      }
    }
    
    // Limit to top 6 suggestions
    const limitMatches = matches.slice(0, 6);
    
    if (limitMatches.length === 0) {
      suggestionsBox.classList.add('hide');
      suggestionsBox.innerHTML = '';
      return;
    }
    
    suggestionsBox.innerHTML = '';
    limitMatches.forEach(match => {
      const div = document.createElement('div');
      div.className = 'suggestion-item';
      div.innerHTML = `
        <span>${match.name}</span>
        <span class="suggestion-type">${match.type}</span>
      `;
      
      div.addEventListener('click', () => {
        searchInput.value = match.name;
        suggestionsBox.classList.add('hide');
        searchLocation(match.name);
      });
      
      suggestionsBox.appendChild(div);
    });
    
    suggestionsBox.classList.remove('hide');
  });
  
  // Clear search box on click
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.classList.add('hide');
    suggestionsBox.classList.add('hide');
    suggestionsBox.innerHTML = '';
    searchInput.focus();
  });
  
  searchBtn.addEventListener('click', () => {
    suggestionsBox.classList.add('hide');
    searchLocation(searchInput.value);
  });
  
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      suggestionsBox.classList.add('hide');
      searchLocation(searchInput.value);
    }
  });
  
  // Close suggestions if clicked outside
  document.addEventListener('click', (e) => {
    if (e.target !== searchInput && e.target !== suggestionsBox && !suggestionsBox.contains(e.target)) {
      suggestionsBox.classList.add('hide');
    }
  });
}

function initExplorerFilters() {
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.getAttribute('data-type');
      renderPOIList();
    });
  });
}

// Generate deterministic mock POIs based on coordinates
function generateNearbyPOIs(lat, lng) {
  const generated = [];
  const types = ['hotel', 'school', 'restaurant'];
  
  // Seed random generator deterministically relative to lat/lng so they don't jump on every tiny move
  let seed = Math.sin(lat) * Math.cos(lng);
  function seededRandom() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }
  
  types.forEach(type => {
    const names = poiNames[type];
    const count = 3 + Math.floor(seededRandom() * 3); // 3-5 items per type
    
    // Shuffle copy of names
    const shuffledNames = [...names].sort(() => seededRandom() - 0.5);
    
    for (let i = 0; i < count; i++) {
      const name = shuffledNames[i % shuffledNames.length];
      
      // Small offsets (within ~1.2km)
      const offsetLat = (seededRandom() - 0.5) * 0.015;
      const offsetLng = (seededRandom() - 0.5) * 0.015;
      const itemLat = lat + offsetLat;
      const itemLng = lng + offsetLng;
      
      const rating = (3.2 + seededRandom() * 1.8).toFixed(1);
      const distance = Math.round(Math.hypot(lat - itemLat, lng - itemLng) * 111300);
      
      let status = 'Average';
      if (rating >= 4.5) status = 'Highly Recommended';
      else if (rating < 3.8) status = 'Not Recommended';
      
      generated.push({
        id: `${type}_${i}_${distance}`,
        name: name,
        type: type,
        lat: itemLat,
        lng: itemLng,
        rating: parseFloat(rating),
        distance: distance,
        status: status
      });
    }
  });
  
  // Sort by distance ascending
  return generated.sort((a, b) => a.distance - b.distance);
}
// Update listings and map markers
async function updateNearbyExplorer(lat, lng) {
  // 1. Generate mock POIs
  let mockPOIs = generateNearbyPOIs(lat, lng);
  
  // 2. Fetch custom POIs from database
  let customPOIs = [];
  try {
    const response = await safeFetch('/api/pois');
    if (response.ok) {
      customPOIs = await response.json();
      allCustomPOIs = customPOIs; // Update global database records
    }
  } catch (err) {
    console.warn("Could not load custom POIs:", err);
  }
  
  // Calculate distance for custom POIs from current viewport center
  customPOIs.forEach(item => {
    item.distance = Math.round(Math.hypot(lat - item.lat, lng - item.lng) * 111300);
  });
  
  // Keep all custom POIs within 50km (Tumkur region scale) for map markers
  let mapCustomPOIs = customPOIs.filter(item => item.distance < 50000);
  
  // Keep custom POIs within current map bounds (if loaded) or 15km for the sidebar list
  let listCustomPOIs = [];
  if (map && map.getBounds) {
    try {
      const bounds = map.getBounds();
      const east = bounds.getEast();
      const west = bounds.getWest();
      if (east !== west) {
        listCustomPOIs = customPOIs.filter(item => bounds.contains(L.latLng(item.lat, item.lng)));
      } else {
        listCustomPOIs = customPOIs.filter(item => item.distance < 15000);
      }
    } catch (e) {
      listCustomPOIs = customPOIs.filter(item => item.distance < 15000);
    }
  } else {
    listCustomPOIs = customPOIs.filter(item => item.distance < 15000);
  }
  
  // Save all active POIs to the global allMapPOIs array
  allMapPOIs = [...mapCustomPOIs, ...mockPOIs];
  
  // Clear old markers from map
  if (poiMarkersGroup) {
    poiMarkersGroup.clearLayers();
  }
  
  // Render and cache markers for all map POIs
  allMapPOIs.forEach(item => {
    // Custom map icons based on type
    const isCustom = item.id.toString().startsWith('custom_');
    const colorClass = item.type === 'village' ? 'orange' : (item.type === 'hotel' ? 'purple' : (item.type === 'school' ? 'green' : 'cyan'));
    
    const icon = L.divIcon({
      html: `<div class="custom-map-marker marker-${colorClass}" id="map-marker-${item.id}">
               <div class="marker-pulse"></div>
               <div class="marker-core"></div>
             </div>`,
      className: '',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    
    const marker = L.marker([item.lat, item.lng], { icon: icon })
      .bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif;">
          <h4 style="margin:0 0 4px 0; color:${isCustom ? '#ffd600' : 'var(--primary)'}; font-size:13px; font-weight:700;">${item.name} ${isCustom ? '★' : ''}</h4>
          <div style="font-size:11px; margin-bottom: 2px;">Type: <strong style="text-transform: capitalize;">${item.type}</strong></div>
          <div style="font-size:11px; margin-bottom: 4px;">Rating: <strong style="color:var(--text-warning);">★ ${item.rating}</strong></div>
          ${item.description ? `<div style="font-size:11px; margin-bottom: 4px; color:var(--text-muted); font-style:italic;">"${item.description}"</div>` : ''}
          <div style="font-size:11px; color:var(--text-muted);">Distance: ${item.distance}m</div>
        </div>
      `);
      
    // Save reference to marker
    item.marker = marker;
    
    // Add marker to layer group if it matches current filter category
    if (currentCategory === 'all' || item.type === currentCategory) {
      marker.addTo(poiMarkersGroup);
    }
  });
  
  // Combine custom list POIs with mock POIs, sorting by distance
  currentPOIs = [...listCustomPOIs, ...mockPOIs].sort((a, b) => a.distance - b.distance);
  
  // Update UI list and smart insights
  renderPOIList();
  generateSmartInsights();
}
function renderPOIList() {
  const listContainer = document.getElementById('nearby-list');
  if (!listContainer) return;
  
  listContainer.innerHTML = '';
  
  // Filter list
  const filtered = currentPOIs.filter(item => currentCategory === 'all' || item.type === currentCategory);
  document.getElementById('nearby-count').textContent = `${filtered.length} POIs`;
  
  // Synchronize map markers visibility with category filter
  if (poiMarkersGroup && allMapPOIs) {
    poiMarkersGroup.clearLayers();
    allMapPOIs.forEach(item => {
      if (item.marker && (currentCategory === 'all' || item.type === currentCategory)) {
        poiMarkersGroup.addLayer(item.marker);
      }
    });
  }
  
  if (filtered.length === 0) {
    listContainer.innerHTML = '<div class="list-placeholder">No facilities found.</div>';
    return;
  }
  
  filtered.forEach(item => {
    const badgeClass = item.status === 'Highly Recommended' ? 'recommended' : (item.status === 'Not Recommended' ? 'avoid' : 'average');
    const badgeLabel = item.status === 'Highly Recommended' ? 'Recommended' : (item.status === 'Not Recommended' ? 'Not Rec.' : 'Average');
    
    const div = document.createElement('div');
    div.className = 'nearby-item';
    div.innerHTML = `
      <div class="nearby-item-header">
        <span class="nearby-item-name">${item.name}</span>
        <span class="rec-badge ${badgeClass}">${badgeLabel}</span>
      </div>
      <div class="nearby-item-meta">
        <span style="text-transform: capitalize; font-weight: 500;">${item.type}</span>
        <span class="nearby-item-rating">${item.rating}</span>
        <span>${item.distance}m</span>
      </div>
    `;
    
    // Zoom and popup on click
    div.addEventListener('click', () => {
      map.flyTo([item.lat, item.lng], 15.5, { duration: 1.0 });
      setTimeout(() => {
        if (item.marker) item.marker.openPopup();
      }, 800);
    });
    
    listContainer.appendChild(div);
  });
}

function generateSmartInsights() {
  const container = document.getElementById('insights-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Find top choice hotel
  const hotels = currentPOIs.filter(item => item.type === 'hotel');
  const topHotel = hotels.sort((a,b) => b.rating - a.rating)[0];
  
  // Find closest school
  const schools = currentPOIs.filter(item => item.type === 'school');
  const closestSchool = schools.sort((a,b) => a.distance - b.distance)[0];
  
  // Find places to avoid (rating < 3.6)
  const avoidPlace = currentPOIs.find(item => item.rating < 3.6);
  
  let insightsCount = 0;
  
  if (topHotel) {
    insightsCount++;
    const div = document.createElement('div');
    div.className = 'insight-item insight-success';
    div.innerHTML = `
      <span class="insight-icon">✓</span>
      <div class="insight-text"><strong>Best Stay:</strong> ${topHotel.name} is the top hotel here (★ ${topHotel.rating}, ${topHotel.distance}m away).</div>
    `;
    container.appendChild(div);
  }
  
  if (closestSchool) {
    insightsCount++;
    const div = document.createElement('div');
    div.className = 'insight-item insight-warning';
    div.innerHTML = `
      <span class="insight-icon">ℹ</span>
      <div class="insight-text"><strong>Nearest School:</strong> ${closestSchool.name} is closest (${closestSchool.distance}m away).</div>
    `;
    container.appendChild(div);
  }
  
  if (avoidPlace) {
    insightsCount++;
    const div = document.createElement('div');
    div.className = 'insight-item insight-error';
    div.innerHTML = `
      <span class="insight-icon">⚠</span>
      <div class="insight-text"><strong>Avoid:</strong> ${avoidPlace.name} has low ratings (★ ${avoidPlace.rating}) and is not recommended.</div>
    `;
    container.appendChild(div);
  }
  
  if (insightsCount === 0) {
    container.innerHTML = '<div class="insight-placeholder">No insights for current viewport.</div>';
  }
}

// Upgraded Conversational Chatbot Suggestion Console
function initSuggestionConsole() {
  const input = document.getElementById('suggestion-input');
  const submitBtn = document.getElementById('suggestion-submit-btn');
  const chatLog = document.getElementById('suggestion-chat-log');
  
  if (!submitBtn || !input) return;
  
  window.chatPanTo = async (lat, lng, id, name) => {
    map.flyTo([lat, lng], 15.5, { duration: 1.2 });
    shiftTrackerRoutes(lat, lng);
    await updateNearbyExplorer(lat, lng);
    highlightLocation(lat, lng, name, 'Database Place');
  };
  
  function addChatLine(text, sender) {
    const div = document.createElement('div');
    div.className = `chat-line ${sender === 'user' ? 'user-msg' : 'assistant-msg'}`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    div.innerHTML = `[${time}] <strong>${sender === 'user' ? 'You' : 'Assistant'}:</strong> ${text}`;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
  }
  
  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'chat-line assistant-msg typing-indicator-container';
    indicator.id = 'chatbot-typing-indicator';
    indicator.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
    chatLog.appendChild(indicator);
    chatLog.scrollTop = chatLog.scrollHeight;
  }
  
  function hideTypingIndicator() {
    const indicator = document.getElementById('chatbot-typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }
  
  async function handleQuery(customQuery) {
    const query = (customQuery || input.value).trim();
    if (query === '') return;
    
    addChatLine(query, 'user');
    if (!customQuery) input.value = '';
    
    showTypingIndicator();
    
    setTimeout(async () => {
      hideTypingIndicator();
      const lower = query.toLowerCase();
      
      // Check if query is asking for a specific place in our database
      const foundPOI = allCustomPOIs.find(p => lower.includes(p.name.toLowerCase()));
      if (foundPOI) {
        let response = `I found **${foundPOI.name}** (${foundPOI.type}) in the database. It is located at coordinates [${foundPOI.lat.toFixed(4)}, ${foundPOI.lng.toFixed(4)}]. Panning the map to this location!`;
        addChatLine(response, 'assistant');
        map.flyTo([foundPOI.lat, foundPOI.lng], 14, { duration: 1.5 });
        shiftTrackerRoutes(foundPOI.lat, foundPOI.lng);
        await updateNearbyExplorer(foundPOI.lat, foundPOI.lng);
        setTimeout(() => {
          const updatedPOI = allCustomPOIs.find(p => p.id === foundPOI.id);
          if (updatedPOI && updatedPOI.marker) {
            updatedPOI.marker.openPopup();
          }
        }, 1600);
        return;
      }
      
      let response = "I can analyze this area. Ask me about local places/villages or the best food options!";
      
      const hotels = currentPOIs.filter(item => item.type === 'hotel');
      const schools = currentPOIs.filter(item => item.type === 'school');
      const food = currentPOIs.filter(item => item.type === 'restaurant');
      
      // Greetings
      if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('greetings')) {
        response = `Hello there! I'm your MapSphere Assistant. How can I help you analyze the ${searchCenterName} viewport today?`;
      }
      // How to add custom place
      else if (lower.includes('how to add') || lower.includes('add place') || lower.includes('how do i add') || lower.includes('help')) {
        response = "To register a custom place: **Right-click anywhere on the map**! A dialog will pop up where you can name the place, choose its type, give it a rating, and persist it to our SQLite database.";
      }
      // Village street names
      else if (lower.includes('street') || lower.includes('road') || lower.includes('lane') || lower.includes('path') || lower.includes('bazaar')) {
        response = `In the current ${searchCenterName} viewport, I've loaded village street networks like Gandhi Path, Grama Panchayat Road, Bazaar Marg, and Temple Lane. **Left-click on the map** to draw route paths along these village streets!`;
      }
      // Standard POI queries
      else if (lower.includes('hotel') || lower.includes('stay') || lower.includes('suites') || lower.includes('best hotel')) {
        const dbHotels = allCustomPOIs.filter(item => item.type === 'hotel');
        if (dbHotels.length > 0) {
          const sorted = [...dbHotels].sort((a, b) => a.distance - b.distance).slice(0, 3);
          let responseText = "Here are the closest hotels in the database. Click 📍 to pan the map to any option:<br>";
          sorted.forEach((h, i) => {
            responseText += `<div class="chat-hotel-item" style="margin-top: 8px; padding: 6px; border: 1px solid var(--border-color); border-radius: 8px; background: rgba(255,255,255,0.01);">
              <strong>${i+1}. ${h.name}</strong> (★${h.rating})<br>
              <span class="btn-link" style="font-size: 11px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; margin-top: 4px;" onclick="window.chatPanTo(${h.lat}, ${h.lng}, '${h.id}', '${h.name.replace(/'/g, "\\'")}')">
                📍 Pan to Hotel (${h.distance}m away)
              </span>
            </div>`;
          });
          response = responseText;
        } else {
          response = "There are no hotels visible in this map viewport. Try dragging the map or searching another city!";
        }
      } 
      else if (lower.includes('school') || lower.includes('education') || lower.includes('academy')) {
        const dbSchools = allCustomPOIs.filter(item => item.type === 'school');
        if (dbSchools.length > 0) {
          const sorted = [...dbSchools].sort((a, b) => a.distance - b.distance).slice(0, 3);
          let responseText = "Here are the nearest schools/colleges. Click 📍 to locate:<br>";
          sorted.forEach((s, i) => {
            responseText += `<div class="chat-hotel-item" style="margin-top: 8px; padding: 6px; border: 1px solid var(--border-color); border-radius: 8px; background: rgba(255,255,255,0.01);">
              <strong>${i+1}. ${s.name}</strong> (★${s.rating})<br>
              <span class="btn-link" style="font-size: 11px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; margin-top: 4px;" onclick="window.chatPanTo(${s.lat}, ${s.lng}, '${s.id}', '${s.name.replace(/'/g, "\\'")}')">
                📍 Locate School (${s.distance}m away)
              </span>
            </div>`;
          });
          response = responseText;
        } else {
          response = "No schools found in the current map view. Try scrolling to look around!";
        }
      } 
      else if (lower.includes('food') || lower.includes('eat') || lower.includes('restaurant') || lower.includes('dinner')) {
        const dbFood = allCustomPOIs.filter(item => item.type === 'restaurant');
        if (dbFood.length > 0) {
          const sorted = [...dbFood].sort((a, b) => a.distance - b.distance).slice(0, 3);
          let responseText = "Here are the closest restaurants nearby. Click 📍 to view on map:<br>";
          sorted.forEach((r, i) => {
            responseText += `<div class="chat-hotel-item" style="margin-top: 8px; padding: 6px; border: 1px solid var(--border-color); border-radius: 8px; background: rgba(255,255,255,0.01);">
              <strong>${i+1}. ${r.name}</strong> (★${r.rating})<br>
              <span class="btn-link" style="font-size: 11px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; margin-top: 4px;" onclick="window.chatPanTo(${r.lat}, ${r.lng}, '${r.id}', '${r.name.replace(/'/g, "\\'")}')">
                📍 View Restaurant (${r.distance}m away)
              </span>
            </div>`;
          });
          response = responseText;
        } else {
          response = "I couldn't locate any restaurants here. Pan the map or search a busier downtown area.";
        }
      }
      else if (lower.includes('village') || lower.includes('place') || lower.includes('top places') || lower.includes('top villages')) {
        const dbVillages = allCustomPOIs.filter(item => item.type === 'village');
        if (dbVillages.length > 0) {
          const sorted = [...dbVillages].sort((a, b) => a.distance - b.distance).slice(0, 3);
          let responseText = "Here are the closest villages/places in the database. Click 📍 to pan the map to any option:<br>";
          sorted.forEach((v, i) => {
            responseText += `<div class="chat-hotel-item" style="margin-top: 8px; padding: 6px; border: 1px solid var(--border-color); border-radius: 8px; background: rgba(255,255,255,0.01);">
              <strong>${i+1}. ${v.name}</strong> (★${v.rating})<br>
              <span class="btn-link" style="font-size: 11px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; margin-top: 4px;" onclick="window.chatPanTo(${v.lat}, ${v.lng}, '${v.id}', '${v.name.replace(/'/g, "\\'")}')">
                📍 Pan to Village (${v.distance}m away)
              </span>
            </div>`;
          });
          response = responseText;
        } else {
          response = "No villages found in the database. Try dragging the map or searching another area!";
        }
      } 
      else if (lower.includes('best') || lower.includes('recommend') || lower.includes('top')) {
        const best = [...currentPOIs].sort((a,b) => b.rating - a.rating)[0];
        if (best) {
          response = `The highest rated facility here is **${best.name}** (${best.type}, rating: ★${best.rating}), situated ${best.distance}m away.`;
        }
      } 
      else if (lower.includes('worst') || lower.includes('avoid') || lower.includes('bad')) {
        const worst = currentPOIs.find(item => item.rating < 3.6);
        if (worst) {
          response = `You should probably avoid **${worst.name}** (${worst.type}), as its rating is low (★${worst.rating}).`;
        } else {
          response = "All facilities visible in this area have good ratings (3.6+ stars)!";
        }
      }
      
      addChatLine(response, 'assistant');
    }, 850);
  }
  
  submitBtn.addEventListener('click', () => handleQuery());
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleQuery();
    }
  });
  
  // Suggestion chips binding
  const chips = document.getElementById('suggestion-chips');
  if (chips) {
    chips.querySelectorAll('.chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query');
        handleQuery(query);
      });
    });
  }
}

function initCustomPOIHandlers() {
  const modal = document.getElementById('poi-modal');
  const closeBtn = document.getElementById('poi-modal-close');
  const form = document.getElementById('poi-form');
  
  if (!modal || !closeBtn || !form) return;
  
  closeBtn.addEventListener('click', () => {
    modal.classList.add('hide');
  });
  
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hide');
    }
  });
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('poi-name').value.trim();
    const type = document.getElementById('poi-type').value;
    const rating = document.getElementById('poi-rating').value;
    const desc = document.getElementById('poi-desc').value.trim();
    
    if (!name || !rating || !clickedCoords) {
      alert('Please fill in all required fields.');
      return;
    }
    
    const submitBtn = document.getElementById('poi-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');
    
    submitBtn.disabled = true;
    btnText.classList.add('hide');
    spinner.classList.remove('hide');
    
    try {
      const response = await safeFetch('/api/pois', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          type: type,
          lat: clickedCoords.lat,
          lng: clickedCoords.lng,
          rating: rating,
          description: desc
        })
      });
      
      if (response.ok) {
        modal.classList.add('hide');
        addConsoleLog(`REGISTERED NEW PLACE: ${name.toUpperCase()}`, 'success');
        
        // Reset form fields
        form.reset();
        
        // Refresh explorer
        const center = map.getCenter();
        updateNearbyExplorer(center.lat, center.lng);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save place.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error registering custom place.');
    } finally {
      submitBtn.disabled = false;
      btnText.classList.remove('hide');
      spinner.classList.add('hide');
    }
  });
}

function solveDijkstraPath(startLatLng, endLatLng) {
  const start = [startLatLng.lat, startLatLng.lng];
  const end = [endLatLng.lat, endLatLng.lng];
  
  // Calculate bounding box
  const minLat = Math.min(start[0], end[0]);
  const maxLat = Math.max(start[0], end[0]);
  const minLng = Math.min(start[1], end[1]);
  const maxLng = Math.max(start[1], end[1]);
  
  // Generate 4 horizontal street latitudes and 4 vertical street longitudes
  const latSteps = 3;
  const lngSteps = 3;
  
  const lats = [];
  const lngs = [];
  
  for (let i = 0; i <= latSteps; i++) {
    lats.push(minLat + (maxLat - minLat) * (i / latSteps));
  }
  for (let i = 0; i <= lngSteps; i++) {
    lngs.push(minLng + (maxLng - minLng) * (i / lngSteps));
  }
  
  // Build nodes list
  const nodes = [];
  // Add start as node 0, end as node 1
  nodes.push({ id: 0, lat: start[0], lng: start[1] });
  nodes.push({ id: 1, lat: end[0], lng: end[1] });
  
  // Add grid intersections as nodes 2...
  let nodeId = 2;
  for (let r = 0; r < lats.length; r++) {
    for (let c = 0; c < lngs.length; c++) {
      nodes.push({ id: nodeId++, lat: lats[r], lng: lngs[c] });
    }
  }
  
  // Build edges list (graph representation)
  const adj = {};
  nodes.forEach(n => adj[n.id] = []);
  
  // Connect grid nodes in a grid pattern
  for (let r = 0; r < lats.length; r++) {
    for (let c = 0; c < lngs.length; c++) {
      const currentId = 2 + r * lngs.length + c;
      
      // Connect to right neighbor
      if (c < lngs.length - 1) {
        const rightId = currentId + 1;
        connectNodes(currentId, rightId);
      }
      // Connect to bottom neighbor
      if (r < lats.length - 1) {
        const bottomId = currentId + lngs.length;
        connectNodes(currentId, bottomId);
      }
    }
  }
  
  // Connect start (0) to nearest grid node
  let nearestToStartId = 2;
  let minDistToStart = Infinity;
  // Connect end (1) to nearest grid node
  let nearestToEndId = 2;
  let minDistToEnd = Infinity;
  
  for (let i = 2; i < nodes.length; i++) {
    const distStart = getDistance(nodes[0], nodes[i]);
    if (distStart < minDistToStart) {
      minDistToStart = distStart;
      nearestToStartId = i;
    }
    const distEnd = getDistance(nodes[1], nodes[i]);
    if (distEnd < minDistToEnd) {
      minDistToEnd = distEnd;
      nearestToEndId = i;
    }
  }
  
  connectNodes(0, nearestToStartId);
  connectNodes(1, nearestToEndId);
  
  function connectNodes(u, v) {
    const du = nodes[u];
    const dv = nodes[v];
    const weight = getDistance(du, dv);
    adj[u].push({ to: v, weight: weight });
    adj[v].push({ to: u, weight: weight });
  }
  
  function getDistance(n1, n2) {
    return Math.hypot(n1.lat - n2.lat, n1.lng - n2.lng);
  }
  
  // Run Dijkstra
  const dist = {};
  const parent = {};
  const queue = new Set();
  
  nodes.forEach(n => {
    dist[n.id] = Infinity;
    parent[n.id] = null;
    queue.add(n.id);
  });
  
  dist[0] = 0;
  
  while (queue.size > 0) {
    // Find min dist node in queue
    let u = null;
    let minD = Infinity;
    queue.forEach(id => {
      if (dist[id] < minD) {
        minD = dist[id];
        u = id;
      }
    });
    
    if (u === null || u === 1) break; // destination reached or unreachable
    
    queue.delete(u);
    
    adj[u].forEach(edge => {
      if (queue.has(edge.to)) {
        const alt = dist[u] + edge.weight;
        if (alt < dist[edge.to]) {
          dist[edge.to] = alt;
          parent[edge.to] = u;
        }
      }
    });
  }
  
  // Reconstruct path
  const path = [];
  let curr = 1;
  while (curr !== null) {
    path.push(nodes.find(n => n.id === curr));
    curr = parent[curr];
  }
  path.reverse();
  
  return path;
}
