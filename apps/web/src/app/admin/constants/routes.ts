const ADMIN_BASE = "/admin";

const MISSIONS_BASE = `${ADMIN_BASE}/missions`;

export const ADMIN_ROUTES = {
  ADMIN: ADMIN_BASE,
  ADMIN_LOGIN: "/login/admin",
  ADMIN_MISSIONS: MISSIONS_BASE,
  ADMIN_MISSION: (id: string) => `${MISSIONS_BASE}/${id}`,
  ADMIN_MISSION_CREATE: `${MISSIONS_BASE}/create`,
  ADMIN_MISSION_EDIT: (id: string) => `${MISSIONS_BASE}/${id}/edit`,
  ADMIN_MISSION_SUBMISSIONS: (id: string) => `${MISSIONS_BASE}/${id}/submissions`,
  ADMIN_MISSION_TRACKING: (id: string) => `${MISSIONS_BASE}/${id}/tracking`,
  ADMIN_MISSION_PASSWORD: (id: string) => `${MISSIONS_BASE}/${id}/password`,
  ADMIN_MISSION_REPORT: (id: string) => `${MISSIONS_BASE}/${id}/report`,
  ADMIN_SETTINGS: `${ADMIN_BASE}/settings`,
} as const;

export type AdminRoutes = typeof ADMIN_ROUTES;
