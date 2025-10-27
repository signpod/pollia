import { Button, Typo, FixedBottomLayout } from "@repo/ui/components";

import { SubjectInputSection } from "../inputs/SubjectInputSection";
import { DescriptionInputSection } from "../inputs/DescriptionInputSection";
import { OptionSelectorSection } from "../inputs/OptionSelectorSection";
import { ImageSelectorSection } from "../inputs/ImageSelectorSection";

import {
  multipleChoiceDataAtom,
  multipleChoiceDescriptionAtom,
  multipleChoiceImageFileUploadIdAtom,
  multipleChoiceImageUrlAtom,
  multipleChoiceTitleAtom,
} from "@/atoms/survey/create/multipleChoiceInfoAtoms";
import { multipleChoiceInfoSchema } from "@/schemas/survey/multipleChoiceInfoSchema";
import { useAtomValue } from "jotai";

export function MultipleChoiceInfoStep() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 px-5">
        <ImageSelectorSection
          imageUrlAtom={multipleChoiceImageUrlAtom}
          imageFileUploadIdAtom={multipleChoiceImageFileUploadIdAtom}
        />
        <SubjectInputSection
          titleAtom={multipleChoiceTitleAtom}
          schema={multipleChoiceInfoSchema}
        />
        <DescriptionInputSection
          descriptionAtom={multipleChoiceDescriptionAtom}
        />
        <OptionSelectorSection />
      </div>

      <MultipleChoiceInfoCTAButton />
    </div>
  );
}

function MultipleChoiceInfoCTAButton() {
  //TODO: 질문 생성 로직 추가
  const multipleChoiceData = useAtomValue(multipleChoiceDataAtom);
  const handleClick = () => {
    // TODO: 질문 생성 로직 추가
    console.log(multipleChoiceData);
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
