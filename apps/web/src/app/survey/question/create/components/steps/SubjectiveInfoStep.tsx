import {
  subjectiveDescriptionAtom,
  subjectiveImageFileUploadIdAtom,
  subjectiveImageUrlAtom,
  subjectiveTitleAtom,
<<<<<<< Updated upstream
} from "@/atoms/survey/create/subjectiveInfoAtoms";
=======
  subjectiveTitleTouchedAtom,
} from "@/atoms/survey/quetion/subjectiveInfoAtoms";
>>>>>>> Stashed changes
import { subjectiveInfoSchema } from "@/schemas/survey/subjectiveInfoSchema";
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
