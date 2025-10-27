import { Button, Typo, FixedBottomLayout } from "@repo/ui/components";

import { ImageSelectorSection } from "../inputs/ImageSelectorSection";
import { SubjectInputSection } from "../inputs/SubjectInputSection";
import { DescriptionInputSection } from "../inputs/DescriptionInputSection";

import {
  scaleDataAtom,
  scaleDescriptionAtom,
  scaleImageFileUploadIdAtom,
  scaleImageUrlAtom,
  scaleTitleAtom,
} from "@/atoms/survey/create/scaleInfoAtoms";
import { scaleInfoSchema } from "@/schemas/survey/scaleInfoSchema";
import { useAtomValue } from "jotai";

export function ScaleInfoStep() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 px-5">
        <ImageSelectorSection
          imageUrlAtom={scaleImageUrlAtom}
          imageFileUploadIdAtom={scaleImageFileUploadIdAtom}
        />
        <SubjectInputSection
          titleAtom={scaleTitleAtom}
          schema={scaleInfoSchema}
        />
        <DescriptionInputSection descriptionAtom={scaleDescriptionAtom} />
      </div>

      <ScaleInfoCTAButton />
    </div>
  );
}

function ScaleInfoCTAButton() {
  //TODO: 질문 생성 로직 추가
  const scaleData = useAtomValue(scaleDataAtom);

  const handleCreatePoll = () => {
    // TODO: 질문 생성 로직 추가
    console.log(scaleData);
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
