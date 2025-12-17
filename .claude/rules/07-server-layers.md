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

### 기본 구조

```typescript
import { surveyRepository } from "@/server/repositories/survey/surveyRepository";
import type { CreateSurveyInput } from "./types";

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
    if (!input.title || input.title.trim().length === 0) {
      const error = new Error("제목은 필수입니다.");
      error.cause = 400;
      throw error;
    }

    const survey = await this.repo.create({
      ...input,
      creatorId: userId,
    });

    return survey;
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
- [ ] **자체 타입 사용** (`types.ts`에서 import, DTO 사용 금지)
- [ ] **타입은 Prisma 기반 Pick** (스키마 변경 시 부분 반영)
- [ ] **에러 처리** (error.cause 설정)
- [ ] **Validation 로직**
- [ ] **주석 최소화** (코드로 의도 표현)

### 에러 처리 패턴

```typescript
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

// 잘못된 요청 (400)
if (!data.title || data.title.trim().length === 0) {
  const error = new Error("제목은 필수입니다.");
  error.cause = 400;
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

```typescript
"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyService } from "@/server/services/survey/surveyService";
import type { GetSurveyResponse } from "@/types/dto";

export async function getSurvey(surveyId: string): Promise<GetSurveyResponse> {
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

export async function createSurvey(
  request: CreateSurveyRequest,
): Promise<CreateSurveyResponse> {
  try {
    const user = await requireAuth();

    const survey = await surveyService.createSurvey({
      title: request.title,
      description: request.description,
      creatorId: user.id,
    });

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
- [ ] **DTO 변환** (`{ data: ... }` 형식)
- [ ] **에러 재throw** (error.cause 유지)

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
| **Service** | `{도메인}Service.ts` | Class + Singleton + DI | Pick<Prisma...> | error.cause throw | 대상 |
| **Action** | `{동작}.ts` | Function | DTO 타입 | try-catch + log | 제외 |

### 메서드 네이밍

| 계층 | 조회 | 생성 | 수정 | 삭제 |
|------|------|------|------|------|
| **Repository** | `find*` | `create*` | `update*` | `delete*` |
| **Service** | `get*` | `create*` | `update*` | `delete*` |
| **Action** | `get*` | `create*` | `update*` | `delete*` |
