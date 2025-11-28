const ADMIN_BASE = "/admin";

export const ADMIN_ROUTES = {
  ADMIN: ADMIN_BASE,
  ADMIN_LOGIN: "/login/admin",
  ADMIN_SURVEYS: `${ADMIN_BASE}/surveys`,
  ADMIN_SURVEY: (id: string) => `${ADMIN_BASE}/surveys/${id}`,
  ADMIN_SURVEY_CREATE: `${ADMIN_BASE}/survey/create`,
  ADMIN_SURVEY_EDIT: (id: string) => `${ADMIN_BASE}/surveys/${id}/edit`,
  ADMIN_SETTINGS: `${ADMIN_BASE}/settings`,
} as const;

export type AdminRoutes = typeof ADMIN_ROUTES;
