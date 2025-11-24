import {
  subjectiveDescriptionAtom,
  subjectiveImageFileUploadIdAtom,
  subjectiveImageUrlAtom,
  subjectiveTitleAtom,
} from "@/atoms/survey/question/creation/subjectiveAtoms";
// TODO: @/schemas_legacy는 deprecated. 새로운 @/schemas/{domain}/ 스키마로 교체 필요
import { subjectiveInfoSchema } from "@/schemas_legacy/survey/question/creation/subjectiveInfoSchema";
import { DescriptionInputSection } from "../inputs/DescriptionInputSection";
import { ImageSelectorSection } from "../inputs/ImageSelectorSection";
import { SubjectInputSection } from "../inputs/SubjectInputSection";
import { SubjectiveSubmitButton } from "./SubmitButtons";

export function SubjectiveInfoStep() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 px-5">
        <ImageSelectorSection
          imageUrlAtom={subjectiveImageUrlAtom}
          imageFileUploadIdAtom={subjectiveImageFileUploadIdAtom}
        />
        <SubjectInputSection titleAtom={subjectiveTitleAtom} schema={subjectiveInfoSchema} />
        <DescriptionInputSection descriptionAtom={subjectiveDescriptionAtom} />
      </div>

      <SubjectiveSubmitButton />
    </div>
  );
}
