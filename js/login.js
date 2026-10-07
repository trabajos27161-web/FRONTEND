import { seedDemoAccounts, hasSession } from './storage.js';
import { signInDemo, currentUser, dashboardForRole } from './auth.js';

seedDemoAccounts();
const active=currentUser();
if(active && hasSession()) window.location.replace(dashboardForRole(active.idrol));
const form=document.querySelector('#login-form');
const email=document.querySelector('#email');
const password=document.querySelector('#password');
const error=document.querySelector('#login-error');
const submit=document.querySelector('#login-submit');
form?.addEventListener('submit',(event)=>{
  event.preventDefault(); error.textContent=''; submit.disabled=true; submit.textContent='Validando…';
  try { const user=signInDemo(email.value,password.value); window.location.replace(dashboardForRole(user.idrol)); }
  catch (exception) { error.textContent=exception.message; submit.disabled=false; submit.textContent='Iniciar sesión'; }
});
document.querySelector('#toggle-password')?.addEventListener('click',()=>{
  const visible=password.type==='text'; password.type=visible?'password':'text';
  document.querySelector('#toggle-password').textContent=visible?'Mostrar':'Ocultar';
});
document.querySelectorAll('[data-demo]').forEach((button)=>button.addEventListener('click',()=>{
  const [userPass,userEmail]=button.dataset.demo.split('|'); email.value=userEmail; password.value=userPass; email.focus();
}));
