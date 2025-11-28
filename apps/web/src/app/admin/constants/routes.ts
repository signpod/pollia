const ADMIN_BASE = "/admin";

const SURVEYS_BASE = `${ADMIN_BASE}/surveys`;

export const ADMIN_ROUTES = {
  ADMIN: ADMIN_BASE,
  ADMIN_LOGIN: "/login/admin",
  ADMIN_SURVEYS: SURVEYS_BASE,
  ADMIN_SURVEY: (id: string) => `${SURVEYS_BASE}/${id}`,
  ADMIN_SURVEY_CREATE: `${SURVEYS_BASE}/create`,
  ADMIN_SURVEY_EDIT: (id: string) => `${SURVEYS_BASE}/${id}/edit`,
  ADMIN_SETTINGS: `${ADMIN_BASE}/settings`,
} as const;

export type AdminRoutes = typeof ADMIN_ROUTES;
