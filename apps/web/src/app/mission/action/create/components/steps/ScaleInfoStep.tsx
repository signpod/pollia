import {
  scaleDescriptionAtom,
  scaleImageFileUploadIdAtom,
  scaleImageUrlAtom,
  scaleTitleAtom,
} from "@/atoms/action/creation/scaleAtoms";
// TODO: @/schemas_legacy는 deprecated. 새로운 @/schemas/{domain}/ 스키마로 교체 필요
import { scaleInfoSchema } from "@/schemas_legacy/survey/question/creation/scaleInfoSchema";
import { DescriptionInputSection } from "../inputs/DescriptionInputSection";
import { ImageSelectorSection } from "../inputs/ImageSelectorSection";
import { SubjectInputSection } from "../inputs/SubjectInputSection";
import { ScaleSubmitButton } from "./SubmitButtons";

export function ScaleInfoStep() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 px-5">
        <ImageSelectorSection
          imageUrlAtom={scaleImageUrlAtom}
          imageFileUploadIdAtom={scaleImageFileUploadIdAtom}
        />
        <SubjectInputSection titleAtom={scaleTitleAtom} schema={scaleInfoSchema} />
        <DescriptionInputSection descriptionAtom={scaleDescriptionAtom} />
      </div>

      <ScaleSubmitButton />
    </div>
  );
}
