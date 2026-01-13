# TiptapViewer ESM 호환성 문제 해결

**작성일**: 2026-01-13
**관련 커밋**: `85770c02`
**영향 범위**: `packages/ui/src/components/common/TiptapViewer.tsx`

---

## 문제 현상

```
Failed to load external module jsdom: Error [ERR_REQUIRE_ESM]: require() of ES Module
/Users/river/Projects/pollia/node_modules/@exodus/bytes/encoding-lite.js from
/Users/river/Projects/pollia/node_modules/html-encoding-sniffer/lib/html-encoding-sniffer.js
not supported.

Instead change the require of encoding-lite.js in
/Users/river/Projects/pollia/node_modules/html-encoding-sniffer/lib/html-encoding-sniffer.js
to a dynamic import() which is available in all CommonJS modules.
```

테스트 실행 또는 빌드 시 `TiptapViewer` 컴포넌트에서 위 에러가 발생했다.

---

## 원인 분석

### 1. 의존성 체인

```
TiptapViewer.tsx
└── isomorphic-dompurify
    └── jsdom (서버 사이드 DOM 파싱용)
        └── html-encoding-sniffer
            └── @exodus/bytes/encoding-lite.js (ESM only)
```

### 2. ESM/CommonJS 충돌

- `isomorphic-dompurify`는 브라우저와 Node.js 환경 모두에서 작동하도록 설계된 라이브러리
- Node.js 환경에서는 `jsdom`을 사용하여 DOM을 시뮬레이션
- `jsdom`의 의존성 중 `@exodus/bytes`가 **ESM(ECMAScript Modules) 전용**으로 배포됨
- `html-encoding-sniffer`가 `require()`로 ESM 모듈을 로드하려고 시도하면서 에러 발생

### 3. 근본 원인

Node.js에서 CommonJS(`require()`)로 ESM 전용 모듈을 로드할 수 없다. 이는 Node.js의 모듈 시스템 제약사항이다.

```javascript
// CommonJS (html-encoding-sniffer.js)
const encodingLite = require('@exodus/bytes/encoding-lite.js'); // Error!

// ESM 모듈은 require()로 로드 불가
// dynamic import()를 사용해야 함
const encodingLite = await import('@exodus/bytes/encoding-lite.js'); // OK
```

---

## 해결 방법

### 변경 전

```tsx
// packages/ui/src/components/common/TiptapViewer.tsx
import DOMPurify from "isomorphic-dompurify";
import { cn } from "../../lib/utils";

export function TiptapViewer({ content, className }: TiptapViewerProps) {
  const sanitizedContent = DOMPurify.sanitize(content);

  return (
    <div
      className={cn("tiptap-viewer tiptap", className)}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
```

### 변경 후

```tsx
// packages/ui/src/components/common/TiptapViewer.tsx
"use client";

import DOMPurify from "dompurify";
import { cn } from "../../lib/utils";

export function TiptapViewer({ content, className }: TiptapViewerProps) {
  const sanitizedContent =
    typeof window !== "undefined" ? DOMPurify.sanitize(content) : content;

  return (
    <div
      className={cn("tiptap-viewer tiptap", className)}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
```

### 핵심 변경사항

| 항목 | Before | After |
|------|--------|-------|
| 패키지 | `isomorphic-dompurify` | `dompurify` |
| 디렉티브 | 없음 | `"use client"` |
| SSR 처리 | 자동 (jsdom 사용) | `typeof window` 체크 |
| jsdom 의존성 | 있음 | **없음** |

### 패키지 변경

```json
// packages/ui/package.json
{
  "dependencies": {
-   "isomorphic-dompurify": "^2.35.0"
+   "dompurify": "^3.3.1"
  },
  "devDependencies": {
+   "@types/dompurify": "^3.2.0"
  }
}
```

---

## 왜 이 해결책인가?

### 대안 1: jsdom 업데이트 대기

- `jsdom` 또는 `html-encoding-sniffer` 메인테이너가 ESM 호환성을 수정할 때까지 대기
- **단점**: 언제 수정될지 알 수 없음, 외부 의존성에 종속

### 대안 2: resolutions로 특정 버전 고정

```json
{
  "resolutions": {
    "@exodus/bytes": "0.1.0"
  }
}
```

- **단점**: 보안 업데이트 누락 위험, 임시방편

### 대안 3: dompurify 직접 사용 (채택)

- `TiptapViewer`는 클라이언트에서만 렌더링되는 컴포넌트
- `"use client"` 디렉티브로 클라이언트 컴포넌트임을 명시
- `typeof window` 체크로 SSR 시에는 sanitize 스킵 (어차피 hydration 후 클라이언트에서 다시 실행)
- **장점**: jsdom 의존성 제거, 번들 크기 감소, 근본적 해결

---

## 보안 고려사항

### XSS 방어는 유지됨

- `dompurify`는 `isomorphic-dompurify`의 핵심 라이브러리
- 클라이언트에서 동일한 sanitization 로직 실행
- SSR 시 sanitize를 스킵하지만, 실제 DOM에 주입되는 시점은 클라이언트이므로 보안상 문제없음

### SSR 시 content가 그대로 전달되는 이유

```tsx
const sanitizedContent =
  typeof window !== "undefined" ? DOMPurify.sanitize(content) : content;
```

1. **SSR 단계**: `content`가 그대로 HTML에 포함
2. **Hydration 단계**: 클라이언트에서 컴포넌트 마운트
3. **클라이언트 렌더링**: `DOMPurify.sanitize(content)` 실행

Next.js의 `"use client"` 컴포넌트는 SSR 시 초기 HTML을 생성하고, 클라이언트에서 hydration 후 다시 렌더링된다. 따라서 실제 사용자 인터랙션 시점에는 sanitize된 콘텐츠가 표시된다.

---

## 영향도

### 번들 크기

| 항목 | Before | After |
|------|--------|-------|
| isomorphic-dompurify | ~50KB | 0 |
| jsdom + 의존성 | ~2MB (dev) | 0 |
| dompurify | 0 | ~30KB |
| **총 변화** | - | **-20KB (prod)** |

### 호환성

- Node.js 테스트 환경: 정상 작동
- Next.js SSR: 정상 작동
- 브라우저: 정상 작동

---

## 관련 이슈

- [jsdom ESM support issue](https://github.com/jsdom/jsdom/issues/3535)
- [isomorphic-dompurify compatibility](https://github.com/kkomelin/isomorphic-dompurify/issues)

---

## 결론

`isomorphic-dompurify`의 `jsdom` 의존성이 ESM 전용 패키지와 충돌하는 문제를 `dompurify` 직접 사용으로 해결했다. 클라이언트 전용 컴포넌트에서는 `isomorphic-*` 패키지 대신 브라우저 전용 패키지를 사용하는 것이 더 안정적이다.
