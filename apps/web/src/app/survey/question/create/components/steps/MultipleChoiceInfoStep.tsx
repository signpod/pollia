"use client";

import { Button, Typo, FixedBottomLayout } from "@repo/ui/components";
import { OptionSelector } from "@/app/poll/create/OptionSelector";

export function MultipleChoiceInfoStep() {
  //TODO: titleAtom 추가

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 px-5">
        MultipleChoiceInfoStepContent
        {/* <SubjectInput titleAtom={title} schema={multiplePollSchema} />
        <DescriptionInput descriptionAtom={description} /> */}
        {/* <OptionSelector /> */}
      </div>

      <MultipleChoiceInfoCTAButton />
    </div>
  );
}

function MultipleChoiceInfoCTAButton() {
  //TODO: 질문 생성 로직 추가
  const handleClick = () => {
    // TODO: 질문 생성 로직 추가
  };

  return (
    <FixedBottomLayout.Content>
      <div className="p-5">
        <Button variant="primary" fullWidth={true} onClick={handleClick}>
          <Typo.ButtonText>질문 생성하기</Typo.ButtonText>
        </Button>
      </div>
    </FixedBottomLayout.Content>
  );
}
