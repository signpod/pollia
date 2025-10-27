import { Button, Typo, FixedBottomLayout } from "@repo/ui/components";
import { ImageSelectorSection } from "../inputs/ImageSelectorSection";
import { SubjectInputSection } from "../inputs/SubjectInputSection";
import { DescriptionInputSection } from "../inputs/DescriptionInputSection";
import {
  subjectiveDataAtom,
  subjectiveDescriptionAtom,
  subjectiveImageFileUploadIdAtom,
  subjectiveImageUrlAtom,
  subjectiveTitleAtom,
} from "@/atoms/survey/create/subjectiveInfoAtoms";
import { subjectiveInfoSchema } from "@/schemas/survey/subjectiveInfoSchema";
import { useAtomValue } from "jotai";

export function SubjectiveInfoStep() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 px-5">
        <ImageSelectorSection
          imageUrlAtom={subjectiveImageUrlAtom}
          imageFileUploadIdAtom={subjectiveImageFileUploadIdAtom}
        />
        <SubjectInputSection
          titleAtom={subjectiveTitleAtom}
          schema={subjectiveInfoSchema}
        />
        <DescriptionInputSection descriptionAtom={subjectiveDescriptionAtom} />
      </div>

      <SubjectiveInfoCTAButton />
    </div>
  );
}

function SubjectiveInfoCTAButton() {
  //TODO: 질문 생성 로직 추가
  const subjectiveData = useAtomValue(subjectiveDataAtom);

  const handleCreatePoll = () => {
    // TODO: 질문 생성 로직 추가
    console.log(subjectiveData);
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
