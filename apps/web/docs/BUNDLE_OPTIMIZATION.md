# 번들 최적화 작업 보고서

**작업 기간**: 2026-01-12
**브랜치**: `feat/fe/bundle-analyzer`
**기준 커밋**: `eeaa6583` → `6d8b2516`

---

## 요약

| 항목 | Before | After | 변화 |
|------|--------|-------|------|
| First Load JS (shared) | 491 KB | 376 KB | **-115 KB (23%)** |
| Lighthouse Performance | 58점 | 60점 | **+2점** |
| Total Blocking Time | 160 ms | 0 ms | **-160 ms** |
| Largest Contentful Paint | 9.5 s | 8.8 s | **-0.7 s** |

---

## 작업 내역

### 1. optimizePackageImports 확장 (`230f6967`)

`next.config.js`에 트리쉐이킹 최적화 패키지 추가:

```js
experimental: {
  optimizePackageImports: [
    "lucide-react",
    "date-fns",
    "framer-motion",
    "@tiptap/react",
    "@tiptap/starter-kit",
    "@tiptap/extensions",
  ],
}
```

### 2. @nivo/sankey dynamic import (`88ccc954`)

Admin 리포트 페이지의 Sankey 차트를 dynamic import로 분리:

```tsx
const SankeyChart = dynamic(
  () => import("@nivo/sankey").then(mod => mod.ResponsiveSankey),
  { ssr: false }
);
```

### 3. 미사용 패키지 제거 (`ba6c5a86`)

- `react-error-boundary` 제거
- 기타 미사용 의존성 정리

### 4. 번들 분석 스크립트 추가 (`701fd4b3`)

`package.json`에 번들 분석 명령어 추가:

```json
{
  "scripts": {
    "analyze": "ANALYZE=true next build",
    "analyze:compare": "node scripts/compare-bundles.js"
  }
}
```

### 5. dayjs/motion 마이그레이션 시도 및 롤백 (`335ddea9` → `9b1a7c57`)

- `framer-motion` → `motion` 마이그레이션 시도
- `date-fns` → `dayjs` 마이그레이션 시도
- **결과**: 번들 크기 증가로 롤백

### 6. TiptapEditor/TiptapViewer barrel export 정리 (`6d8b2516`)

`@repo/ui` 패키지의 barrel export에서 무거운 컴포넌트 분리:

**변경 사항:**
- `packages/ui/src/components/index.ts`에서 TiptapEditor, TiptapViewer export 제거
- `packages/ui/package.json`에 개별 export 경로 추가
- Admin 페이지에 `TiptapEditorLazy` 래퍼 생성 (dynamic import)
- `CreateActionDialog`, `EditActionDialog`에 12개 action form dynamic import 적용
- Mission 페이지들 직접 import 경로로 변경

**효과:**
- prosemirror/tiptap 청크 (112KB)가 shared에서 제거됨
- TiptapViewer 사용 페이지에서만 해당 청크 로드

---

## 수정된 파일 목록

### 설정 파일
- `apps/web/next.config.js` - optimizePackageImports 설정
- `apps/web/package.json` - 번들 분석 스크립트 추가
- `packages/ui/package.json` - TiptapEditor/TiptapViewer 개별 export 추가
- `packages/ui/src/components/index.ts` - barrel export 정리

### 새로 생성된 파일
- `apps/web/src/app/admin/components/common/TiptapEditorLazy.tsx`
- `apps/web/scripts/compare-bundles.js`

