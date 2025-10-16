# @repo/tailwind-config

TurboRepo용 공통 Tailwind CSS 설정 패키지입니다. (공식 TurboRepo 권장 방법 적용)

## 사용법

### PostCSS 설정

```js
// postcss.config.js
import { postcssConfig } from "@repo/tailwind-config/postcss";

export default postcssConfig;
```

### CSS 파일에서 import

```css
/* globals.css 또는 main CSS 파일에서 */
@import "@repo/tailwind-config";
```

## 포함된 설정

### Shared Styles (`shared-styles.css`)

- Tailwind CSS import
- Tailwind v4 @theme 토큰
- 컬러 시스템 (라이트/다크 모드)
- 타이포그래피와 브레이크포인트
- shadcn/ui 호환 CSS 변수
- 기본 스타일 리셋
- 커스텀 유틸리티 클래스
- 투표 관련 컴포넌트 스타일
- **Safe Area 유틸리티** (iOS/Android notch 및 제스처 영역 대응)

### PostCSS Configuration

- @tailwindcss/postcss 플러그인 설정
- 공통 PostCSS 설정 객체 제공

## 패키지 구조

```
packages/tailwind-config/
├── package.json          # exports 정의 ("." -> shared-styles.css)
├── shared-styles.css     # 통합된 Tailwind 설정
├── postcss.config.js     # postcssConfig 객체 export
└── README.md
```

## 요구사항

- Tailwind CSS v4+
- PostCSS
- @tailwindcss/postcss 플러그인

## Safe Area 유틸리티 사용법

모바일 기기의 notch나 gesture 영역을 고려한 padding/margin을 적용할 수 있습니다.

### 기본 Safe Area 클래스

```tsx
// Padding
<div className="pt-safe">     {/* padding-top */}
<div className="pb-safe">     {/* padding-bottom */}
<div className="px-safe">     {/* padding-left & right */}
<div className="py-safe">     {/* padding-top & bottom */}
<div className="p-safe">      {/* padding all sides */}

// Margin
<div className="mt-safe">     {/* margin-top */}
<div className="mb-safe">     {/* margin-bottom */}
<div className="mx-safe">     {/* margin-left & right */}
<div className="my-safe">     {/* margin-top & bottom */}
<div className="m-safe">      {/* margin all sides */}

// Position
<div className="fixed top-safe">     {/* top: safe-area-inset-top */}
<div className="fixed bottom-safe">  {/* bottom: safe-area-inset-bottom */}

// Height
<div className="h-safe-screen">      {/* 100vh - safe areas */}
<div className="min-h-safe-screen">  {/* min-height with safe areas */}
```

### Safe Area + 추가 여백

```tsx
<div className="pt-safe-4">   {/* safe-area-inset-top + 1rem */}
<div className="pb-safe-4">   {/* safe-area-inset-bottom + 1rem */}
<div className="px-safe-4">   {/* safe-area-inset-left/right + 1rem */}
<div className="py-safe-4">   {/* safe-area-inset-top/bottom + 1rem */}
```

### 실제 사용 예시

```tsx
// 상단 고정 헤더
<header className="fixed top-0 w-full pt-safe bg-white">
  <div className="px-4 py-4">Header Content</div>
</header>

// 하단 고정 네비게이션
<nav className="fixed bottom-0 w-full pb-safe bg-white">
  <div className="px-4 py-2">Navigation</div>
</nav>

// 전체 화면 레이아웃
<div className="min-h-safe-screen py-safe px-safe">
  Content
</div>
```

## TurboRepo 공식 방법

이 패키지는 [TurboRepo 공식 문서](https://turbo.build/repo/docs/guides/tools/tailwind)에서 권장하는 방법을 따릅니다.
