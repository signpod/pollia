# Pollia Web

## 배포 시 DB 연결 (Supabase Pooler)

풀러(6543)를 쓰는 경우 `DATABASE_URL`에 **`?pgbouncer=true`** 를 꼭 붙이세요.  
없으면 `prepared statement "s0" already exists` (Postgres 42P05) 오류가 납니다.

- ✅ `postgresql://...pooler.supabase.com:6543/postgres?pgbouncer=true`
- ❌ `postgresql://...pooler.supabase.com:6543/postgres`

Vercel 등 배포 환경의 `DATABASE_URL` 값을 위처럼 수정한 뒤 재배포하면 됩니다.
