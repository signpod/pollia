import {
  eitherOrDescriptionAtom,
  eitherOrImageFileUploadIdAtom,
  eitherOrImageUrlAtom,
  eitherOrTitleAtom,
} from "@/atoms/survey/create/eitherOrInfoAtoms";
import { eitherOrInfoSchema } from "@/schemas/survey/eitherOrInfoSchema";
import { DescriptionInputSection } from "../inputs/DescriptionInputSection";
import { ImageSelectorSection } from "../inputs/ImageSelectorSection";
import { SubjectInputSection } from "../inputs/SubjectInputSection";
import { EitherOrSubmitButton } from "./SubmitButtons";

export function EitherOrInfoStep() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 px-5">
        <ImageSelectorSection
          imageUrlAtom={eitherOrImageUrlAtom}
          imageFileUploadIdAtom={eitherOrImageFileUploadIdAtom}
        />
        <SubjectInputSection titleAtom={eitherOrTitleAtom} schema={eitherOrInfoSchema} />
        <DescriptionInputSection descriptionAtom={eitherOrDescriptionAtom} />
      </div>

      <EitherOrSubmitButton />
    </div>
  );
}
