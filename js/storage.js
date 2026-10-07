const SESSION_USER = 'authUser';
const SESSION_FLAG = 'isAuthenticated';
const DEMO_ACCOUNTS_KEY = 'demoAccounts';

const DEMO_ACCOUNTS = [
  {
    id: 1,
    nombre: 'Administración',
    apellido: 'ElectroQuímica',
    correo: 'admin@electroquimica.com',
    password: 'Admin123456',
    idrol: 1,
    rol: 'Administrador'
  },
  {
    id: 2,
    nombre: 'Operador',
    apellido: 'ElectroQuímica',
    correo: 'operador@electroquimica.com',
    password: 'Operador123456',
    idrol: 2,
    rol: 'Operador'
  },
  {
    id: 3,
    nombre: 'Técnico',
    apellido: 'ElectroQuímica',
    correo: 'tecnico@electroquimica.com',
    password: 'Tecnico123456',
    idrol: 3,
    rol: 'Técnico'
  }
];

/**
 * Crea los usuarios predeterminados si todavía no existen.
 */
export function seedDemoAccounts() {
  if (!localStorage.getItem(DEMO_ACCOUNTS_KEY)) {
    localStorage.setItem(
      DEMO_ACCOUNTS_KEY,
      JSON.stringify(DEMO_ACCOUNTS)
    );
  }
}

/**
 * Obtiene los usuarios predeterminados.
 */
export function getDemoAccounts() {
  seedDemoAccounts();

  try {
    return JSON.parse(
      localStorage.getItem(DEMO_ACCOUNTS_KEY) || '[]'
    );
  } catch {
    return [];
  }
}

/**
 * Valida correo y contraseña.
 */
export function loginWithCredentials(correo, password) {
  const users = getDemoAccounts();

  const email = String(correo || '')
    .trim()
    .toLowerCase();

  const pass = String(password || '');

  const user = users.find(
    (item) =>
      String(item.correo).trim().toLowerCase() === email &&
      String(item.password) === pass
  );

  if (!user) {
    return {
      success: false,
      user: null,
      message: 'Correo o contraseña incorrectos.'
    };
  }

  saveSession(user);

  return {
    success: true,
    user: readSession(),
    message: 'Inicio de sesión correcto.'
  };
}

/**
 * Guarda la sesión.
 */
export function saveSession(user) {
  if (!user) {
    clearSession();
    return false;
  }

  const {
    password,
    ...safeUser
  } = user;

  localStorage.setItem(
    SESSION_USER,
    JSON.stringify(safeUser)
  );

  localStorage.setItem(
    SESSION_FLAG,
    'true'
  );

  return true;
}

/**
 * Lee la sesión actual.
 */
export function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_USER);

    if (!raw) {
      return null;
    }

    const user = JSON.parse(raw);

    if (!user || !user.id || !user.correo) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

/**
 * Comprueba si existe una sesión válida.
 */
export function hasSession() {
  const flag = localStorage.getItem(SESSION_FLAG);
  const user = readSession();

  return flag === 'true' && !!user;
}

/**
 * Obtiene el usuario actual.
 */
export function getCurrentUser() {
  return readSession();
}

/**
 * Obtiene el rol actual.
 */
export function getCurrentRole() {
  const user = readSession();

  return user?.rol || null;
}

/**
 * Obtiene el ID del rol actual.
 */
export function getCurrentRoleId() {
  const user = readSession();

  return user?.idrol || null;
}

/**
 * Comprueba si el usuario tiene determinado rol.
 */
export function hasRole(role) {
  const user = readSession();

  return !!user && user.rol === role;
}

/**
 * Cierra la sesión.
 */
export function clearSession() {
  localStorage.removeItem(SESSION_USER);
  localStorage.removeItem(SESSION_FLAG);
}

/**
 * Cierra sesión y vuelve al login.
 */
export function logout() {
  clearSession();
  window.location.href = '/login.html';
}
