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

export function seedDemoAccounts() {
  localStorage.setItem(
    DEMO_ACCOUNTS_KEY,
    JSON.stringify(DEMO_ACCOUNTS)
  );
}

export function saveSession(user) {
  if (!user) {
    clearSession();
    return false;
  }

  const { password, ...safeUser } = user;

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

export function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_USER);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.error('Error leyendo la sesión:', error);
    return null;
  }
}

export function hasSession() {
  const user = readSession();
  const flag = localStorage.getItem(SESSION_FLAG);

  return flag === 'true' && user !== null;
}

export function clearSession() {
  localStorage.removeItem(SESSION_USER);
  localStorage.removeItem(SESSION_FLAG);
}

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
