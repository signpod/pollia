---
paths: ["apps/web/src/schemas/**"]
---

# Validation 스키마 컨벤션

## 개요

Pollia는 **Zod 스키마**를 사용하여 End-to-End 검증을 수행합니다.
Client와 Server가 동일한 스키마를 공유하되, Server는 필요 시 확장합니다.

### 핵심 원칙

1. **End-to-End 검증**: Client와 Server가 동일한 기본 스키마 사용
2. **보안 분리**: Server 전용 필드(Role, creatorId 등)는 Server에서만 처리
3. **데이터 단위**: CRUD 동작이 아닌 데이터 단위로 스키마 구성
4. **확장 패턴**: Client 스키마를 기반으로 Server가 필요 시 확장

---

## 디렉토리 구조

```
src/schemas/
├── survey/
│   ├── index.ts              # re-export
│   └── surveySchema.ts       # survey 데이터 스키마
├── user/
│   ├── index.ts
│   └── userSchema.ts
├── reward/
│   ├── index.ts
│   └── rewardSchema.ts
└── index.ts                  # 전체 re-export
```

### 디렉토리 구조 원칙

**schemas 디렉토리는 server/services 디렉토리 구조와 동일하게 유지합니다.**

```
server/services/survey/          -> schemas/survey/
server/services/survey-question/ -> schemas/survey-question/
server/services/survey-answer/   -> schemas/survey-answer/
server/services/reward/          -> schemas/reward/
server/services/user/            -> schemas/user/
```

---

## 파일 네이밍 규칙

```
surveySchema.ts            # {도메인}Schema.ts
userSchema.ts              # {도메인}Schema.ts
rewardSchema.ts            # {도메인}Schema.ts

# 잘못된 예시
createSurveySchema.ts      # CRUD 동작 기반 금지
updateRewardSchema.ts      # CRUD 동작 기반 금지
SurveySchema.ts            # PascalCase 파일명 금지
```

---

## 스키마 작성 패턴

### 기본 구조

```typescript
// schemas/user/userSchema.ts
import { z } from "zod";

// ============================================
// 필드 스키마 (내부 재사용)
// ============================================
const nameSchema = z
  .string()
  .min(1, "이름을 입력해주세요.")
  .max(50, "이름은 50자를 초과할 수 없습니다.")
  .trim();

const emailSchema = z
  .string()
  .email("올바른 이메일 형식이 아닙니다.");

const roleSchema = z.enum(["USER", "ADMIN", "MODERATOR"]);

// ============================================
// Client 스키마 (End-to-End 공유)
// ============================================
export const userInputSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  // role은 없음! Client가 결정하는 게 아님
});

export const userUpdateSchema = z
  .object({
    name: nameSchema.optional(),
    email: emailSchema.optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: "최소 하나의 필드를 수정해야 합니다.",
  });

// ============================================
// Server 확장 스키마 (Server 전용)
// ============================================
export const userServerSchema = userInputSchema.extend({
  role: roleSchema.default("USER"),
});

// ============================================
// 타입 export
// ============================================
export type UserInput = z.infer<typeof userInputSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type UserServer = z.infer<typeof userServerSchema>;
```

### Client vs Server 스키마

| 구분 | Client 스키마 | Server 확장 스키마 |
|------|--------------|-------------------|
| **사용처** | Client 폼, Server Action | Service 내부 |
| **필드** | 사용자 입력 필드만 | + Server 전용 필드 |
| **예시** | `userInputSchema` | `userServerSchema` |
| **보안** | 안전 (사용자 입력만) | 민감 필드 포함 가능 |

### Server 전용 필드 예시

```typescript
// Client 스키마에 포함하면 안 되는 필드
role          // 권한 - Server가 결정
creatorId     // 생성자 - Session에서 가져옴
isAdmin       // 관리자 여부 - Server가 결정
verifiedAt    // 인증 일시 - Server가 설정
```

---

## 사용 예시

### Client에서 사용

```typescript
// Client 폼 검증
import { userInputSchema, type UserInput } from "@/schemas/user";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function UserForm() {
  const form = useForm<UserInput>({
    resolver: zodResolver(userInputSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  // ...
}
```

### Service에서 사용 (기본)

```typescript
// Service - Client 스키마로 검증
import { userInputSchema } from "@/schemas/user";
import type { CreateUserInput } from "./types";

export class UserService {
  async createUser(input: CreateUserInput, sessionUserId: string) {
    // Client 입력 검증
    const result = userInputSchema.safeParse(input);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    // Server가 role 추가
    return this.repo.create({
      ...result.data,
      role: "USER",  // Server가 결정
    });
  }
}
```

---

## 스키마 확장 패턴

### extend 사용

```typescript
// 기본 스키마
export const surveyInputSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
});

// Server 확장
export const surveyServerSchema = surveyInputSchema.extend({
  creatorId: z.string().min(1),
  isActive: z.boolean().default(true),
});
```

### partial 사용 (Update용)

```typescript
const inputSchema = z.object({
  title: z.string().min(1),
  description: z.string().max(100),
});

// 모든 필드를 optional로
const updateSchema = inputSchema.partial().refine(
  data => Object.keys(data).length > 0,
  { message: "최소 하나의 필드를 수정해야 합니다." }
);
```

---

## 에러 메시지 가이드

### 사용자 친화적 메시지

```typescript
// 좋은 예 - 사용자가 이해하기 쉬움
z.string().min(1, "제목을 입력해주세요.")
z.string().max(30, "제목은 30자를 초과할 수 없습니다.")
z.string().email("올바른 이메일 형식이 아닙니다.")

// 나쁜 예 - 기술적 용어
z.string().min(1, "Required")
z.string().max(30, "Max length exceeded")
z.string().email("Invalid email format")
```

### 일관된 메시지 패턴

```typescript
// 필수 입력
"{필드명}을(를) 입력해주세요."

// 길이 제한
"{필드명}은(는) {N}자를 초과할 수 없습니다."
"{필드명}은(는) 최소 {N}자 이상이어야 합니다."

// 형식 오류
"올바른 {형식} 형식이 아닙니다."

// 범위 제한
"{필드명}은(는) {N} 이상이어야 합니다."
"{필드명}은(는) {N} 이하여야 합니다."
```

---

## 도메인 로직 구현 시 체크리스트

새로운 도메인 스키마 구현 시:

- [ ] `/schemas/{도메인}/` 폴더 생성
- [ ] `{도메인}Schema.ts` 작성
  - [ ] 필드 스키마 정의 (내부 재사용)
  - [ ] `{도메인}InputSchema` 정의 (Client 공유)
  - [ ] `{도메인}UpdateSchema` 정의 (필요시)
  - [ ] `{도메인}ServerSchema` 정의 (Server 확장 필요시)
  - [ ] 타입 export
- [ ] `index.ts`에서 re-export
- [ ] `/schemas/index.ts`에 도메인 추가
- [ ] Service에서 스키마 import 및 검증 적용
- [ ] Client 폼에서 스키마 사용
