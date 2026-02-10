---
paths: ["apps/web/src/server/**", "apps/web/src/actions/**"]
---

# Server 계층 아키텍처 컨벤션

## 개요

Pollia의 서버 코드는 **3계층 아키텍처**를 따릅니다:

```
Server Action (API 계층)               <- 인증, 에러 처리, 로깅
src/actions/
         |
         v
Service (비즈니스 로직 계층)            <- 비즈니스 규칙, 검증
src/server/services/
         |
         v
Repository (데이터 접근 계층)           <- Prisma 쿼리
src/server/repositories/
         |
         v
Prisma Client
```

### 계층별 책임

| 계층 | 위치 | 책임 | 에러 처리 |
|------|------|------|-----------|
| **Server Action** | `src/actions/` | 인증, 에러 처리, 로깅, DTO 변환 | try-catch + error.cause |
| **Service** | `src/server/services/` | 비즈니스 로직, 검증, Repository 조합 | error.cause throw |
| **Repository** | `src/server/repositories/` | Prisma 쿼리, 데이터 접근 | 없음 (null 반환) |

### 핵심 원칙

1. **단방향 의존성**: Action -> Service -> Repository (역방향 의존 금지)
2. **단일 책임**: 각 계층은 하나의 책임만 가짐
3. **테스트 가능성**: Service 계층을 중심으로 테스트 작성
4. **일관된 네이밍**: 계층별로 일관된 메서드명 사용
5. **주석 최소화**: JSDoc은 Public API에만 사용, 코드로 의도 표현
6. **타입 분리**: Service 내부 타입은 별도 `types.ts`로 관리
7. **스키마 공유**: Validation은 Zod 스키마를 Client/Service 공유 (End-to-End 검증)

---

## 디렉토리 구조

```
src/
├── actions/                    # Server Action 계층
│   ├── common/
│   │   └── auth.ts            # requireAuth 유틸
│   └── survey/
│       ├── index.ts           # re-export
│       ├── create.ts          # 생성 액션 (CRUD)
│       ├── read.ts            # 조회 액션 (CRUD)
│       ├── update.ts          # 수정 액션 (CRUD)
│       └── delete.ts          # 삭제 액션 (CRUD)
│
├── server/
│   ├── repositories/          # Repository 계층
│   │   └── survey/
│   │       └── surveyRepository.ts
│   │
│   └── services/              # Service 계층
│       ├── common/
│       │   └── parseSchema.ts # Zod 검증 공통 유틸
│       └── survey/
│           ├── surveyService.ts
│           ├── surveyService.test.ts  # 테스트
│           └── types.ts       # Service 내부 타입
│
├── schemas/                    # Zod 스키마 (Client + Service 공유)
│   └── survey/
│       ├── index.ts           # re-export
│       └── surveySchema.ts
│
└── types/dto/                 # DTO 타입 정의 (Client 사용)
    ├── index.ts
    └── survey/
        └── index.ts
```

### 네이밍 규칙

```
surveyRepository.ts      # {도메인}Repository.ts
surveyService.ts         # {도메인}Service.ts
surveyService.test.ts    # {도메인}Service.test.ts
create.ts                # CRUD 파일명 (kebab-case)
read.ts                  # CRUD 파일명 (kebab-case)
update.ts                # CRUD 파일명 (kebab-case)
delete.ts                # CRUD 파일명 (kebab-case)

# 잘못된 예시
survey-repository.ts     # kebab-case 금지 (Repository/Service)
SurveyRepository.ts      # PascalCase 금지 (파일명)
create-survey.ts         # 동작-도메인 형식 금지 (CRUD 사용)
```

---

## Repository 계층

### 역할

- Prisma 쿼리만 담당
- 비즈니스 로직 없음
- 에러 처리 없음 (null 반환)
- 순수 데이터 접근 계층

### Prisma 타입 활용

Repository는 Prisma가 생성한 타입을 **그대로 사용**합니다:

