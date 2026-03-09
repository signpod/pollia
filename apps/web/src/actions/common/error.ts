export interface ActionError {
  message: string;
  cause: number;
}

export interface ActionErrorResponse {
  data: null;
  error: ActionError;
}

/**
 * Server Action의 catch 블록에서 사용하는 공통 에러 핸들러.
 *
 * - 4xx (cause < 500): 에러 객체를 반환하여 클라이언트에 메시지 전달
 * - 5xx / unknown: throw하여 에러 바운더리에서 처리
 *
 * 반환 타입은 `never`로 선언하여 서버 액션의 기존 반환 타입을 유지한다.
 * 4xx 에러 객체는 런타임에만 반환되며, 클라이언트 래퍼(toMutationFn)가 감지 후 throw한다.
 */
export function handleActionError(error: unknown, fallbackMessage: string): never {
  console.error(fallbackMessage, error);

  if (error instanceof Error && typeof error.cause === "number") {
    if (error.cause < 500) {
      return { data: null, error: { message: error.message, cause: error.cause } } as never;
    }
    throw error;
  }

  const serverError = new Error(fallbackMessage);
  serverError.cause = 500;
  throw serverError;
}

function hasActionError(value: unknown): value is ActionErrorResponse {
  if (value === null || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  if (!("data" in obj) || obj.data !== null) return false;
  if (!("error" in obj) || obj.error == null || typeof obj.error !== "object") return false;
  const err = obj.error as Record<string, unknown>;
  return typeof err.message === "string" && typeof err.cause === "number";
}

/**
 * Server Action 결과에 에러 응답이 포함되어 있으면 throw한다.
 * mutationFn 내부에서 액션 호출 후 인라인으로 사용할 수 있다.
 *
 * @example
 * ```ts
 * const result = await getUploadUrl(request);
 * assertActionSuccess(result);
 * // 이후 result는 성공 타입으로 좁혀짐
 * ```
 */
export function assertActionSuccess<T>(
  result: T,
): asserts result is Exclude<T, ActionErrorResponse> {
  if (hasActionError(result)) {
    throw new Error(result.error.message);
  }
}

/**
 * Server Action을 TanStack Query mutationFn으로 래핑한다.
 * 반환값에 에러 응답이 있으면 throw -> onError 트리거.
 * 정상 응답은 원본 타입 그대로 반환 -> onSuccess 시그니처 유지.
 *
 * useMutation 제네릭 추론을 위해 반드시 제네릭 인자를 명시한다:
 * @example
 * ```ts
 * useMutation<CreateMissionResponse, Error, CreateMissionRequest>({
 *   mutationFn: toMutationFn(createMission),
 * })
 * ```
 */
export function toMutationFn<TVariables, TData>(
  action: (input: TVariables) => Promise<TData>,
): (input: TVariables) => Promise<TData> {
  return async (input: TVariables) => {
    const result = await action(input);
    assertActionSuccess(result);
    return result;
  };
}
