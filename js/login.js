import {
  seedDemoAccounts,
  hasSession
} from './storage.js';

import {
  signInDemo,
  currentUser,
  dashboardForRole
} from './auth.js';


// ======================================================
// INICIALIZAR USUARIOS PREDETERMINADOS
// ======================================================

seedDemoAccounts();


// ======================================================
// SI YA EXISTE UNA SESIÓN, IR AL DASHBOARD
// ======================================================

const activeUser = currentUser();

if (activeUser && hasSession()) {
  window.location.replace(
    dashboardForRole(activeUser.idrol)
  );
}


// ======================================================
// ELEMENTOS DEL FORMULARIO
// ======================================================

const form = document.querySelector('#login-form');
const email = document.querySelector('#email');
const password = document.querySelector('#password');
const error = document.querySelector('#login-error');
const submit = document.querySelector('#login-submit');
const togglePassword = document.querySelector('#toggle-password');


// ======================================================
// LOGIN
// ======================================================

form?.addEventListener('submit', (event) => {
  event.preventDefault();

  // Limpiar mensaje anterior
  if (error) {
    error.textContent = '';
  }

  // Validar campos
  const userEmail = email?.value.trim() || '';
  const userPassword = password?.value || '';

  if (!userEmail || !userPassword) {
    if (error) {
      error.textContent = 'Ingrese su correo y contraseña.';
    }

    return;
  }

  // Deshabilitar botón
  if (submit) {
    submit.disabled = true;
    submit.textContent = 'Validando…';
  }

  try {

    // Intentar iniciar sesión
    const user = signInDemo(
      userEmail,
      userPassword
    );

    // Validar usuario recibido
    if (!user || !user.idrol) {
      throw new Error(
        'No se pudo establecer la sesión del usuario.'
      );
    }

    // Obtener dashboard correspondiente al rol
    const destination = dashboardForRole(
      user.idrol
    );

    // Validar destino
    if (!destination) {
      throw new Error(
        'El usuario no tiene un dashboard asignado.'
      );
    }

    // Redirigir
    window.location.replace(destination);

  } catch (exception) {

    console.error(
      'Error durante el inicio de sesión:',
      exception
    );

    if (error) {
      error.textContent =
        exception?.message ||
        'Correo o contraseña incorrectos.';
    }

    if (submit) {
      submit.disabled = false;
      submit.textContent = 'Iniciar sesión';
    }
  }
});


// ======================================================
// MOSTRAR / OCULTAR CONTRASEÑA
// ======================================================

togglePassword?.addEventListener('click', () => {

  const visible = password.type === 'text';

  password.type = visible
    ? 'password'
    : 'text';

  togglePassword.textContent = visible
    ? 'Mostrar'
    : 'Ocultar';
});


// ======================================================
// BOTONES DE ACCESO DEMO
// ======================================================

document
  .querySelectorAll('[data-demo]')
  .forEach((button) => {

    button.addEventListener('click', () => {

      const value = button.dataset.demo || '';

      const parts = value.split('|');

      if (parts.length !== 2) {
        return;
      }

      const [
        userPass,
        userEmail
      ] = parts;

      if (email) {
        email.value = userEmail;
      }

      if (password) {
        password.value = userPass;
      }

      email?.focus();
    });

  });