### Admin 페이지 (TiptapEditorLazy 적용)
- `apps/web/src/app/admin/missions/[id]/components/edit/shared.tsx`
- `apps/web/src/app/admin/missions/[id]/edit/components/BasicInfoEditTab.tsx`
- `apps/web/src/app/admin/missions/[id]/edit/components/CompletionEditTab.tsx`
- `apps/web/src/app/admin/missions/[id]/edit/components/CreateActionDialog.tsx`
- `apps/web/src/app/admin/missions/[id]/edit/components/EditActionDialog.tsx`
- `apps/web/src/app/admin/missions/[id]/edit/components/action-forms/BaseActionForm.tsx`
- `apps/web/src/app/admin/missions/create/components/BasicInfoCard.tsx`
- `apps/web/src/app/admin/missions/create/components/CompletionStep.tsx`

### Mission 페이지 (TiptapViewer 직접 import)
- `apps/web/src/app/mission/[missionId]/components/MissionDescription.tsx`
- `apps/web/src/app/mission/[missionId]/action/[actionId]/components/ActionTemplate.tsx`
- `apps/web/src/app/mission/[missionId]/done/ui/MissionCompletion.tsx`
- `apps/web/src/app/mission/[missionId]/done/ui/components/CompletionMessage.tsx`

### Storybook
- `apps/storybook/src/stories/common/TiptapEditor.stories.tsx`
- `apps/storybook/src/stories/common/TiptapViewer.stories.tsx`

---

## Lighthouse 성능 비교 (홈페이지 `/`)

| 메트릭 | Before | After | 변화 |
|--------|--------|-------|------|
| Performance Score | 58 | 60 | **+2점** |
| First Contentful Paint | 6.1s | 6.1s | - |
| Largest Contentful Paint | 9.5s | 8.8s | **-0.7s** |
| Total Blocking Time | 160ms | 0ms | **-160ms** |
| Cumulative Layout Shift | 0 | 0 | - |
| Speed Index | 6.1s | 6.1s | - |

---

## 페이지별 번들 크기 비교

| 페이지 | Before | After | 변화 |
|--------|--------|-------|------|
| `/` (홈) | 466 KB | 351 KB | -115 KB |
| `/login` | 665 KB | 546 KB | -119 KB |
| `/me` | 529 KB | 414 KB | -115 KB |
| `/admin` | 537 KB | 429 KB | -108 KB |
| `/admin/missions/create` | 648 KB | 533 KB | -115 KB |
| `/mission/[id]` | 747 KB | 744 KB | -3 KB |
| `/mission/[id]/action/[id]` | 827 KB | 824 KB | -3 KB |

> Mission 페이지는 TiptapViewer를 실제 사용하므로 해당 청크가 포함되어 변화가 적음

---

## 커밋 히스토리

```
6d8b2516 refactor: TiptapEditor/TiptapViewer barrel export 정리로 번들 최적화
3665620b chore: 롤백 후 번들 분석 스냅샷 업데이트
9b1a7c57 revert: dayjs/motion 마이그레이션 롤백 (번들 크기 증가로 인한 롤백)
217ad5c7 chore: 최종 번들 분석 스냅샷 업데이트
88135fe4 refactor: date-fns에서 dayjs로 마이그레이션
335ddea9 refactor: framer-motion에서 motion 패키지로 마이그레이션
701fd4b3 chore: 번들 분석 및 비교 스크립트 추가
ba6c5a86 refactor: 미사용 패키지 제거
88ccc954 refactor: @nivo/sankey 차트 dynamic import로 번들 분리
230f6967 refactor: optimizePackageImports 확장으로 번들 최적화
```

---

## 결론

- **번들 크기 23% 감소** (491KB → 376KB)
- **Lighthouse 점수 2점 향상** (58 → 60)
- **TBT 160ms 제거**로 메인 스레드 블로킹 해소
- Mission 페이지 외 모든 페이지에서 Tiptap/Prosemirror 로딩 제거

---

## 향후 개선 가능 사항

1. **서버 응답 시간 최적화**: FCP 6.1초는 서버/네트워크 병목으로 추정
2. **이미지 최적화**: LCP 개선을 위한 이미지 로딩 전략 검토
3. **Prefetch 전략**: 주요 경로에 대한 prefetch 적용 검토
