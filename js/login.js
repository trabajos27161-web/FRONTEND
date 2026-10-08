import {
  seedDemoAccounts,
  hasSession
} from './storage.js';

import {
  signInDemo,
  currentUser,
  dashboardForRole
} from './auth.js';

seedDemoAccounts();

const activeUser = currentUser();

if (activeUser && hasSession()) {
  window.location.replace(
    dashboardForRole(activeUser.idrol)
  );
}

const form = document.querySelector('#login-form');
const email = document.querySelector('#email');
const password = document.querySelector('#password');
const error = document.querySelector('#login-error');
const submit = document.querySelector('#login-submit');
const togglePassword = document.querySelector('#toggle-password');

form?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (error) {
    error.textContent = '';
  }

  const userEmail = email?.value.trim() || '';
  const userPassword = password?.value || '';

  if (!userEmail || !userPassword) {
    if (error) {
      error.textContent =
        'Ingrese su correo y contraseña.';
    }

    return;
  }

  if (submit) {
    submit.disabled = true;
    submit.textContent = 'Validando…';
  }

  try {
    const user = signInDemo(
      userEmail,
      userPassword
    );

    const destination = dashboardForRole(
      user.idrol
    );

    window.location.replace(destination);

  } catch (exception) {
    console.error(
      'Error de inicio de sesión:',
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

togglePassword?.addEventListener('click', () => {
  const visible = password.type === 'text';

  password.type = visible
    ? 'password'
    : 'text';

  togglePassword.textContent = visible
    ? 'Mostrar'
    : 'Ocultar';
});

document
  .querySelectorAll('[data-demo]')
  .forEach((button) => {

    button.addEventListener('click', () => {

      const value = button.dataset.demo || '';
      const [userPass, userEmail] =
        value.split('|');

      if (email) {
        email.value = userEmail || '';
      }

      if (password) {
        password.value = userPass || '';
      }

      email?.focus();
    });

  });
