import { ImageSelector, Typo } from "@repo/ui/components";

interface ImageUploaderFieldProps {
  title: string;
  description: string;
  imageUrl?: string;
  onImageSelect: (file: File) => void;
  onImageDelete: () => void;
  disabled?: boolean;
  size?: "medium" | "large";
}

export function ImageUploaderField({
  title,
  description,
  imageUrl,
  onImageSelect,
  onImageDelete,
  disabled,
  size = "large",
}: ImageUploaderFieldProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Typo.SubTitle>{title}</Typo.SubTitle>
          <Typo.Body size="medium" className="text-zinc-500">
            {description}
          </Typo.Body>
        </div>
        <ImageSelector
          size={size}
          imageUrl={imageUrl}
          onImageSelect={onImageSelect}
          onImageDelete={onImageDelete}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
