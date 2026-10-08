import {
  seedDemoAccounts,
  saveSession,
  readSession,
  clearSession,
  getDemoAccounts
} from './storage.js';

export function signInDemo(email, password) {
  seedDemoAccounts();

  const accounts = getDemoAccounts();

  const normalizedEmail = String(email || '')
    .trim()
    .toLowerCase();

  const normalizedPassword = String(password || '');

  const user = accounts.find(
    (item) =>
      String(item.correo).trim().toLowerCase() === normalizedEmail &&
      String(item.password) === normalizedPassword
  );

  if (!user) {
    throw new Error(
      'Correo o contraseña incorrectos.'
    );
  }

  saveSession(user);

  const session = readSession();

  if (!session) {
    throw new Error(
      'No se pudo crear la sesión.'
    );
  }

  return session;
}

export function currentUser() {
  return readSession();
}

export function signOut() {
  clearSession();
  window.location.replace('/login.html');
}

export function dashboardForRole(idrol) {
  const dashboards = {
    1: '/admin/index.html',
    2: '/operador/index.html',
    3: '/tecnico/index.html'
  };

  return dashboards[Number(idrol)] || '/login.html';
}
