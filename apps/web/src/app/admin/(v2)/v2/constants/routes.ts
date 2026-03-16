const V2_BASE = "/admin/v2";

export const ADMIN_V2_ROUTES = {
  HOME: V2_BASE,
  USERS: `${V2_BASE}/users`,
  CONTENTS: `${V2_BASE}/contents`,
  BANNERS: `${V2_BASE}/banners`,
} as const;
