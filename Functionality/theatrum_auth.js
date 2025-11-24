// Basic client-side auth demo (localStorage).
// Not production: no backend, no encryption, only for demo flows.

const authRoot = document.getElementById('authRoot');
const openAuthBtn = document.getElementById('openAuth');

function openAuth(step='choice'){
  authRoot.classList.remove('hidden');
  showStep(step);
}
function closeAuth(){
  authRoot.classList.add('hidden');
}
function showStep(step){
  document.querySelectorAll('#authRoot .auth-step').forEach(s => s.classList.add('hidden'));
  const node = document.querySelector(`#authRoot .auth-step[data-step="${step}"]`);
  if(node) node.classList.remove('hidden');
}

openAuthBtn?.addEventListener('click', () => openAuth('choice'));
authRoot?.addEventListener('click', (e) => {
  if(e.target.matches('[data-close]')) closeAuth();
  if(e.target.matches('[data-next]')) showStep(e.target.getAttribute('data-next'));
});

// Persisted mock users
const USERS_KEY = 'theatrum.users';
const SESSION_KEY = 'theatrum.session';
const VERIFY_CODE = '000000';

function getUsers(){
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return []; }
}
function saveUsers(users){ localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
function setSession(email){ localStorage.setItem(SESSION_KEY, JSON.stringify({ email, ts: Date.now() })); }
function clearSession(){ localStorage.removeItem(SESSION_KEY); }
function getSession(){ try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; } }

// Signup
const signupForm = document.getElementById('signupForm');
signupForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = new FormData(signupForm);
  const name = form.get('name').trim();
  const email = form.get('email').trim().toLowerCase();
  const password = form.get('password');

  const users = getUsers();
  if(users.some(u => u.email === email)){
    alert('Account already exists. Please log in.');
    showStep('login');
    return;
  }
  users.push({ name, email, password, verified: false });
  saveUsers(users);

  document.getElementById('verifyEmailOut').textContent = email;
  sessionStorage.setItem('verifyTarget', email);
  alert('Demo code: 000000');
  showStep('verify');
});

// Login
const loginForm = document.getElementById('loginForm');
loginForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = new FormData(loginForm);
  const email = form.get('email').trim().toLowerCase();
  const password = form.get('password');

  const users = getUsers();
  const u = users.find(u => u.email === email && u.password === password);
  if(!u){ alert('Invalid credentials'); return; }
  if(!u.verified){
    document.getElementById('verifyEmailOut').textContent = email;
    sessionStorage.setItem('verifyTarget', email);
    alert('Demo code: 000000');
    showStep('verify');
    return;
  }
  setSession(email);
  document.getElementById('welcomeName').textContent = u.name || 'Guest';
  showStep('welcome');
});

// Verify
const verifyForm = document.getElementById('verifyForm');
verifyForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = new FormData(verifyForm);
  const code = form.get('code').trim();
  const target = sessionStorage.getItem('verifyTarget');
  if(!target){ alert('No verification target. Please sign up or log in again.'); return; }

  if(code !== VERIFY_CODE){ alert('Incorrect code. Try 000000 for demo.'); return; }

  const users = getUsers();
  const idx = users.findIndex(u => u.email === target);
  if(idx >= 0){
    users[idx].verified = true;
    saveUsers(users);
    setSession(target);
    document.getElementById('welcomeName').textContent = users[idx].name || 'Guest';
    showStep('welcome');
  } else {
    alert('User not found.');
  }
});

document.getElementById('resendCode')?.addEventListener('click', () => {
  alert('Demo code resent: 000000');
});

// Guest path
document.querySelector('#authRoot [data-next="guest"]')?.addEventListener('click', () => {
  clearSession();
  setSession('guest@theatrum.local');
  document.getElementById('welcomeName').textContent = 'Guest';
  showStep('welcome');
});

// When welcome closed, update UI label
authRoot?.addEventListener('click', (e) => {
  if(e.target.matches('[data-close]')){
    const session = getSession();
    if(session){
      const btn = document.getElementById('openAuth');
      btn.textContent = session.email.startsWith('guest') ? 'Guest' : 'Account';
    }
  }
});
