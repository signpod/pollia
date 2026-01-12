# 번들 최적화 작업 보고서

**작업 기간**: 2026-01-12
**브랜치**: `feat/fe/bundle-analyzer`
**기준 커밋**: `eeaa6583` → `b010af57`

---

## 요약

### Turbopack 빌드 청크 크기 (실제 프로덕션)

| 항목 | Before | After | 변화 |
|------|--------|-------|------|
| 총 청크 크기 | 6.64 MB | 6.64 MB | **+3.4 KB (+0.1%)** |
| 청크 수 | 94개 | 95개 | +1 |
| JavaScript | 6.34 MB | 6.34 MB | +3.4 KB |
| CSS | 304.1 KB | 304.2 KB | +52 B |

> ⚠️ Turbopack은 자체 최적화가 우수하여 수동 최적화 효과가 미미함

### Lighthouse 성능 (홈페이지 `/`)

| 메트릭 | Before | After | 변화 |
|--------|--------|-------|------|
| Performance Score | 58점 | 60점 | **+2점** |
| Total Blocking Time | 160 ms | 0 ms | **-160 ms** |
| Largest Contentful Paint | 9.5 s | 8.8 s | **-0.7 s** |
| First Contentful Paint | 6.1 s | 6.1 s | - |

### 콜드 스타트 TTFB

| Route | Before | After | 변화 |
|-------|--------|-------|------|
| `/login` | 115 ms | 97 ms | -18 ms (-15.7%) |
| `/mission/[id]` | 498 ms | 480 ms | -18 ms (-3.6%) |

---

## 결론

### 번들 크기

**Turbopack에서 수동 최적화 효과 없음.**

Turbopack은 자체적으로 트리쉐이킹과 코드 스플리팅을 수행하여, optimizePackageImports, dynamic import, barrel export 정리 등의 수동 최적화가 총 번들 크기에 영향을 주지 않음.

### Lighthouse 점수

**로딩 순서 최적화로 소폭 개선.**

TBT 160ms → 0ms, LCP -0.7s 개선은 번들 크기가 아닌 코드 로딩 순서와 파싱 우선순위 변화에 의한 것으로 추정.

### 콜드 스타트

**유의미하지 않음.**

18ms 개선은 체감 불가능한 수준이며, FCP 6.1초 대비 0.3% 수준.

---

## 작업 내역

### 1. optimizePackageImports 확장 (`230f6967`)

```js
experimental: {
  optimizePackageImports: [
    "lucide-react", "date-fns", "framer-motion",
    "@radix-ui/*", "@dnd-kit/*", "recharts",
  ],
}
```

### 2. @nivo/sankey dynamic import (`88ccc954`)

Admin 리포트 페이지의 Sankey 차트를 dynamic import로 분리.

### 3. 미사용 패키지 제거 (`ba6c5a86`)

### 4. dayjs/motion 마이그레이션 시도 및 롤백 (`335ddea9` → `9b1a7c57`)

번들 크기 증가로 롤백.

### 5. TiptapEditor/TiptapViewer barrel export 정리 (`9962b4f2`)

- barrel export에서 TiptapEditor, TiptapViewer 제거
- 개별 export 경로 추가
- Admin 페이지에 TiptapEditorLazy 래퍼 생성
- Mission 페이지 직접 import로 변경

### 6. webpack bundle-analyzer 제거 (`b010af57`)

- Turbopack과 호환되지 않아 제거
- Turbopack 청크 비교 스크립트(`compare-chunks.cjs`)로 대체

---

## 큰 청크 목록 (100KB 이상)

| 파일 | 크기 |
|------|------|
| 0bcc438b76ea7509.js | 566.0 KB |
| 12b452d10c911cc3.js | 566.0 KB |
| f190c4664a33feea.js | 566.0 KB |
| f29437698e99bfd2.js | 359.9 KB |
| 8d488529b65bd4de.js | 286.2 KB |
| 49b58a09bb6a9cc3.js | 275.2 KB |
| 6d0a9133c612c913.js | 183.2 KB |
| 8742bd582e7753be.css | 155.6 KB |

---

## 수정된 파일 목록

### 설정 파일
- `apps/web/next.config.js` - optimizePackageImports 설정
- `apps/web/package.json` - 스크립트 정리
- `packages/ui/package.json` - TiptapEditor/TiptapViewer 개별 export
- `packages/ui/src/components/index.ts` - barrel export 정리

### 새로 생성된 파일
- `apps/web/src/app/admin/components/common/TiptapEditorLazy.tsx`
- `apps/web/scripts/compare-chunks.cjs`
- `apps/web/scripts/measure-cold-start.cjs`
- `apps/web/scripts/compare-cold-start.cjs`

### 수정된 컴포넌트 (17개)
- Admin 페이지 8개 (TiptapEditorLazy 적용)
- Mission 페이지 4개 (TiptapViewer 직접 import)
- Storybook 2개

---

## 커밋 히스토리

```
b010af57 refactor: webpack bundle-analyzer 제거 및 Turbopack 청크 비교 스크립트 추가
68a8b8da chore: 콜드 스타트 측정 스크립트 추가
1882f21d docs: 번들 최적화 작업 보고서 문서화
9962b4f2 refactor: TiptapEditor/TiptapViewer barrel export 정리로 번들 최적화
3665620b chore: 롤백 후 번들 분석 스냅샷 업데이트
9b1a7c57 revert: dayjs/motion 마이그레이션 롤백
88135fe4 refactor: date-fns에서 dayjs로 마이그레이션
335ddea9 refactor: framer-motion에서 motion 패키지로 마이그레이션
701fd4b3 chore: 번들 분석 및 비교 스크립트 추가
ba6c5a86 refactor: 미사용 패키지 제거
88ccc954 refactor: @nivo/sankey 차트 dynamic import로 번들 분리
230f6967 refactor: optimizePackageImports 확장으로 번들 최적화
```

---

## 향후 참고사항

- **Turbopack 번들 분석**: Next.js 16.1+에서 `npx next experimental-analyze` 사용 가능
- **실제 성능 개선**: 서버 응답 시간(TTFB), Edge Runtime, ISR/SSG 적용이 더 효과적
- **번들 크기 최적화**: Turbopack 사용 시 수동 최적화 불필요
