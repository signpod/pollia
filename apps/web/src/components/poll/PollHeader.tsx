import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface PollHeaderProps {
  title: string;
  description: string;
  imageUrl?: string;
  isSponsored?: boolean;
}

export function PollHeader({
  title,
  description,
  imageUrl,
  isSponsored,
}: PollHeaderProps) {
  return (
    <div className="space-y-4">
      {imageUrl && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {isSponsored && (
            <div className="absolute top-3 right-3">
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-800 border-blue-200"
              >
                스폰서
              </Badge>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight flex-1">
            {title}
          </h1>
          {isSponsored && !imageUrl && (
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 border-blue-200 flex-shrink-0"
            >
              스폰서
            </Badge>
          )}
        </div>

        {description && (
          <p className="text-gray-600 text-lg leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}
