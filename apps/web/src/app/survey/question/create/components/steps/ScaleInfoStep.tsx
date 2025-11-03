import {
  scaleDescriptionAtom,
  scaleImageFileUploadIdAtom,
  scaleImageUrlAtom,
  scaleTitleAtom,
<<<<<<< Updated upstream
} from "@/atoms/survey/create/scaleInfoAtoms";
=======
  scaleTitleTouchedAtom,
} from "@/atoms/survey/quetion/scaleInfoAtoms";
>>>>>>> Stashed changes
import { scaleInfoSchema } from "@/schemas/survey/scaleInfoSchema";
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
