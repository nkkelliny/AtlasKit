// ---------- Helpers ----------
const $ = s => document.querySelector(s);
const $all = s => Array.from(document.querySelectorAll(s));

const toast = msg => {
  const el = document.createElement('div');
  el.textContent = msg;
  Object.assign(el.style, {
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    background: 'rgba(42,102,255,.95)',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: '10px',
    fontWeight: '600',
    boxShadow: '0 10px 20px rgba(0,0,0,.35)',
    zIndex: 9999
  });
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1800);
};

// ---------- Auth ----------
let currentUser = null;

async function getUser() {
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) currentUser = await res.json();
    updateAuthUI();
  } catch {
    currentUser = null;
  }
}

async function signupUser(email, pass) {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass })
  });
  if (!res.ok) throw new Error('Signup failed');
  toast('Account created');
  await getUser();
}

async function loginUser(email, pass) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass })
  });
  if (!res.ok) throw new Error('Login failed');
  toast('Signed in');
  await getUser();
}

async function logoutUser() {
  await fetch('/api/auth/logout', { method: 'POST' });
  toast('Signed out');
  currentUser = null;
  updateAuthUI();
}

function updateAuthUI() {
  const userEl = $('#userDisplay');
  const signInBtn = $('#btnSignin');
  const signUpBtn = $('#btnSignup');
  if (currentUser) {
    if (userEl) userEl.textContent = currentUser.email;
    if (signInBtn) signInBtn.style.display = 'none';
    if (signUpBtn) signUpBtn.textContent = 'Dashboard';
  } else {
    if (userEl) userEl.textContent = '';
    if (signInBtn) signInBtn.style.display = '';
    if (signUpBtn) signUpBtn.textContent = 'Start free';
  }
}

// ---------- Auth modal ----------
function openAuth(type = 'signin') {
  $('#authModal').classList.add('active');
  $('#authTitle').textContent = type === 'signup' ? 'Create Account' : 'Sign In';
  $('#authCta').textContent = type === 'signup' ? 'Sign up' : 'Sign in';
  $('#authCta').dataset.mode = type;
}
function closeAuth() { $('#authModal').classList.remove('active'); }

$('#btnSignin')?.addEventListener('click', () => openAuth('signin'));
$('#btnSignup')?.addEventListener('click', () => openAuth('signup'));
$('#authCta')?.addEventListener('click', async () => {
  const email = $('#authEmail').value.trim();
  const pass = $('#authPass').value.trim();
  if (!email || !pass) return toast('Enter email and password');
  try {
    if ($('#authCta').dataset.mode === 'signup') await signupUser(email, pass);
    else await loginUser(email, pass);
    closeAuth();
  } catch (e) {
    toast(e.message);
  }
});
$('#btnLogout')?.addEventListener('click', logoutUser);

// ---------- Router ----------
const routes = ['home', 'features', 'pricing', 'dashboard', 'map'];

function setActiveRoute() {
  const hash = location.hash.replace('#', '') || 'home';
  $all('section.page').forEach(el => el.classList.remove('active'));
  const page = routes.includes(hash) ? hash : 'home';
  $('#' + page)?.classList.add('active');
  $all('.navlinks a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + page);
  });
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (page === 'dashboard') initDashboard();
}

window.addEventListener('hashchange', setActiveRoute);

// ---------- Dashboard ----------
async function initDashboard() {
  if (!currentUser) {
    toast('Please sign in first');
    location.hash = '#home';
    return;
  }

  const list = $('#mapsList');
  list.innerHTML = '<div style="color:#8b92a7">Loading maps...</div>';

  try {
    const res = await fetch('/api/maps');
    const maps = await res.json();
    list.innerHTML = '';
    if (!maps.length) {
      list.innerHTML = '<div style="color:#8b92a7">No maps saved yet.</div>';
      return;
    }
    maps.forEach(m => {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <strong>${m.name}</strong>
        <p style="color:#aab2cc">${m.slug} · ${m.visibility}</p>
        <div class="btn-group">
          <a class="btn secondary" href="/builder.html?load=${m.slug}">Open</a>
          <a class="btn ghost" href="/s/${m.slug}" target="_blank">Share</a>
        </div>`;
      list.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    list.innerHTML = '<div style="color:#ffb3b3">Error loading maps</div>';
  }
}

// ---------- Hook builder page integration ----------
if (location.pathname.endsWith('builder.html') || location.pathname === '/builder') {
  // Load a saved config if ?load=<slug>
  const slug = new URLSearchParams(location.search).get('load');
  if (slug) {
    fetch('/api/share/' + slug)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        const cfg = JSON.parse(d.cfg_json || '{}');
        // Pass to builder
        window.initialMapCfg = cfg;
        toast(`Loaded saved map: ${d.name}`);
      })
      .catch(() => toast('Failed to load saved map'));
  }

  // Hook save button from builder script (optional)
  window.saveMapToAccount = async (name, cfg, visibility = 'unlisted') => {
    if (!currentUser) {
      toast('Sign in first');
      return;
    }
    try {
      const res = await fetch('/api/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, cfg, visibility })
      });
      const data = await res.json();
      if (data.slug) toast('Map saved!');
    } catch {
      toast('Error saving map');
    }
  };
}

// ---------- Start ----------
getUser();
setActiveRoute();
$('#year').textContent = new Date().getFullYear();
