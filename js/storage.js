const SESSION_USER = 'authUser';
const SESSION_FLAG = 'isAuthenticated';

// DEMO ONLY: these sample credentials stay in this browser and are not backend accounts.
const DEMO_ACCOUNTS = [
  { id:1, nombre:'Administración', apellido:'ElectroQuímica', correo:'admin@electroquimica.com', password:'Admin123456', idrol:1, rol:'Administrador' },
  { id:2, nombre:'Operador', apellido:'ElectroQuímica', correo:'operador@electroquimica.com', password:'Operador123456', idrol:2, rol:'Operador' },
  { id:3, nombre:'Técnico', apellido:'ElectroQuímica', correo:'tecnico@electroquimica.com', password:'Tecnico123456', idrol:3, rol:'Técnico' }
];

export function seedDemoAccounts() {
  if (!localStorage.getItem('demoAccounts')) localStorage.setItem('demoAccounts', JSON.stringify(DEMO_ACCOUNTS));
}
export function saveSession(user) {
  const { password, ...safeUser } = user;
  localStorage.setItem(SESSION_USER, JSON.stringify(safeUser));
  localStorage.setItem(SESSION_FLAG, 'true');
}
export function readSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_USER) || 'null'); }
  catch { return null; }
}
export function hasSession() { return localStorage.getItem(SESSION_FLAG) === 'true' && !!readSession(); }
export function clearSession() {
  localStorage.removeItem(SESSION_USER);
  localStorage.removeItem(SESSION_FLAG);
}
