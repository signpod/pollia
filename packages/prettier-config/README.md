# @repo/prettier-config

Pollia 모노레포를 위한 공유 Prettier 설정입니다.

## 사용 방법

앱의 `package.json`에 추가:

```json
{
  "devDependencies": {
    "@repo/prettier-config": "*"
  }
}
```

`.prettierrc.js` 파일 생성:

```js
module.exports = require("@repo/prettier-config");
```

또는 커스텀 규칙으로 확장:

```js
const prettierConfig = require("@repo/prettier-config");

module.exports = {
  ...prettierConfig,
  printWidth: 120,
};
```

## 설정

### 기본 포맷팅

- `semi: true` - 문장 끝에 세미콜론 사용
- `trailingComma: 'all'` - 가능한 모든 곳에 후행 쉼표 추가
- `printWidth: 100` - 줄 너비 100자
- `tabWidth: 2` - 들여쓰기 레벨당 2칸 공백
- `arrowParens: 'avoid'` - 화살표 함수에서 가능한 경우 괄호 생략
- `endOfLine: 'auto'` - 기존 줄바꿈 문자 유지

### Import 정렬

`@ianvs/prettier-plugin-sort-imports` 플러그인을 사용하여 import 문을 자동으로 정렬합니다.

정렬 순서:

1. React 관련 import (`react`)
2. Next.js 관련 import (`next/*`)
3. 외부 라이브러리 (node_modules)
4. 모노레포 패키지 (`@repo/*`)
5. 앨리어스 import (`@/*`)
6. 상대 경로 import (`./`, `../`)

각 그룹 사이에는 빈 줄이 자동으로 추가됩니다.

#### 예시

```tsx
import React from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { z } from "zod";
import { Button } from "@repo/ui";
import { api } from "@/lib/api";
import { cn } from "@/utils/cn";
import styles from "./Component.module.css";
import { helper } from "./helper";
```

### Tailwind CSS 클래스 정렬

`prettier-plugin-tailwindcss` 플러그인을 사용하여 Tailwind CSS 클래스를 공식 권장 순서대로 자동 정렬합니다.

#### 정렬 순서

Tailwind의 공식 권장 순서를 따릅니다:

1. Layout (display, position 등)
2. Flexbox & Grid
3. Spacing (margin, padding)
4. Sizing (width, height)
5. Typography
6. Background & Border
7. Effects
8. 기타 유틸리티

#### 예시

**변경 전:**

```tsx
<div className="text-white p-4 bg-blue-500 rounded-lg hover:bg-blue-600 flex items-center">
```

**변경 후:**

```tsx
<div className="flex items-center rounded-lg bg-blue-500 p-4 text-white hover:bg-blue-600">
```
