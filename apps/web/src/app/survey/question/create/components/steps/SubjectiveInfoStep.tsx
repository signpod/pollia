import { Button, Typo, FixedBottomLayout } from "@repo/ui/components";

export function SubjectiveInfoStep() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 px-5">
        SubjectiveInfoStepContent
        {/* <SubjectInput
          titleAtom={title}
          schema={binaryPollSchema}
        /> 
        <DescriptionInput descriptionAtom={description} /> */}
      </div>

      <SubjectiveInfoCTAButton />
    </div>
  );
}

function SubjectiveInfoCTAButton() {
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
