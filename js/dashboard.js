import { apiGetAll } from './api.js';
import { resources } from './resources.js';
import { escapeHtml, formatDate } from './ui.js';

const relationPaths = { sensors:resources.sensor.endpoint, readings:resources.lectura.endpoint, users:resources.usuarios.endpoint, assignments:resources.asignacion_sensor.endpoint, locations:resources.locacion.endpoint };
const load = (key) => apiGetAll(relationPaths[key]);
function metric(label, value, note, icon, tone='green') { return `<article class="metric metric-${tone}"><span class="metric-icon">${icon}</span><div><small>${label}</small><strong>${value}</strong><span>${note}</span></div></article>`; }
function relationName(items, id, key) {
  const item = items.find((row) => String(row.id) === String(id));
  if (!item) return `#${id ?? '—'}`;
  if (key === 'users') return `${item.nombre} ${item.apellido}`;
  return item.nombre || item.codigo || `#${item.id}`;
}
function latestTable(readings, sensors, locations, take=6) {
  if (!readings.length) return '<div class="empty-state">Todavía no hay lecturas registradas.</div>';
  return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Sensor</th><th>Locación</th><th>pH</th><th>Temperatura</th><th>Fecha</th><th>Calidad</th></tr></thead><tbody>${readings.slice(0,take).map((r) => `<tr><td><b>${escapeHtml(relationName(sensors,r.idsensor,'sensors'))}</b></td><td>${escapeHtml(relationName(locations,r.idlocacion,'locations'))}</td><td><span class="ph-chip">${escapeHtml(r.valor)}</span></td><td>${r.temperatura == null ? '—' : `${escapeHtml(r.temperatura)} °C`}</td><td>${formatDate(r.fecha_hora)}</td><td>${escapeHtml(r.calidad || '—')}</td></tr>`).join('')}</tbody></table></div>`;
}

export async function renderDashboard(target, role, user) {
  target.innerHTML = `<div class="loading-panel"><span class="spinner"></span><p>Cargando datos reales desde FastAPI…</p></div>`;
  try {
    const keys = role === 'admin' ? ['users','sensors','readings','locations','assignments'] : role === 'operator' ? ['sensors','readings','locations'] : ['sensors','readings','assignments','locations'];
    const values = await Promise.all(keys.map(load));
    const data = Object.fromEntries(keys.map((key,i) => [key,values[i]]));
    const sensors = data.sensors || [];
    const readings = data.readings || [];
    const locations = data.locations || [];
    const active = sensors.filter((s) => s.estado === true).length;
    const inactive = sensors.length - active;
    const sensorById = (id) => sensors.find((s) => String(s.id) === String(id));
    const greeting = `Hola, ${escapeHtml(user.nombre)}`;
    if (role === 'admin') {
      const users = data.users || [];
      const alerts = readings.filter((r) => /error|mala|fallida|alerta/i.test(r.calidad || '')).length;
      target.innerHTML = `<section class="page-intro"><div><span class="eyebrow">CENTRO DE CONTROL · ADMINISTRACIÓN</span><h1>${greeting}</h1><p>Resumen actualizado consultando los registros del backend.</p></div><div class="intro-mark">EQ<span>·</span></div></section><section class="metric-grid">${metric('Usuarios',users.length,'cuentas registradas','♙','violet')}${metric('Sensores',sensors.length,'en el inventario','⌖','green')}${metric('Sensores activos',active,`${inactive} inactivos`,'◉','blue')}${metric('Lecturas',readings.length,`${alerts} con calidad marcada para revisar`,'⌁','amber')}</section><section class="content-card"><div class="card-heading"><div><span class="eyebrow">TELEMETRÍA</span><h2>Últimas lecturas</h2></div><a class="subtle-link" href="/admin/lecturas.html">Ver todas <span>→</span></a></div>${latestTable(readings,sensors,locations,8)}</section><section class="content-card quick-card"><div class="card-heading"><div><span class="eyebrow">GESTIÓN</span><h2>Accesos rápidos</h2></div></div><div class="quick-grid"><a href="/admin/sensores.html"><b>⌖</b><span>Administrar sensores</span><i>→</i></a><a href="/admin/usuarios.html"><b>♙</b><span>Gestionar usuarios</span><i>→</i></a><a href="/admin/locaciones.html"><b>⌂</b><span>Ver locaciones</span><i>→</i></a></div></section>`;
      return;
    }
    const latest = readings[0];
    const latestSensor = latest ? sensorById(latest.idsensor) : null;
    if (role === 'operator') {
      target.innerHTML = `<section class="page-intro operator-intro"><div><span class="eyebrow">OPERACIÓN · MONITOREO</span><h1>${greeting}</h1><p>Estado de la red y últimas mediciones registradas.</p></div><a class="outline-link" href="/operador/lecturas.html">Abrir lecturas →</a></section><section class="metric-grid">${metric('Sensores activos',active,'de '+sensors.length+' registrados','◉','green')}${metric('Última lectura pH',latest?.valor ?? '—',latest ? formatDate(latest.fecha_hora) : 'Sin lecturas','⌁','blue')}${metric('Temperatura',latest?.temperatura == null ? '—' : `${latest.temperatura} °C`,latestSensor?.codigo || 'Sensor más reciente','♨','amber')}</section><section class="monitor-grid"><article class="monitor-card ph-monitor"><span class="eyebrow">MEDICIÓN MÁS RECIENTE</span><div class="monitor-value"><strong>${latest?.valor ?? '—'}</strong><span>pH</span></div><div class="ph-scale"><i></i></div><div class="scale-labels"><span>Ácido · 0</span><span>Neutro · 7</span><span>Alcalino · 14</span></div><p>${latest ? `Sensor ${escapeHtml(latestSensor?.codigo || `#${latest.idsensor}`)} · ${formatDate(latest.fecha_hora)}` : 'No hay mediciones disponibles.'}</p></article><article class="monitor-card status-monitor"><span class="eyebrow">ESTADO DEL SENSOR</span><div class="sensor-status ${latestSensor?.estado ? 'is-active' : 'is-inactive'}"><i></i><strong>${latestSensor ? (latestSensor.estado ? 'Activo' : 'Inactivo') : 'Sin datos'}</strong></div><h3>${escapeHtml(latestSensor?.nombre || 'Esperando sensor')}</h3><p>${latestSensor ? `${escapeHtml(latestSensor.codigo)} · ${escapeHtml(latestSensor.ubicacion_fisica || 'Ubicación sin definir')}` : 'Registra sensores para iniciar el monitoreo.'}</p></article></section><section class="content-card"><div class="card-heading"><div><span class="eyebrow">EN TIEMPO RECIENTE</span><h2>Lecturas recientes</h2></div><a class="subtle-link" href="/operador/lecturas.html">Ver historial →</a></div>${latestTable(readings,sensors,locations,8)}</section>`;
      return;
    }
    const installed = sensors.filter((s) => s.fecha_instalacion).length;
    const assignments = data.assignments || [];
    const currentAssignments = assignments.filter((a) => a.estado === 'ACTIVA').length;
    target.innerHTML = `<section class="page-intro technician-intro"><div><span class="eyebrow">MANTENIMIENTO · VISTA TÉCNICA</span><h1>${greeting}</h1><p>Inventario, instalación y asignaciones de los equipos.</p></div><a class="outline-link" href="/tecnico/asignaciones.html">Ver asignaciones →</a></section><section class="metric-grid">${metric('Sensores instalados',installed,'con fecha registrada','⌖','blue')}${metric('Sensores activos',active,`${inactive} requieren revisión`,'◉','green')}${metric('Asignaciones activas',currentAssignments,'equipos en seguimiento','⇄','amber')}</section><section class="content-card"><div class="card-heading"><div><span class="eyebrow">INVENTARIO TÉCNICO</span><h2>Sensores y ubicación</h2></div><a class="subtle-link" href="/tecnico/sensores.html">Abrir inventario →</a></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Código</th><th>Sensor</th><th>Modelo</th><th>Fabricante</th><th>Ubicación</th><th>Instalación</th><th>Estado</th></tr></thead><tbody>${sensors.slice(0,20).map((s) => `<tr><td><b>${escapeHtml(s.codigo)}</b></td><td>${escapeHtml(s.nombre)}</td><td>${escapeHtml(s.modelo || '—')}</td><td>${escapeHtml(s.fabricante || '—')}</td><td>${escapeHtml(s.ubicacion_fisica || '—')}</td><td>${formatDate(s.fecha_instalacion,false)}</td><td><span class="state-label ${s.estado ? 'good' : 'off'}">${s.estado ? 'Activo' : 'Inactivo'}</span></td></tr>`).join('') || '<tr><td colspan="7" class="empty-state">No hay sensores registrados.</td></tr>'}</tbody></table></div><p class="data-note">El backend actual no tiene un recurso ni un campo de mantenimiento; esta vista presenta las fechas de instalación y las asignaciones existentes.</p></section><section class="content-card"><div class="card-heading"><div><span class="eyebrow">TELEMETRÍA</span><h2>Lecturas recientes</h2></div><a class="subtle-link" href="/tecnico/lecturas.html">Ver lecturas →</a></div>${latestTable(readings,sensors,locations,5)}</section>`;
  } catch (error) {
    target.innerHTML = `<div class="error-panel"><b>No se pudo cargar el panel</b><p>${escapeHtml(error.message)}</p><button class="button button-primary" data-retry>Reintentar</button></div>`;
    target.querySelector('[data-retry]')?.addEventListener('click', () => renderDashboard(target,role,user));
  }
}
