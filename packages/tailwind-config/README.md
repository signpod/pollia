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

## TurboRepo 공식 방법

이 패키지는 [TurboRepo 공식 문서](https://turbo.build/repo/docs/guides/tools/tailwind)에서 권장하는 방법을 따릅니다.
