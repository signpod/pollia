export {
  createClient as createSupabaseClient,
  createClient as createServerSupabaseClient,
} from "./utils/supabase/middleware";

export { default as prisma } from "./utils/prisma/client";

export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "./types/database";
