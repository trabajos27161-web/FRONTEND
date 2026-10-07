# ElectroQuímica · Frontend vanilla

Aplicación HTML5, CSS3 y JavaScript vanilla que consume exclusivamente la API FastAPI por `fetch`. No contiene acceso directo a PostgreSQL.

## Ejecutar localmente

1. Inicia el backend desde la raíz `ElectroQuimica` del proyecto:

   ```powershell
   python -m uvicorn main:app --reload
   ```

   API: `http://127.0.0.1:8000`; Swagger: `http://127.0.0.1:8000/docs`.

2. Desde esta carpeta `frontend`, inicia Vite:

   ```powershell
   npm install
   npm run dev
   ```

3. Abre la dirección que imprime Vite (por defecto `http://localhost:5173`). FastAPI debe permitir el origen `http://localhost:5173` en `CORS_ORIGINS`.

La URL de la API se configura una sola vez en `js/config.js` (`API_URL`). Para producción, reemplázala por la URL HTTPS del servicio FastAPI en Render y vuelve a ejecutar `npm run build`. Publica la carpeta `dist/` en Netlify.

## Login de demostración

El backend inspeccionado no dispone de endpoint de login ni token. El frontend proporciona cuentas DEMO guardadas en LocalStorage, solo para probar las pantallas y la navegación por roles:

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@electroquimica.com` | `Admin123456` |
| Operador | `operador@electroquimica.com` | `Operador123456` |
| Técnico | `tecnico@electroquimica.com` | `Tecnico123456` |

No son usuarios de Neon. Las contraseñas DEMO se almacenan localmente en el navegador y no deben reutilizarse. Los guards de frontend controlan navegación, pero no reemplazan autenticación/autorización real en la API.

## Conexión y API comprobada

`js/api.js` centraliza `apiGet`, `apiPost`, `apiPut`, `apiDelete` y `apiGetAll`. Los recursos del backend real son `/usuarios/`, `/roles/`, `/modulos/`, `/modulo-x-rol/`, `/tipos-sensor/`, `/sensores/`, `/dptos/`, `/locaciones/`, `/asignaciones-sensor/` y `/lecturas/`. Cada recurso admite GET lista/detalle, POST, PUT y DELETE; las colecciones se cargan con `page` y `page_size` (máximo 100 por página). El frontend pagina localmente una vez que obtiene las páginas disponibles.

Los filtros de fecha y calidad de lecturas se ejecutan en frontend: el backend no expone parámetros de fecha/calidad en la URL. El dashboard calcula estadísticas mediante GET reales. El backend tampoco registra mantenimientos, así que el panel técnico presenta instalación y asignaciones existentes.

## Estructura

- `login.html`, `admin/`, `operador/`, `tecnico/`: páginas HTML y guards por rol.
- `css/`: estilos globales, login y variaciones por rol.
- `js/config.js`, `api.js`: origen único y capa fetch de API.
- `js/storage.js`, `auth.js`, `guards.js`: sesión demo y control de navegación.
- `js/resources.js`, `crud.js`, `crud-modal.js`: esquemas frontend alineados con Pydantic y operaciones CRUD.
- `js/dashboard.js`, `app.js`, `ui.js`, `login.js`: dashboards, layout, mensajes y login.
- `assets/`: recursos locales.

## Agregar roles y módulos

Los roles DEMO actuales usan los IDs 1, 2 y 3 del requerimiento. Para una sesión real, sustituye `signInDemo` en `js/auth.js` por el endpoint de autenticación cuando FastAPI lo implemente y conserva el contrato `authUser`. La configuración de menús por rol vive en `js/app.js`; la lista de recursos/API está en `js/resources.js`.
