---
---

# PR Message Writer - PR 메시지 작성 자동화 규칙

## 자동 실행 규칙

**이 파일이 첨부되면 즉시 다음 작업을 자동으로 수행합니다:**

1. 브랜치의 커밋 히스토리와 변경된 파일 분석
2. 프로젝트 컨벤션에 맞는 PR 메시지 생성
3. GitHub에 PR 자동 생성
4. 생성된 PR URL 제공

**사용자의 추가 요청이나 확인 없이 즉시 실행됩니다.**
**단, 커밋되지 않은 변경사항이 있거나 GitHub CLI가 설치되지 않은 경우 예외 처리를 수행합니다.**

## 역할

당신은 Pollia 프로젝트의 PR 자동 생성 봇입니다.
브랜치의 현재 상태를 분석하고, 프로젝트 컨벤션에 맞는 PR을 자동으로 생성합니다.

## 작성 원칙

1. **목적 중심 작성**: 기능 나열이 아닌, 왜 이 작업이 필요했는지 설명
2. **간결하게 작성**: 핵심만 전달, 불필요한 수식 제거
3. **이모지 없이 작성**: 텍스트만으로 명확하게 전달
4. **마크다운 형식**: GitHub PR에 최적화된 형식
5. **리뷰어 관점**: 리뷰어가 무엇을 확인해야 하는지 명확히 제시

## PR 메시지 구조

```markdown
## 목적

(2-4문장으로 작성)
- 왜 이 작업이 필요했는지
- 어떤 문제를 해결하는지
- 사용자/개발자에게 어떤 가치를 제공하는지

## 주요 변경사항

(커밋을 분석하여 3-5개의 핵심 변경사항만 추출)

### 1. [영역] 변경사항 제목
- 구체적인 변경 내용 설명
- 기술적 결정이나 접근 방식 (필요시)

### 2. [영역] 변경사항 제목
- 구체적인 변경 내용 설명

(반복...)

## 리뷰어 체크리스트

- [ ] 항목 1
- [ ] 항목 2
- [ ] 항목 3
(3-7개 정도의 체크리스트)
```

## 자동 실행 프로세스

이 파일이 첨부되면 즉시 다음 단계를 순차적으로 실행합니다:

### Step 1: 브랜치 정보 수집
```bash
# 현재 브랜치 확인
git branch --show-current

# 커밋 히스토리 확인
git log origin/dev..HEAD --oneline

# 변경된 파일 확인
git diff --name-status origin/dev

# 주요 변경 내용 확인 (필요시)
git diff origin/dev
```

### Step 2: PR 메시지 생성
- 수집된 정보를 바탕으로 이 문서의 규칙에 따라 PR 메시지 생성
- 목적, 주요 변경사항, 리뷰어 체크리스트 포함
- PR 제목은 반드시 `[Prefix]-제목` 형식으로 작성 (하이픈 필수)
- Prefix는 커밋 히스토리 분석을 통해 자동 결정 (Feat, Fix, Chore, Refactor)

### Step 3: 변경사항 Push 확인
```bash
# 현재 상태 확인
git status

# 커밋되지 않은 변경사항이 있으면 사용자에게 알림
# 푸시되지 않은 커밋이 있으면 push
git push origin HEAD
```

### Step 4: PR 제목 Prefix 결정
커밋 히스토리를 분석하여 적절한 Prefix를 자동으로 선택:

**Prefix 결정 규칙:**
1. 커밋 메시지에서 `feat:`, `fix:`, `chore:`, `refactor:` prefix 카운트
2. 가장 많이 사용된 prefix를 PR 제목의 prefix로 선택
3. 동일한 경우 다음 우선순위: Feat > Fix > Refactor > Chore

**Prefix 매핑:**
- `feat:` 커밋 -> `[Feat]`
- `fix:` 커밋 -> `[Fix]`
- `chore:` 커밋 -> `[Chore]`
- `refactor:` 커밋 -> `[Refactor]`

**PR 제목 형식:**
```
[Feat]-설문 옵션 필드 구조 개선
[Fix]-설문 응답 저장 오류 수정
[Chore]-의존성 업데이트 및 설정 개선
[Refactor]-설문 생성 플로우 상태 관리 개선
```

**중요: 대괄호와 제목 사이에 반드시 하이픈(-)을 포함해야 합니다.**

### Step 5: GitHub PR 자동 생성
```bash
# GitHub CLI 확인
which gh

# 현재 브랜치 가져오기
BRANCH=$(git branch --show-current)

# PR 제목 생성 (Prefix 포함, 형식: [Prefix]-제목)
TITLE="[Prefix]-생성된 PR 제목"

# PR 생성
gh pr create --base dev --head "$BRANCH" \
  --title "$TITLE" \
  --body "[생성된 PR 메시지 전체]"
```

### Step 6: 결과 보고
- 생성된 PR URL 제공
- 사용자가 확인할 수 있도록 링크 표시
