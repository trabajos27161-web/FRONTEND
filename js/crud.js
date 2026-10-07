import { apiGetAll } from './api.js';
import { resources, labels } from './resources.js';
import { escapeHtml, formatDate, toast } from './ui.js';
import { openRecordForm, confirmDelete } from './crud-modal.js';

const relationRoutes = {
  idrol:resources.rol.endpoint, idmodulo:resources.modulo.endpoint, idtiposensor:resources.tipo_sensor.endpoint,
  iddpto:resources.dpto.endpoint, idsensor:resources.sensor.endpoint, idlocacion:resources.locacion.endpoint, idusuario:resources.usuarios.endpoint
};
const relationKey = {idrol:'rol',idmodulo:'modulo',idtiposensor:'tipo_sensor',iddpto:'dpto',idsensor:'sensor',idlocacion:'locacion',idusuario:'usuarios'};

export async function renderCrud(container, key, role) {
  const resource = resources[key];
  const readOnly = role !== 'admin';
  container.innerHTML = `<div class="loading-panel"><span class="spinner"></span><p>Cargando ${escapeHtml(resource.label.toLowerCase())}…</p></div>`;
  try {
    let [rows, relatedPairs] = await Promise.all([
      apiGetAll(resource.endpoint),
      Promise.all(Object.entries(relationRoutes).map(async ([field,path]) => [relationKey[field], await apiGetAll(path)]))
    ]);
    const lookup = Object.fromEntries(relatedPairs);
    let search = '', quality = '', dateFrom = '', dateTo = '', page = 1;
    const pageSize = 15;
    const selected = () => rows.filter((row) => {
      const text = resource.search.map((field) => String(row[field] ?? '')).join(' ').toLocaleLowerCase();
      if (search && !text.includes(search.toLocaleLowerCase())) return false;
      if (key === 'lectura') {
        const date = String(row.fecha_hora || '').slice(0,10);
        if (dateFrom && date < dateFrom) return false;
        if (dateTo && date > dateTo) return false;
        if (quality && String(row.calidad || '') !== quality) return false;
      }
      return true;
    });
    const relationValue = (field,value) => {
      if (!relationRoutes[field] || value == null) return value ?? '—';
      const item = (lookup[relationKey[field]] || []).find((record) => String(record.id) === String(value));
      if (!item) return `#${value}`;
      if (field === 'idusuario') return `${item.nombre} ${item.apellido}`;
      if (field === 'idsensor') return `${item.codigo} · ${item.nombre}`;
      return item.nombre || item.codigo || `#${item.id}`;
    };
    const format = (row,field) => {
      let value = row[field];
      if (relationRoutes[field]) value = relationValue(field,value);
      else if (field.startsWith('fecha_')) value = formatDate(value);
      else if (field === 'estado' && typeof value === 'boolean') value = value ? 'Activo' : 'Inactivo';
      return escapeHtml(value ?? '—');
    };
    function draw() {
      const filtered = selected();
      const pages = Math.max(1,Math.ceil(filtered.length/pageSize));
      page = Math.min(page,pages);
      const visible = filtered.slice((page-1)*pageSize,page*pageSize);
      const qualityOptions = key === 'lectura' ? [...new Set(rows.map((r) => r.calidad).filter(Boolean))].sort() : [];
      container.innerHTML = `<section class="page-intro"><div><span class="eyebrow">${readOnly ? 'MONITOREO' : 'ADMINISTRACIÓN'} · ${escapeHtml(resource.label.toUpperCase())}</span><h1>${escapeHtml(resource.label)}</h1><p>${readOnly ? 'Consulta los registros disponibles en la API.' : 'Gestiona la información guardada en PostgreSQL.'}</p></div><span class="record-total">${rows.length} registros</span></section>
      <section class="content-card crud-card"><div class="crud-toolbar"><label class="search-control"><span>⌕</span><input data-search placeholder="Buscar ${escapeHtml(resource.label.toLowerCase())}…" value="${escapeHtml(search)}" aria-label="Buscar ${escapeHtml(resource.label)}" /></label>${key === 'lectura' ? `<label class="filter-control"><span>Desde</span><input type="date" data-date-from value="${dateFrom}" /></label><label class="filter-control"><span>Hasta</span><input type="date" data-date-to value="${dateTo}" /></label><label class="filter-control"><span>Calidad</span><select data-quality><option value="">Todas</option>${qualityOptions.map((q) => `<option ${q === quality ? 'selected' : ''}>${escapeHtml(q)}</option>`).join('')}</select></label>` : ''}<span class="toolbar-spacer"></span><button class="button button-quiet" data-refresh>↻ Actualizar</button>${readOnly ? '' : `<button class="button button-primary" data-new>＋ Nuevo ${escapeHtml(resource.singular)}</button>`}</div>
      <div class="table-wrap"><table class="data-table"><thead><tr>${resource.columns.map((field) => `<th>${escapeHtml(labels[field] || field)}</th>`).join('')}<th class="action-col">Acciones</th></tr></thead><tbody>${visible.length ? visible.map((row) => `<tr>${resource.columns.map((field) => `<td>${field === 'estado' ? `<span class="state-label ${row.estado === false || row.estado === 'FINALIZADA' ? 'off' : 'good'}">${format(row,field)}</span>` : field === 'valor' ? `<span class="ph-chip">${format(row,field)}</span>` : `<span class="cell-value" title="${format(row,field)}">${format(row,field)}</span>`}</td>`).join('')}<td class="actions">${readOnly ? '' : `<button class="table-action" data-action="edit" data-id="${row.id}" title="Editar">Editar</button><button class="table-action danger-text" data-action="delete" data-id="${row.id}" title="Eliminar">Eliminar</button>`}<button class="table-action" data-action="view" data-id="${row.id}" title="Ver">Ver</button></td></tr>`).join('') : `<tr><td colspan="${resource.columns.length+1}" class="empty-state">${search || quality || dateFrom || dateTo ? 'No hay resultados con estos filtros.' : 'No hay registros disponibles.'}</td></tr>`}</tbody></table></div>
      <div class="table-pagination"><span>${filtered.length ? `Mostrando ${(page-1)*pageSize+1}–${Math.min(page*pageSize,filtered.length)} de ${filtered.length}` : '0 resultados'}</span><div><button class="button button-quiet" data-prev ${page<=1?'disabled':''}>← Anterior</button><b>${page} / ${pages}</b><button class="button button-quiet" data-next ${page>=pages?'disabled':''}>Siguiente →</button></div></div></section>`;
    }
    draw();
    container.addEventListener('input', (event) => {
      if (event.target.matches('[data-search]')) { search = event.target.value.trim(); page = 1; draw(); const input=container.querySelector('[data-search]'); input?.focus(); input?.setSelectionRange(search.length,search.length); }
      if (event.target.matches('[data-date-from]')) { dateFrom=event.target.value; page=1; draw(); }
      if (event.target.matches('[data-date-to]')) { dateTo=event.target.value; page=1; draw(); }
    });
    container.addEventListener('change', (event) => { if(event.target.matches('[data-quality]')) { quality=event.target.value; page=1; draw(); } });
    container.addEventListener('click', async (event) => {
      const button=event.target.closest('button'); if(!button) return;
      if(button.matches('[data-refresh]')) { try { rows=await apiGetAll(resource.endpoint); draw(); } catch(error) { toast(error.message,'error'); } return; }
      if(button.matches('[data-prev]')) { page--; draw(); return; }
      if(button.matches('[data-next]')) { page++; draw(); return; }
      if(button.matches('[data-new]')) { openRecordForm({resource,lookup,onSaved:async()=>{ rows=await apiGetAll(resource.endpoint); draw(); }}); return; }
      if(button.dataset.action) {
        const row=rows.find((record) => String(record.id)===button.dataset.id); if(!row) return;
        if(button.dataset.action==='delete') { await confirmDelete(resource,row,async()=>{ rows=await apiGetAll(resource.endpoint); draw(); }); return; }
        if(button.dataset.action==='edit' && !readOnly) { openRecordForm({resource,record:row,lookup,onSaved:async()=>{ rows=await apiGetAll(resource.endpoint); draw(); }}); return; }
        if(button.dataset.action==='view') { openRecordForm({resource,record:row,lookup,readOnly:true}); }
      }
    });
  } catch(error) {
    container.innerHTML=`<div class="error-panel"><b>No se pudieron cargar ${escapeHtml(resource.label.toLowerCase())}</b><p>${escapeHtml(error.message)}</p><button class="button button-primary" data-retry>Reintentar</button></div>`;
    container.querySelector('[data-retry]')?.addEventListener('click',()=>renderCrud(container,key,role));
  }
}
