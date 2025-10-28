import { SubjectInputSection } from "../inputs/SubjectInputSection";
import { DescriptionInputSection } from "../inputs/DescriptionInputSection";
import { OptionSelectorSection } from "../inputs/OptionSelectorSection";
import { ImageSelectorSection } from "../inputs/ImageSelectorSection";

import {
  multipleChoiceDescriptionAtom,
  multipleChoiceImageFileUploadIdAtom,
  multipleChoiceImageUrlAtom,
  multipleChoiceTitleAtom,
} from "@/atoms/survey/create/multipleChoiceInfoAtoms";
import { multipleChoiceInfoSchema } from "@/schemas/survey/multipleChoiceInfoSchema";
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
        <DescriptionInputSection
          descriptionAtom={multipleChoiceDescriptionAtom}
        />
        <OptionSelectorSection />
      </div>

      <MultipleChoiceSubmitButton />
    </div>
  );
}
