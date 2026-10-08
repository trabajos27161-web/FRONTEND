import { hasSession, readSession } from './storage.js';
import { dashboardForRole } from './auth.js';

export function requireAuth() {
  if (!hasSession()) { window.location.replace('/login.html'); return null; }
  return readSession();
}
export function requireRole(roleId) {
  const user = requireAuth();
  if (!user) return null;
  if (Number(user.idrol) !== Number(roleId)) { window.location.replace(dashboardForRole(user.idrol)); return null; }
  return user;
}
export const requireAdmin = () => requireRole(1);
export const requireOperator = () => requireRole(2);
export const requireTechnician = () => requireRole(3);
