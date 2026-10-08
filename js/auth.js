import { seedDemoAccounts, saveSession, readSession, clearSession } from './storage.js';

export function signInDemo(email, password) {
  seedDemoAccounts();
  const accounts = JSON.parse(localStorage.getItem('demoAccounts') || '[]');
  const user = accounts.find((item) => item.correo.toLowerCase() === email.trim().toLowerCase() && item.password === password);
  if (!user) throw new Error('Correo o contraseña incorrectos. Usa una de las cuentas demo.');
  saveSession(user);
  return readSession();
}
export function currentUser() { return readSession(); }
export function signOut() { clearSession(); window.location.replace('/login.html'); }
export function dashboardForRole(idrol) {
  return ({ 1:'/admin/index.html', 2:'/operador/index.html', 3:'/tecnico/index.html' })[Number(idrol)] || '/login.html';
}
