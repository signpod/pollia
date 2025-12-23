---
paths: ["apps/storybook/**"]
---

# Storybook 작성 컨벤션 (apps/storybook)

## 폴더 구조

스토리북은 세 가지 카테고리로 구분됩니다:

```
src/stories/
  ├── common/          # 공통 UI 컴포넌트 (@repo/ui)
  ├── layout/          # 레이아웃 컴포넌트
  └── pollia/          # Pollia 도메인 특화 컴포넌트
```

### 카테고리별 사용 기준

- **common/**: `@repo/ui/components`의 재사용 가능한 기본 컴포넌트
- **layout/**: 페이지 레이아웃 관련 컴포넌트
- **pollia/**: 비즈니스 로직이 포함된 Pollia 특화 컴포넌트

## 파일 네이밍

- 파일명: `ComponentName.stories.tsx` (PascalCase)
- 컴포넌트 이름과 동일하게 유지

## Import 규칙

스토리북에서 컴포넌트를 import할 때는 반드시 다음 경로를 사용해야 합니다:

### 올바른 Import

```tsx
import { ComponentName } from "@repo/ui/components";
import { Button, Input } from "@repo/ui/components";
```

### 잘못된 Import

```tsx
// 상대 경로 사용 금지
import { ComponentName } from "../../../packages/ui/src/components/common/ComponentName";

// 직접 경로 사용 금지
import { ComponentName } from "@repo/ui/components/common/ComponentName";
```

**이유:** `@repo/ui/components`는 중앙 index에서 export되므로 일관된 import 경로를 유지합니다.

## 기본 구조

### Meta 정의

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs";
import { ComponentName } from "@repo/ui/components";

const meta: Meta<typeof ComponentName> = {
  title: "Category/ComponentName", // 카테고리/컴포넌트명
  component: ComponentName,
  parameters: {
    layout: "centered", // 또는 "fullscreen", "padded"
  },
  tags: ["autodocs"], // 자동 문서 생성
  argTypes: {
    // Props 컨트롤 정의
  },
};

export default meta;
type Story = StoryObj<typeof meta>;
```
