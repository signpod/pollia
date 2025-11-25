import {
  multipleChoiceDescriptionAtom,
  multipleChoiceImageFileUploadIdAtom,
  multipleChoiceImageUrlAtom,
  multipleChoiceTitleAtom,
} from "@/atoms/survey/question/creation/multipleChoice";
// TODO: @/schemas_legacy는 deprecated. 새로운 @/schemas/{domain}/ 스키마로 교체 필요
import { multipleChoiceInfoSchema } from "@/schemas_legacy/survey/question/creation/multipleChoiceInfoSchema";
import { DescriptionInputSection } from "../inputs/DescriptionInputSection";
import { ImageSelectorSection } from "../inputs/ImageSelectorSection";
import { OptionSelectorSection } from "../inputs/OptionSelectorSection";
import { SubjectInputSection } from "../inputs/SubjectInputSection";
import { MultipleChoiceSubmitButton } from "./SubmitButtons";

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
        <DescriptionInputSection descriptionAtom={multipleChoiceDescriptionAtom} />
        <OptionSelectorSection />
      </div>

      <MultipleChoiceSubmitButton />
    </div>
  );
}