```typescript
import prisma from "@/database/utils/prisma/client";
import { Prisma } from "@prisma/client";

export class SurveyRepository {
  async findById(surveyId: string) {
    return prisma.survey.findUnique({
      where: { id: surveyId },
    });
  }

  // Prisma 타입 그대로 사용 (스키마 변경 시 자동 반영)
  async create(data: Prisma.SurveyUncheckedCreateInput) {
    return prisma.survey.create({ data });
  }

  async update(surveyId: string, data: Prisma.SurveyUncheckedUpdateInput) {
    return prisma.survey.update({
      where: { id: surveyId },
      data,
    });
  }

  async delete(surveyId: string) {
    return prisma.survey.delete({
      where: { id: surveyId },
    });
  }
}

export const surveyRepository = new SurveyRepository();
```

**Prisma 타입 선택 기준:**

| 타입 | 사용 시점 |
|------|----------|
| `Prisma.XxxUncheckedCreateInput` | relation을 scalar ID로 직접 전달할 때 (예: `creatorId`) |
| `Prisma.XxxCreateInput` | relation을 connect로 연결할 때 |
| `Prisma.XxxUncheckedUpdateInput` | 수정 시 scalar ID 직접 사용 |

**장점:**
- 스키마 변경 시 **코드 수정 불필요** (자동 반영)
- 불필요한 타입 래핑 제거
- Prisma가 타입 안전성 보장

### 필수 요소

- [ ] **Class 기반 구현**
- [ ] **Singleton export** (`export const {도메인}Repository = new ...`)
- [ ] **일관된 메서드명** (find*, create*, update*, delete*)
- [ ] **에러 처리 없음** (null 반환)
- [ ] **Prisma 쿼리만 포함**
- [ ] **Prisma 타입 그대로 사용** (`Prisma.XxxUncheckedCreateInput` 등)
- [ ] **주석 없음** (코드로 의도 표현)

### 메서드 네이밍 규칙

```typescript
// 조회
findById(id: string)                    # 단일 조회
findByUserId(userId: string)            # 조건 조회
findMany(options?: FindOptions)         # 목록 조회

// 생성
create(data: CreateData)                # 단일 생성
createMany(data: CreateData[])          # 복수 생성

// 수정
update(id: string, data: UpdateData)    # 수정
updateMany(ids: string[], data: ...)    # 복수 수정

// 삭제
delete(id: string)                      # 삭제
deleteMany(ids: string[])               # 복수 삭제

// 존재 확인
exists(id: string)                      # 존재 여부
count(options?: CountOptions)           # 개수

# 잘못된 예시
getSurvey()           # get 대신 find 사용
removeSurvey()        # remove 대신 delete 사용
```

---

## Service 계층

### 역할

- 비즈니스 로직 구현
- Repository 조합
- 검증 및 에러 처리
- 적절한 타입 사용 (DTO 또는 Service 내부 타입)

### Prisma 타입 활용 (types.ts)

Service 계층의 타입은 Prisma 타입을 **Pick으로 선택**하여 정의합니다:

```typescript
// types.ts
import type { Prisma, SurveyType } from "@prisma/client";
import type { SortOrderType } from "@/types/common/sort";

// Prisma 타입에서 필요한 필드만 Pick
type SurveyCreateFields = Pick<
  Prisma.SurveyUncheckedCreateInput,
  | "title"
  | "description"
  | "imageUrl"
  | "type"
>;

// 비즈니스 로직 전용 필드는 intersection으로 추가
export type CreateSurveyInput = SurveyCreateFields & {
  questionIds?: string[];
};

// Update는 Create 기반으로 Partial 적용
export type UpdateSurveyInput = Partial<SurveyCreateFields> & {
  isActive?: boolean;
};

export interface GetSurveysOptions {
  cursor?: string;
  limit?: number;
  sortOrder?: SortOrderType;
}
```

**장점:**
- API 경계에서 노출되는 필드를 **명시적으로 제어**
- 비즈니스 로직 전용 필드 추가 가능 (예: `questionIds`)
- 스키마 변경 시 **Pick 목록만 수정**
- 테스트 작성 시 필요 필드가 명확함

