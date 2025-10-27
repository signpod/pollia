import { Button, Typo, FixedBottomLayout } from "@repo/ui/components";

export function EitherOrInfoStep() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 px-5">
        EitherOrInfoStepContent
        {/* <SubjectInput
          titleAtom={title}
          schema={binaryPollSchema}
        /> 
        <DescriptionInput descriptionAtom={description} /> */}
      </div>

      <EitherOrInfoCTAButton />
    </div>
  );
}

function EitherOrInfoCTAButton() {
  //TODO: 질문 생성 로직 추가
  const handleCreatePoll = () => {
    // TODO: 질문 생성 로직 추가
  };

  return (
    <FixedBottomLayout.Content>
      <div className="p-5">
        <Button variant="primary" fullWidth={true} onClick={handleCreatePoll}>
          <Typo.ButtonText>질문 생성하기</Typo.ButtonText>
        </Button>
      </div>
    </FixedBottomLayout.Content>
  );
}
