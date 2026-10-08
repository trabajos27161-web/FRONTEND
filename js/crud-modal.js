import { apiGet, apiPost, apiPut, apiDelete } from './api.js';
import { relationResources } from './resources.js';
import { escapeHtml, localDateTime, toast } from './ui.js';

function displayLabel(item) { return item.nombre ? `${item.nombre}${item.apellido ? ` ${item.apellido}` : ''}` : item.codigo || item.correo || String(item.id); }
function fieldControl(field,value,lookup,editing,readOnly) {
  const required = Boolean(field.required && (!editing || !field.createOnly));
  const common = `name="${field.name}" id="field-${field.name}" ${required?'required':''}`;
  const current = field.type === 'datetime' ? localDateTime(value) : value ?? '';
  if (readOnly) return `<div class="detail-field"><span>${escapeHtml(field.label)}</span><b>${escapeHtml(value ?? '—')}</b></div>`;
  if (field.type === 'boolean') return `<label class="check-control"><input ${common} type="checkbox" ${value ?? field.default ? 'checked' : ''} /><span class="toggle"></span><b>${escapeHtml(field.label)}</b></label>`;
  if (field.type === 'relation') {
    const key = field.relation;
    const options = lookup[key] || [];
    return `<label class="form-field" for="field-${field.name}"><span>${escapeHtml(field.label)}${required?' *':''}</span><select ${common}><option value="">Selecciona…</option>${options.map((item) => `<option value="${item.id}" ${String(item.id)===String(value)?'selected':''}>${escapeHtml(displayLabel(item))} · #${item.id}</option>`).join('')}</select></label>`;
  }
  if (field.type === 'select') return `<label class="form-field"><span>${escapeHtml(field.label)}${required?' *':''}</span><select ${common}><option value="">Selecciona…</option>${field.options.map((item)=>`<option ${item===value?'selected':''}>${escapeHtml(item)}</option>`).join('')}</select></label>`;
  if (field.type === 'textarea') return `<label class="form-field field-wide"><span>${escapeHtml(field.label)}${required?' *':''}</span><textarea ${common} maxlength="${field.max||255}" rows="3">${escapeHtml(current)}</textarea></label>`;
  return `<label class="form-field"><span>${escapeHtml(field.label)}${required?' *':''}</span><input ${common} type="${field.type||'text'}" value="${escapeHtml(current)}" ${field.min!==undefined?`min="${field.min}"`:''} ${field.max!==undefined?`max="${field.max}"`:''} ${field.step?`step="${field.step}"`:''} ${field.minLength?`minlength="${field.minLength}"`:''} ${field.max?`maxlength="${field.max}"`:''} placeholder="${field.type==='password'&&editing?'Vacío conserva la contraseña':''}" /></label>`;
}

export async function openRecordForm({resource,record=null,lookup={},readOnly=false,onSaved=()=>{}}) {
  let original=record;
  if(record && !readOnly) {
    try { original=await apiGet(`${resource.endpoint}${record.id}`); }
    catch(error) { toast(error.message,'error'); return; }
  }
  const editing=Boolean(original);
  const fields=resource.fields.map((field)=>fieldControl(field,original?.[field.name],lookup,editing,readOnly)).join('');
  const overlay=document.createElement('div');
  overlay.className='modal-backdrop';
  overlay.innerHTML=`<section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header class="modal-header"><div><span class="eyebrow">${readOnly?'DETALLE':'GESTIÓN DE REGISTRO'}</span><h2 id="modal-title">${readOnly?'Ver':editing?'Editar':'Nuevo'} ${escapeHtml(resource.singular)}${original?.id?` · #${original.id}`:''}</h2></div><button type="button" class="modal-close" data-close aria-label="Cerrar">×</button></header><form class="record-form"><div class="modal-fields">${fields}</div><div class="form-message" role="alert"></div><footer class="modal-footer"><button type="button" class="button button-quiet" data-close>${readOnly?'Cerrar':'Cancelar'}</button>${readOnly?'':`<button class="button button-primary" type="submit">${editing?'Guardar cambios':'Crear registro'}</button>`}</footer></form></section>`;
  document.body.append(overlay);
  const close=()=>overlay.remove();
  overlay.querySelectorAll('[data-close]').forEach((button)=>button.addEventListener('click',close));
  overlay.addEventListener('click',(event)=>{if(event.target===overlay)close();});
  if(readOnly) {
    overlay.querySelectorAll('input,select,textarea').forEach((input)=>input.disabled=true);
    return;
  }
  overlay.querySelector('.record-form').addEventListener('submit',async(event)=>{
    event.preventDefault();
    const form=event.currentTarget;
    const payload={};
    for(const field of resource.fields) {
      const input=form.elements.namedItem(field.name);
      if(!input) continue;
      if(field.type==='boolean') { payload[field.name]=input.checked; continue; }
      const raw=input.value;
      if(field.type==='password'&&editing&&!raw) continue;
      if(raw==='') { if(editing&&field.clearable) payload[field.name]=null; continue; }
      if(field.type==='number'||field.type==='relation') payload[field.name]=Number(raw);
      else payload[field.name]=raw;
    }
    const start=payload.fecha_asignacion;
    const end=payload.fecha_fin;
    if(start&&end&&new Date(end)<new Date(start)) { form.querySelector('.form-message').textContent='La fecha final no puede ser anterior a la fecha de asignación.'; return; }
    const submit=form.querySelector('[type=submit]');
    submit.disabled=true; submit.textContent='Guardando…';
    try {
      if(editing) await apiPut(`${resource.endpoint}${original.id}`,payload);
      else await apiPost(resource.endpoint,payload);
      close(); toast(`${resource.singular} ${editing?'actualizado':'creado'} correctamente.`); await onSaved();
    } catch(error) {
      form.querySelector('.form-message').textContent=error.message;
      submit.disabled=false; submit.textContent=editing?'Guardar cambios':'Crear registro';
    }
  });
}

export async function confirmDelete(resource,record,onDeleted=()=>{}) {
  const overlay=document.createElement('div');
  overlay.className='modal-backdrop';
  overlay.innerHTML=`<section class="confirm-card" role="alertdialog" aria-modal="true"><div class="confirm-mark">!</div><h2>¿Eliminar este registro?</h2><p>Se eliminará ${escapeHtml(resource.singular)} #${record.id}. Si hay registros relacionados, FastAPI rechazará la operación.</p><div class="confirm-actions"><button class="button button-quiet" data-cancel>Cancelar</button><button class="button button-danger" data-confirm>Eliminar</button></div></section>`;
  document.body.append(overlay);
  overlay.querySelector('[data-cancel]').addEventListener('click',()=>overlay.remove());
  overlay.addEventListener('click',(event)=>{if(event.target===overlay)overlay.remove();});
  overlay.querySelector('[data-confirm]').addEventListener('click',async(event)=>{
    const button=event.currentTarget; button.disabled=true; button.textContent='Eliminando…';
    try { await apiDelete(`${resource.endpoint}${record.id}`); overlay.remove(); toast(`${resource.singular} eliminado correctamente.`); await onDeleted(); }
    catch(error) { overlay.remove(); toast(error.message || 'No se pudo eliminar el registro.', 'error'); }
  });
}