**Service vs Repository 타입 비교:**

| 계층 | 타입 정의 방식 | 이유 |
|------|---------------|------|
| **Repository** | `Prisma.XxxInput` 그대로 | 데이터 접근 계층은 ORM과 직접 통신 |
| **Service** | `Pick<Prisma.XxxInput, ...>` | API 경계 제어, 비즈니스 필드 추가 |

### 스키마 기반 Service의 types.ts 생략

Zod 스키마가 End-to-End 검증의 원천이고 `parseSchema()`로 Service에서 직접 검증하는 경우, **별도 `types.ts` 없이 스키마 타입을 직접 import**합니다:

```typescript
// types.ts 불필요 - 스키마 타입을 직접 사용
import {
  type RewardInput,
  type RewardUpdate,
  rewardInputSchema,
  rewardUpdateSchema,
} from "@/schemas/reward";

export class RewardService {
  async createReward(input: RewardInput, userId: string) {
    const validated = parseSchema(rewardInputSchema, input);
    return await this.repo.create(validated, userId);
  }
}
```

**types.ts가 필요한 경우 vs 불필요한 경우:**

| 조건 | types.ts | 이유 |
|------|----------|------|
| 스키마 없이 Prisma 타입만 사용 | **필요** | Pick으로 API 경계 제어 |
| 비즈니스 전용 필드 추가 필요 (예: `questionIds`) | **필요** | 스키마에 없는 필드 정의 |
| Zod 스키마가 타입의 원천이고 추가 필드 없음 | **불필요** | 스키마 타입 직접 import |

### Zod 검증 유틸 (parseSchema)

Zod 스키마 검증은 **공통 유틸** `parseSchema`를 사용합니다:

```typescript
// server/services/common/parseSchema.ts
import type { z } from "zod";

export function parseSchema<T extends z.ZodTypeAny>(schema: T, input: unknown): z.output<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
    error.cause = 400;
    throw error;
  }
  return result.data;
}
```

**사용 규칙:**
- Service에서 Zod 검증 시 반드시 `parseSchema` 사용
- safeParse + 수동 에러 생성 패턴 금지 (보일러플레이트 제거)
- 반환값은 Zod output 타입으로 자동 추론

```typescript
// 올바른 사용
const validated = parseSchema(surveyInputSchema, input);
return await this.repo.create(validated, userId);

// 잘못된 사용 (직접 safeParse 금지)
const result = surveyInputSchema.safeParse(input);
if (!result.success) {
  const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
  error.cause = 400;
  throw error;
}
```

### 기본 구조

```typescript
import { surveyInputSchema, type CreateSurveyInput } from "@/schemas/survey";
import { surveyRepository } from "@/server/repositories/survey/surveyRepository";
import { parseSchema } from "@/server/services/common/parseSchema";

export class SurveyService {
  constructor(private repo = surveyRepository) {}

  async getSurvey(surveyId: string) {
    const survey = await this.repo.findById(surveyId);

    if (!survey) {
      const error = new Error("설문조사를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return survey;
  }

  async createSurvey(input: CreateSurveyInput, userId: string) {
    const validated = parseSchema(surveyInputSchema, input);

    return await this.repo.create({
      ...validated,
      creatorId: userId,
    });
  }

  async deleteSurvey(surveyId: string, userId: string): Promise<void> {
    const survey = await this.getSurvey(surveyId);

    if (survey.creatorId !== userId) {
      const error = new Error("삭제 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    await this.repo.delete(surveyId);
  }
}

export const surveyService = new SurveyService();
```

### 필수 요소

- [ ] **Class 기반 구현**
- [ ] **Constructor Injection** (테스트용 Mock 주입)
- [ ] **Singleton export** (`export const {도메인}Service = new ...`)
- [ ] **일관된 메서드명** (get*, create*, update*, delete*, toggle*)
- [ ] **Input 타입은 Zod 스키마에서 파생** (`@/schemas/{도메인}` import)
- [ ] **Zod 검증은 parseSchema 유틸 사용** (직접 safeParse 금지)
- [ ] **에러 처리** (error.cause 설정)
- [ ] **주석 최소화** (코드로 의도 표현)

