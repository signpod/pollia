import {
  multipleChoiceDescriptionAtom,
  multipleChoiceImageFileUploadIdAtom,
  multipleChoiceImageUrlAtom,
  multipleChoiceTitleAtom,
<<<<<<< Updated upstream
} from "@/atoms/survey/create/multipleChoiceInfoAtoms";
=======
  multipleChoiceTitleTouchedAtom,
} from "@/atoms/survey/quetion/multipleChoiceInfoAtoms";
>>>>>>> Stashed changes
import { multipleChoiceInfoSchema } from "@/schemas/survey/multipleChoiceInfoSchema";
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
