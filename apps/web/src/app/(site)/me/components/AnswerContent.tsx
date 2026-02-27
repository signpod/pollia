import { scaleValueToStarRating } from "@/components/common/templates/action/common/utils";
import type { MyMissionResponseAnswer } from "@/types/dto/mission-response";
import { ActionType } from "@prisma/client";
import {
  CalendarIcon,
  CheckSquareIcon,
  FileTextIcon,
  GitBranchIcon,
  ImageIcon,
  MessageSquareIcon,
  StarIcon,
  TagIcon,
  VideoIcon,
} from "lucide-react";

export const ACTION_TYPE_CONFIG: Record<ActionType, { icon: React.ReactNode; label: string }> = {
  MULTIPLE_CHOICE: { icon: <CheckSquareIcon className="h-4 w-4" />, label: "객관식" },
  TAG: { icon: <TagIcon className="h-4 w-4" />, label: "태그" },
  SCALE: { icon: <StarIcon className="h-4 w-4" />, label: "척도" },
  RATING: { icon: <StarIcon className="h-4 w-4" />, label: "평점" },
  SUBJECTIVE: { icon: <MessageSquareIcon className="h-4 w-4" />, label: "서술형" },
  SHORT_TEXT: { icon: <MessageSquareIcon className="h-4 w-4" />, label: "단답형" },
  IMAGE: { icon: <ImageIcon className="h-4 w-4" />, label: "이미지" },
  VIDEO: { icon: <VideoIcon className="h-4 w-4" />, label: "동영상" },
  PDF: { icon: <FileTextIcon className="h-4 w-4" />, label: "PDF" },
  DATE: { icon: <CalendarIcon className="h-4 w-4" />, label: "날짜" },
  TIME: { icon: <CalendarIcon className="h-4 w-4" />, label: "시간" },
  BRANCH: { icon: <GitBranchIcon className="h-4 w-4" />, label: "분기" },
};

export function formatDate(date: Date): string {
  const d = new Date(date);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
}

