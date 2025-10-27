import {
  eitherOrDataAtom,
  eitherOrDescriptionAtom,
  eitherOrImageFileUploadIdAtom,
  eitherOrImageUrlAtom,
  eitherOrTitleAtom,
} from "@/atoms/survey/create/eitherOrInfoAtoms";
import { eitherOrInfoSchema } from "@/schemas/survey/eitherOrInfoSchema";
import { Button, Typo, FixedBottomLayout } from "@repo/ui/components";
import { SubjectInputSection } from "../inputs/SubjectInputSection";
import { DescriptionInputSection } from "../inputs/DescriptionInputSection";
import { ImageSelectorSection } from "../inputs/ImageSelectorSection";
import { useAtomValue } from "jotai";

export function EitherOrInfoStep() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 px-5">
        <ImageSelectorSection
          imageUrlAtom={eitherOrImageUrlAtom}
          imageFileUploadIdAtom={eitherOrImageFileUploadIdAtom}
        />
        <SubjectInputSection
          titleAtom={eitherOrTitleAtom}
          schema={eitherOrInfoSchema}
        />
        <DescriptionInputSection descriptionAtom={eitherOrDescriptionAtom} />
      </div>

      <EitherOrInfoCTAButton />
    </div>
  );
}

function EitherOrInfoCTAButton() {
  //TODO: 질문 생성 로직 추가
  const eitherOrData = useAtomValue(eitherOrDataAtom);

  const handleCreatePoll = () => {
    // TODO: 질문 생성 로직 추가
    console.log(eitherOrData);
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
