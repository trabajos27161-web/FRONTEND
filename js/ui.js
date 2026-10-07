export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
}
export function formatDate(value, withTime = true) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return escapeHtml(value);
  return new Intl.DateTimeFormat('es-CO', withTime ? {dateStyle:'medium',timeStyle:'short'} : {dateStyle:'medium'}).format(date);
}
export function localDateTime(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,16);
}
export function toast(message, type = 'success') {
  let region = document.querySelector('.toast-region');
  if (!region) { region = document.createElement('div'); region.className = 'toast-region'; region.setAttribute('aria-live','polite'); document.body.append(region); }
  const node = document.createElement('div');
  node.className = `toast toast-${type}`;
  node.innerHTML = `<span class="toast-icon">${type === 'success' ? '✓' : type === 'warning' ? '!' : '×'}</span><span>${escapeHtml(message)}</span>`;
  region.append(node);
  window.setTimeout(() => node.remove(), 5000);
}
export function setBusy(button, busy, busyLabel = 'Guardando…') {
  if (!button) return;
  if (busy) { button.dataset.label = button.textContent; button.disabled = true; button.textContent = busyLabel; }
  else { button.disabled = false; if (button.dataset.label) button.textContent = button.dataset.label; }
}