export function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AnswerContent({ answer }: { answer: MyMissionResponseAnswer }) {
  const actionType = answer.action.type as ActionType;

  switch (actionType) {
    case "MULTIPLE_CHOICE":
    case "TAG":
    case "BRANCH":
      if (answer.options.length === 0 && !answer.textAnswer) {
        return <span className="text-sm font-semibold text-zinc-400">선택 없음</span>;
      }
      return (
        <div className="flex flex-wrap gap-2">
          {answer.options.map(option => (
            <span
              key={option.id}
              className="rounded-lg bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-600"
            >
              {option.title}
            </span>
          ))}
          {answer.textAnswer && (
            <span className="rounded-lg bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-600">
              기타: {answer.textAnswer}
            </span>
          )}
        </div>
      );

    case "SCALE":
      if (answer.options.length === 0 && !answer.textAnswer) {
        return <span className="text-sm font-semibold text-zinc-400">선택 없음</span>;
      }
      return (
        <div className="flex flex-col gap-1">
          {answer.scaleAnswer !== null && (
            <span className="text-sm font-semibold text-zinc-400">
              {answer.options.length > 0
                ? `${answer.options.length > 0 ? (answer.options[0]?.order !== undefined ? `${(answer.scaleAnswer ?? 0) + 1}번째` : "") : ""}`
                : ""}
            </span>
          )}
          {answer.options.map(option => (
            <span
              key={option.id}
              className="rounded-lg bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-600"
            >
              {option.title}
            </span>
          ))}
        </div>
      );

    case "RATING":
      if (answer.scaleAnswer === null) {
        return <span className="text-sm font-semibold text-zinc-400">응답 없음</span>;
      }
      return <ReadOnlyStars value={scaleValueToStarRating(answer.scaleAnswer)} />;

    case "SUBJECTIVE":
    case "SHORT_TEXT":
      if (!answer.textAnswer) {
        return <span className="text-sm font-semibold text-zinc-400">응답 없음</span>;
      }
      return (
        <p className="whitespace-pre-wrap text-sm font-semibold text-zinc-600">
          {answer.textAnswer}
        </p>
      );

    case "IMAGE":
    case "VIDEO":
      if (answer.fileUploads.length === 0) {
        return <span className="text-sm font-semibold text-zinc-400">파일 없음</span>;
      }
      return (
        <div className="flex gap-2">
          {answer.fileUploads.map(file => (
            <div
              key={file.id}
              className="relative aspect-square flex-1 overflow-hidden rounded-lg border border-zinc-200"
            >
              {file.publicUrl ? (
                <img
                  src={file.publicUrl}
                  alt={file.originalFileName}
                  className="absolute inset-0 size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-zinc-50">
                  {actionType === "VIDEO" ? (
                    <VideoIcon className="size-5 text-zinc-400" />
                  ) : (
                    <ImageIcon className="size-5 text-zinc-400" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      );

    case "PDF":
      if (answer.fileUploads.length === 0) {
        return <span className="text-sm font-semibold text-zinc-400">파일 없음</span>;
      }
      return (
        <div className="flex flex-col gap-2">
          {answer.fileUploads.map(file => (
            <a
              key={file.id}
              href={file.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-zinc-200 p-4"
            >
              <div className="flex shrink-0 items-center rounded-full bg-zinc-50 p-3">
                <FileTextIcon className="size-7 text-red-500" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-sm font-semibold text-black">
                  {file.originalFileName}
                </span>
                <span className="text-sm font-semibold text-zinc-400">PDF</span>
              </div>
            </a>
          ))}
        </div>
      );

    case "DATE":
      if (answer.dateAnswers.length === 0) {
        return <span className="text-sm font-semibold text-zinc-400">응답 없음</span>;
      }
      return (
        <div className="flex flex-wrap gap-2">
          {answer.dateAnswers.map((date, idx) => (
            <span
              key={idx}
              className="rounded-lg bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-600"
            >
              {formatDate(date)}
            </span>
          ))}
        </div>
      );

    case "TIME":
      if (answer.dateAnswers.length === 0) {
        return <span className="text-sm font-semibold text-zinc-400">응답 없음</span>;
      }
      return (
        <div className="flex flex-wrap gap-2">
          {answer.dateAnswers.map((date, idx) => (
            <span
              key={idx}
              className="rounded-lg bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-600"
            >
              {formatTime(date)}
            </span>
          ))}
        </div>
      );

    default:
      return <span className="text-zinc-400">-</span>;
  }
}

const MAX_STARS = 5;

function StarFilledSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M27.933 4.158c.849-1.708 3.285-1.708 4.133 0l6.214 12.503a5.5 5.5 0 0 0 4.342 3.142l13.877 2.003c1.898.274 2.653 2.608 1.276 3.942l-10.007 9.686a5.5 5.5 0 0 0-1.672 5.127l2.364 13.687c.325 1.883-1.648 3.323-3.342 2.439L32.67 50.188a5.5 5.5 0 0 0-5.34 0L14.882 56.687c-1.694.884-3.667-.556-3.342-2.44l2.364-13.686a5.5 5.5 0 0 0-1.673-5.127L2.224 25.748c-1.377-1.334-.622-3.668 1.276-3.942l13.877-2.003a5.5 5.5 0 0 0 4.343-3.142l6.213-12.503Z"
        fill="currentColor"
      />
    </svg>
  );
}

function StarSmileSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M27.933 4.158c.849-1.708 3.285-1.708 4.133 0l6.214 12.503a5.5 5.5 0 0 0 4.342 3.142l13.877 2.003c1.898.274 2.653 2.608 1.276 3.942l-10.007 9.686a5.5 5.5 0 0 0-1.672 5.127l2.364 13.687c.325 1.883-1.648 3.323-3.342 2.439L32.67 50.188a5.5 5.5 0 0 0-5.34 0L14.882 56.687c-1.694.884-3.667-.556-3.342-2.44l2.364-13.686a5.5 5.5 0 0 0-1.673-5.127L2.224 25.748c-1.377-1.334-.622-3.668 1.276-3.942l13.877-2.003a5.5 5.5 0 0 0 4.343-3.142l6.213-12.503Z"
        fill="#FFE672"
      />
      <path
        d="M35.77 31.448a1.248 1.248 0 0 1 1.248 1.247 6.248 6.248 0 0 1-12.033 0 1.248 1.248 0 0 1 2.494 0 3.753 3.753 0 0 0 7.044 0c0-.689.558-1.247 1.247-1.247Z"
        fill="#FFAA00"
      />
      <circle cx="26.686" cy="28.293" r="1.755" fill="#FFAA00" />
      <circle cx="33.307" cy="28.293" r="1.755" fill="#FFAA00" />
    </svg>
  );
}

function StarHalfSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M27.933 4.158c.849-1.708 3.285-1.708 4.133 0l6.214 12.503a5.5 5.5 0 0 0 4.342 3.142l13.877 2.003c1.898.274 2.653 2.608 1.276 3.942l-10.007 9.686a5.5 5.5 0 0 0-1.672 5.127l2.364 13.687c.325 1.883-1.648 3.323-3.342 2.439L32.67 50.188a5.5 5.5 0 0 0-5.34 0L14.882 56.687c-1.694.884-3.667-.556-3.342-2.44l2.364-13.686a5.5 5.5 0 0 0-1.673-5.127L2.224 25.748c-1.377-1.334-.622-3.668 1.276-3.942l13.877-2.003a5.5 5.5 0 0 0 4.343-3.142l6.213-12.503Z"
        fill="#F4F4F5"
      />
      <path
        d="M30 49.533a5.5 5.5 0 0 0-2.67.654L14.882 56.687c-1.694.884-3.667-.556-3.342-2.44l2.364-13.686a5.5 5.5 0 0 0-1.673-5.127L2.224 25.748c-1.377-1.334-.622-3.668 1.276-3.942l13.877-2.003a5.5 5.5 0 0 0 4.343-3.142L27.933 4.158C28.358 3.304 29.179 2.878 30 2.878v46.655Z"
        fill="#FFE672"
      />
    </svg>
  );
}

function ReadOnlyStars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: MAX_STARS }).map((_, index) => {
        const starValue = index + 1;
        const isFull = value >= starValue;
        const isHalf = value >= starValue - 0.5 && value < starValue;
        const Icon = isFull && value === MAX_STARS ? StarSmileSvg : StarFilledSvg;

        if (isHalf) {
          return <StarHalfSvg key={index} className="size-14" />;
        }
        return (
          <Icon key={index} className={`size-14 ${isFull ? "text-yellow-500" : "text-zinc-100"}`} />
        );
      })}
    </div>
  );
}