### 에러 처리 패턴

```typescript
// Zod 검증 실패 (400) - parseSchema 사용
const validated = parseSchema(surveyInputSchema, input);

// 리소스 없음 (404)
const survey = await this.repo.findById(surveyId);
if (!survey) {
  const error = new Error("설문조사를 찾을 수 없습니다.");
  error.cause = 404;
  throw error;
}

// 권한 없음 (403)
if (survey.creatorId !== userId) {
  const error = new Error("삭제 권한이 없습니다.");
  error.cause = 403;
  throw error;
}

// 중복 (409)
const existing = await this.repo.findByTitle(data.title);
if (existing) {
  const error = new Error("이미 존재하는 제목입니다.");
  error.cause = 409;
  throw error;
}

// try-catch 사용 금지 (Service 계층)
// Service는 에러를 throw만 하고, catch는 Action 계층에서
```

---

## Server Action 계층

### 역할

- 인증 처리 (`requireAuth`)
- Service 호출
- 에러 처리 및 로깅
- DTO 변환 (`{ data: ... }`)

### 기본 구조

Action은 **반환 타입 어노테이션을 생략**하고 TypeScript 자동 추론에 의존합니다.
Response DTO를 수동 정의하지 않습니다.

```typescript
"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyService } from "@/server/services/survey/surveyService";

export async function getSurvey(surveyId: string) {
  try {
    const survey = await surveyService.getSurvey(surveyId);
    return { data: survey };
  } catch (error) {
    console.error("설문조사 조회 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("설문조사를 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function createSurvey(request: CreateSurveyRequest) {
  try {
    const user = await requireAuth();
    const { missionId, ...input } = request;

    const survey = await surveyService.createSurvey(input, user.id);

    return { data: survey };
  } catch (error) {
    console.error("설문조사 생성 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("설문조사 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
```

### 필수 요소

- [ ] **`"use server"` directive**
- [ ] **인증 처리** (`requireAuth()` 호출, 필요 시)
- [ ] **Service 호출** (비즈니스 로직 없음)
- [ ] **try-catch 에러 처리**
- [ ] **console.error 로깅**
- [ ] **`{ data: ... }` 형식 반환** (반환 타입 어노테이션 생략, 자동 추론)
- [ ] **에러 재throw** (error.cause 유지)

---

## DTO (Data Transfer Object) 계층

### 역할

- Server Action과 Client 간 Request 타입 정의
- Response 타입은 Action 반환값에서 자동 추론 (별도 정의 불필요)

### Request DTO

**Request DTO는 Zod 스키마에서 파생합니다.**

```typescript
// types/dto/survey/index.ts
import type { SurveyInput, SurveyUpdate } from "@/schemas/survey";

export type CreateSurveyRequest = SurveyInput;
export type UpdateSurveyRequest = SurveyUpdate;

// 관계 파라미터가 필요한 경우 intersection
export type CreateSurveyRequest = SurveyInput & { missionId: string };
```

**원칙:**
- **Single Source of Truth**: 스키마가 유효성 검증과 타입의 원천
- **자동 동기화**: 스키마 수정 시 Request DTO도 자동 반영
- **수동 인터페이스 정의 금지**: Zod에서 파생되지 않는 Request 타입은 지양

### Response DTO

**Response DTO는 정의하지 않습니다.**

Action 함수의 반환 타입을 TypeScript가 자동 추론하고, tanstack-query 훅에서도 자동으로 타입이 전파됩니다.

```
Repository(Prisma select) -> Service -> Action(반환 타입 자동 추론) -> Hook(tanstack-query 자동 추론) -> UI
```

