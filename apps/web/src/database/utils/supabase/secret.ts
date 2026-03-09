// 모듈 최상위에서 환경변수를 검증하면 빌드 시점(Collecting page data)에
// 환경변수가 없는 CI 환경에서 빌드가 실패하므로, lazy 초기화로 런타임에만 검증합니다.
import "server-only";
import { type SupabaseClient, createClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabaseSecret(): SupabaseClient {
  if (!client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SERVICE_SECRET_KEY;

    if (!supabaseUrl) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL 환경변수가 설정되지 않았습니다.");
    }

    if (!supabaseSecretKey) {
      throw new Error("SUPABASE_SERVICE_SECRET_KEY 환경변수가 설정되지 않았습니다.");
    }

    client = createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return client;
}
