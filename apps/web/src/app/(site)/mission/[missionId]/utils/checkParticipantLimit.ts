interface CheckParticipantLimitParams {
  maxParticipants: number | null | undefined;
  currentParticipants: number | undefined;
  hasExistingResponse: boolean;
}

export function checkParticipantLimitReached({
  maxParticipants,
  currentParticipants,
  hasExistingResponse,
}: CheckParticipantLimitParams): boolean {
  return (
    !!maxParticipants &&
    !!currentParticipants &&
    currentParticipants >= maxParticipants &&
    !hasExistingResponse
  );
}