```typescript
// 올바른 사용: 반환 타입 어노테이션 없음
export async function getSurvey(surveyId: string) {
  const survey = await surveyService.getSurvey(surveyId);
  return { data: survey };
}

// 잘못된 사용: 수동 Response 인터페이스
export async function getSurvey(surveyId: string): Promise<GetSurveyResponse> { ... }
```

### DTO 체크리스트

- [ ] `/types/dto/{도메인}/index.ts` 파일 생성
- [ ] Request 타입은 `@/schemas/{도메인}`에서 import하여 type alias로 정의
- [ ] 관계 파라미터가 필요한 경우만 intersection (`& { missionId: string }`)
- [ ] Response 인터페이스는 정의하지 않음 (Action 반환 타입 자동 추론)
- [ ] `/types/dto/index.ts`에 도메인 re-export 추가

---

## 테스트 작성 가이드

### 테스트 범위

**테스트 작성 대상:**
- Service 계층만 테스트

**테스트 작성 제외:**
- Repository 계층 (Prisma 쿼리는 테스트하지 않음)
- Server Action 계층 (인증/에러 처리는 E2E 테스트에서)

### 기본 구조

```typescript
import { SurveyService } from "./surveyService";
import type { SurveyRepository } from "@/server/repositories/survey/surveyRepository";

describe("SurveyService", () => {
  let service: SurveyService;
  let mockRepo: jest.Mocked<SurveyRepository>;

  beforeEach(() => {
    // Repository Mock 생성
    mockRepo = {
      findById: jest.fn(),
      create: jest.fn(),
    } as jest.Mocked<SurveyRepository>;

    // Service 인스턴스 생성 (Mock 주입)
    service = new SurveyService(mockRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getSurvey", () => {
    it("Survey를 성공적으로 조회한다", async () => {
      // Given
      const mockSurvey = {
        id: "survey1",
        title: "Test Survey",
        // ... 전체 필드
      };
      mockRepo.findById.mockResolvedValue(mockSurvey);

      // When
      const result = await service.getSurvey("survey1");

      // Then
      expect(result).toEqual(mockSurvey);
      expect(mockRepo.findById).toHaveBeenCalledWith("survey1");
    });

    it("Survey가 없으면 404 에러를 던진다", async () => {
      // Given
      mockRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getSurvey("invalid-id")).rejects.toThrow(
        "설문조사를 찾을 수 없습니다.",
      );

      // error.cause 확인
      try {
        await service.getSurvey("invalid-id");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(404);
      }
    });
  });
});
```

### 필수 요소

- [ ] **describe/it 구조**
- [ ] **beforeEach/afterEach**
- [ ] **jest.Mocked<T> 타입 사용**
- [ ] **Given-When-Then 주석** (선택)
- [ ] **성공 케이스 테스트**
- [ ] **에러 케이스 테스트**
- [ ] **error.cause 검증**
- [ ] **Mock 호출 검증** (`toHaveBeenCalledWith`)

---

## 요약

### 계층별 핵심 규칙

| 계층 | 파일명 | 구현 방식 | 타입 정의 | 에러 처리 | 테스트 |
|------|--------|-----------|-----------|-----------|--------|
| **Repository** | `{도메인}Repository.ts` | Class + Singleton | Prisma 타입 그대로 | 없음 (null) | 제외 |
| **Service** | `{도메인}Service.ts` | Class + Singleton + DI | Zod 스키마 파생 + parseSchema 검증 | error.cause throw | 대상 |
| **Action** | `{동작}.ts` | Function | Request: DTO, Response: 자동 추론 | try-catch + log | 제외 |
| **DTO Request** | `types/dto/{도메인}/index.ts` | Type Alias | Zod 스키마 파생 | - | - |

### 메서드 네이밍

| 계층 | 조회 | 생성 | 수정 | 삭제 |
|------|------|------|------|------|
| **Repository** | `find*` | `create*` | `update*` | `delete*` |
| **Service** | `get*` | `create*` | `update*` | `delete*` |
| **Action** | `get*` | `create*` | `update*` | `delete*` |
