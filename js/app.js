import { API_URL } from './config.js';
import { apiGet } from './api.js';
import { currentUser, signOut, dashboardForRole } from './auth.js';
import { requireAdmin, requireOperator, requireTechnician } from './guards.js';
import { resources } from './resources.js';
import { renderDashboard } from './dashboard.js';
import { renderCrud } from './crud.js';
import { escapeHtml, toast } from './ui.js';

const body=document.body;
const roleKey=body.dataset.role;
const roleId={admin:1,operator:2,technician:3}[roleKey];
const guard={admin:requireAdmin,operator:requireOperator,technician:requireTechnician}[roleKey];
const user=guard?.();
if(!user) throw new Error('Acceso redirigido por el guard de sesión.');
const pageKey=body.dataset.page || 'dashboard';
const menu={
  admin:[['Dashboard','/admin/index.html','◈','dashboard'],['Usuarios','/admin/usuarios.html','♙','usuarios'],['Roles','/admin/roles.html','⬡','rol'],['Módulos','/admin/modulos.html','▦','modulo'],['Permisos por rol','/admin/permisos.html','⚿','modulo_x_rol'],['Tipos de sensor','/admin/tipos-sensor.html','◉','tipo_sensor'],['Sensores','/admin/sensores.html','⌖','sensor'],['Departamentos','/admin/departamentos.html','▤','dpto'],['Locaciones','/admin/locaciones.html','⌂','locacion'],['Asignaciones','/admin/asignaciones.html','⇄','asignacion_sensor'],['Lecturas','/admin/lecturas.html','⌁','lectura']],
  operator:[['Dashboard','/operador/index.html','◈','dashboard'],['Sensores','/operador/sensores.html','⌖','sensor'],['Lecturas','/operador/lecturas.html','⌁','lectura'],['Mi perfil','/operador/perfil.html','♙','perfil']],
  technician:[['Dashboard','/tecnico/index.html','◈','dashboard'],['Sensores','/tecnico/sensores.html','⌖','sensor'],['Lecturas','/tecnico/lecturas.html','⌁','lectura'],['Asignaciones','/tecnico/asignaciones.html','⇄','asignacion_sensor'],['Mi perfil','/tecnico/perfil.html','♙','perfil']]
};
const titles={admin:'Administración',operator:'Operación',technician:'Soporte técnico'};
const root=document.querySelector('#app');
if(!root) throw new Error('Falta el contenedor #app.');
const active=menu[roleKey].find((item)=>item[3]===pageKey);
const pageTitle=active?.[0] || 'Dashboard';
body.classList.add(`role-${roleKey}`);
document.title=`${pageTitle} · ElectroQuímica`;
root.innerHTML=`<div class="app-shell"><aside class="sidebar" id="sidebar"><a class="brand" href="${dashboardForRole(user.idrol)}"><span class="brand-symbol">e<span>·</span></span><span class="brand-name">electro<strong>química</strong><small>MONITOREO ELECTROQUÍMICO</small></span></a><div class="workspace-label">ESPACIO DE TRABAJO</div><div class="nav-title">${titles[roleKey]}</div><nav class="side-nav" aria-label="Navegación principal">${menu[roleKey].map(([label,href,icon,key])=>`<a class="nav-link ${key===pageKey?'active':''}" href="${href}"><span class="nav-icon">${icon}</span><span>${label}</span>${key===pageKey?'<i class="nav-marker"></i>':''}</a>`).join('')}</nav><div class="sidebar-bottom"><div class="api-state"><i id="api-dot"></i><span><b id="api-state-text">Comprobando API…</b><small>FastAPI · PostgreSQL</small></span></div><button class="logout-button" data-logout><span>↪</span>Cerrar sesión</button><small class="sidebar-version">Sistema de gestión · v1.0</small></div></aside><div class="main-column"><header class="topbar"><button class="mobile-menu" id="mobile-menu" aria-label="Abrir menú">☰</button><div class="breadcrumbs"><span>ElectroQuímica</span><i>/</i><strong>${escapeHtml(pageTitle)}</strong></div><div class="top-actions"><a class="docs-link" href="${API_URL}/docs" target="_blank" rel="noreferrer">Swagger <span>↗</span></a><div class="user-summary"><span class="user-avatar">${escapeHtml((user.nombre||'E').slice(0,1).toUpperCase())}</span><span><b>${escapeHtml(user.nombre)} ${escapeHtml(user.apellido)}</b><small>${escapeHtml(user.rol)}</small></span></div></div></header><main class="page-area"><div id="page-content"></div><footer class="app-footer"><span>ElectroQuímica <i>·</i> Plataforma de sensores</span><span>Conectado vía API REST</span></footer></main></div></div>`;

document.querySelector('[data-logout]').addEventListener('click',signOut);
document.querySelector('#mobile-menu').addEventListener('click',()=>document.querySelector('#sidebar').classList.toggle('sidebar-open'));
apiGet('/health').then(()=>{document.querySelector('#api-dot')?.classList.add('online');const s=document.querySelector('#api-state-text');if(s)s.textContent='API conectada';}).catch(()=>{const s=document.querySelector('#api-state-text');if(s)s.textContent='API sin conexión';});

const content=document.querySelector('#page-content');
if(pageKey==='dashboard') renderDashboard(content,roleKey,user);
else if(pageKey==='perfil') content.innerHTML=`<section class="page-intro"><div><span class="eyebrow">CUENTA PERSONAL</span><h1>Mi perfil</h1><p>Información de la sesión demo activa.</p></div></section><section class="content-card profile-card"><div class="profile-avatar">${escapeHtml((user.nombre||'E').slice(0,1).toUpperCase())}</div><div class="profile-details"><span class="eyebrow">DATOS DE USUARIO</span><h2>${escapeHtml(user.nombre)} ${escapeHtml(user.apellido)}</h2><dl><dt>Correo</dt><dd>${escapeHtml(user.correo)}</dd><dt>Rol</dt><dd>${escapeHtml(user.rol)}</dd><dt>ID de rol</dt><dd>${Number(user.idrol)}</dd><dt>Estado</dt><dd><span class="state-label good">Sesión demo activa</span></dd></dl><p class="data-note">Esta cuenta se mantiene en LocalStorage solo para demostrar la navegación. No corresponde a una sesión autenticada por FastAPI.</p></div></section>`;
else if(resources[pageKey]) renderCrud(content,pageKey,roleKey);
else { toast('La vista solicitada no está disponible.','error'); window.location.replace(dashboardForRole(roleId)); }
