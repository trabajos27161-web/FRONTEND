import { API_URL } from './config.js';

async function request(method, endpoint, data) {
  const options = { method, headers: { Accept: 'application/json' } };
  if (data !== undefined) { options.headers['Content-Type'] = 'application/json'; options.body = JSON.stringify(data); }
  let response;
  try { response = await fetch(`${API_URL}${endpoint}`, options); }
  catch { throw new Error(`No se pudo conectar con la API en ${API_URL}. Verifica FastAPI y CORS.`); }
  if (!response.ok) {
    const raw = await response.text();
    let body; try { body = JSON.parse(raw); } catch { body = raw; }
    const detail = body?.detail ?? body?.message ?? body;
    const message = Array.isArray(detail)
      ? detail.map((e) => `${Array.isArray(e.loc) ? e.loc.slice(1).join('.') + ': ' : ''}${e.msg || JSON.stringify(e)}`).join('\n')
      : typeof detail === 'string' ? detail : JSON.stringify(detail);
    const labels = {400:'Solicitud inv\u00e1lida',401:'Sesi\u00f3n no autorizada',403:'Acceso denegado',404:'Registro no encontrado',409:'Conflicto con un registro existente o relacionado',422:'Revisa los campos del formulario',500:'Error interno de la API'};
    throw new Error(`${labels[response.status] || `Error HTTP ${response.status}`}${message ? `: ${message}` : ''}`);
  }
  if (response.status === 204) return null;
  return response.json();
}
export const apiGet = (endpoint) => request('GET', endpoint);
export const apiPost = (endpoint, data) => request('POST', endpoint, data);
export const apiPut = (endpoint, data) => request('PUT', endpoint, data);
export const apiDelete = (endpoint) => request('DELETE', endpoint);
export async function apiGetAll(endpoint) {
  const all=[]; let page=1;
  while(page<=100) {
    const separator=endpoint.includes('?')?'&':'?';
    const rows=await apiGet(`${endpoint}${separator}page=${page}&page_size=100`);
    all.push(...rows); if(rows.length<100) return all; page++;
  }
  throw new Error('La consulta super\u00f3 10 000 filas; usa una b\u00fasqueda m\u00e1s espec\u00edfica.');
}
