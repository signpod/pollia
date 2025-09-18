import PollCandidate from "@/components/poll/PollCandidate";
import { useMultipleCandidate } from "@/hooks/poll/useMultipleCandidate";
import { Button, Typo } from "@repo/ui/components";
import { PlusIcon } from "lucide-react";

export default function CandidateSelector() {
  const { candidates, updateCandidate, addCandidate } = useMultipleCandidate();

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Typo.SubTitle size="large">투표 항목</Typo.SubTitle>
          <span className="text-red-500">*</span>
        </div>
        <Typo.Body size="small" className="text-zinc-400">
          {candidates.length}/10
        </Typo.Body>
      </div>

      {candidates.map((candidate) => {
        const handleNameChange = (name: string) => {
          updateCandidate(candidate.id, { name });
        };

        return (
          <PollCandidate
            key={candidate.id}
            onNameChange={handleNameChange}
            {...candidate}
          />
        );
      })}

      {/* TODO: 버튼 수정이루어지면 수정*/}
      <Button
        variant="secondary"
        leftIcon={<PlusIcon />}
        onClick={addCandidate}
      >
        <Typo.ButtonText size="large">항목 추가하기</Typo.ButtonText>
      </Button>
    </>
  );
}
