import {
  binaryPollCategoryAtom,
  binaryPollEndTimeAtom,
  binaryPollEndDateAtom,
  binaryPollStartTimeAtom,
  binaryPollStartDateAtom,
  binaryPollThumbnailUrlAtom,
  binaryPollThumbnailFileUploadIdAtom,
  binaryPollDescriptionAtom,
  binaryPollTitleAtom,
  binaryPollIsUnlimitedAtom,
} from "@/atoms/create/binaryPollAtoms";
import { CATEGORY_LABELS } from "@/constants/poll";
import {
  useStep,
  Button,
  ImageSelector,
  Input,
  Typo,
  BottomCTALayout,
  Toggle,
  DateAndTimePicker,
} from "@repo/ui/components";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useImageUpload } from "@/hooks/common/useImageUpload";
import { useCreateBinaryPoll } from "@/hooks/poll/useCreateBinaryPoll";

export default function BinaryInfoStep() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 px-5">
        <CategoryButton />
        <ThumbnailSelector />
        <SubjectInput />
        <DescriptionInput />
      </div>

      {/* DIVIDER */}
      <div className="bg-zinc-50 w-full h-2" />

      <div className="flex flex-col gap-6 px-5">
        <VotingPeriodSection />
      </div>

      <BinaryInfoCTAButton />
    </div>
  );
}

function CategoryButton() {
  const { goNext } = useStep();
  const selectedCategory = useAtomValue(binaryPollCategoryAtom);

  return (
    <Button
      variant="secondary"
      onClick={goNext}
      fullWidth
      textAlign="left"
      rightIcon={<ChevronRight className="w-6 h-6" />}
    >
      <div className="flex items-center gap-1">
        <Typo.ButtonText size="large">
          {selectedCategory ? CATEGORY_LABELS[selectedCategory] : "카테고리"}
        </Typo.ButtonText>
        {!selectedCategory && <span className="text-red-500">*</span>}
      </div>
    </Button>
  );
}

function ThumbnailSelector() {
  const [thumbnailUrl, setThumbnailUrl] = useAtom(binaryPollThumbnailUrlAtom);
  const setUploadedFileId = useSetAtom(binaryPollThumbnailFileUploadIdAtom);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [uploadedFile, setUploadedFile] = useState<{
    path: string;
    fileUploadId: string;
  } | null>(null);

  const { upload, isUploading, uploadError, deleteImage, isDeleting } =
    useImageUpload({
      bucket: "poll-images",
      onSuccess: (result) => {
        console.log("✅ 썸네일 업로드 성공:", result);
        setThumbnailUrl(result.publicUrl);
        setUploadedFileId(result.fileUploadId);

        setUploadedFile({
          path: result.path,
          fileUploadId: result.fileUploadId,
        });

        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl("");
        }
      },
      onError: (error) => {
        console.error("❌ 썸네일 업로드 실패:", error);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl("");
        }
      },
      onProgress: (progress) => {
        console.log(`업로드 진행률: ${progress.percentage}%`);
      },
    });

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageSelect = (file: File) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    upload(file);
  };

  const handleImageDelete = () => {
    if (uploadedFile) {
      deleteImage({
        path: uploadedFile.path,
        bucket: "poll-images",
      });
    }

    setUploadedFile(null);
    setUploadedFileId(undefined);
    setThumbnailUrl(undefined);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Typo.SubTitle size="large">썸네일</Typo.SubTitle>
        </div>
        <span className="text-xs font-medium text-zinc-400">
          {thumbnailUrl ? "1" : "0"}/1
        </span>
      </div>

      <ImageSelector
        size="large"
        imageUrl={thumbnailUrl || previewUrl}
        onImageSelect={handleImageSelect}
        onImageDelete={handleImageDelete}
      />
      {(isUploading || isDeleting) && (
        <div className="text-sm text-blue-500">
          {isUploading ? "업로드 중..." : "삭제 중..."}
        </div>
      )}
      {uploadError && (
        <div className="text-sm text-red-500">
          업로드 실패: {uploadError.message}
        </div>
      )}
    </div>
  );
}

function SubjectInput() {
  const [title, setTitle] = useAtom(binaryPollTitleAtom);

  return (
    <div className="flex flex-col gap-1">
      <Input
        label="주제"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="주제를 작성해주세요"
        maxLength={30}
      />
    </div>
  );
}

function DescriptionInput() {
  const [description, setDescription] = useAtom(binaryPollDescriptionAtom);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Typo.SubTitle size="large">설명</Typo.SubTitle>
        </div>
        <Typo.Body size="small" className="text-zinc-400">
          {description.length}/100
        </Typo.Body>
      </div>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="설명을 작성해주세요"
        maxLength={100}
        rows={2}
        className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-sm resize-none focus:outline-none focus:ring-1 focus:ring-zinc-950 placeholder:text-zinc-300"
      />
    </div>
  );
}

function BinaryInfoCTAButton() {
  const uploadedFileId = useAtomValue(binaryPollThumbnailFileUploadIdAtom);

  const { handleSubmit, isLoading, isValid } = useCreateBinaryPoll({
    onSuccess: () => {
      console.log("✅ Binary Poll 생성 성공!");
      // TODO: 폴 생성 후 리디렉션 로직 추가
    },
    onError: (error) => {
      console.error("❌ Binary Poll 생성 실패:", error);
      alert(error.message);
    },
  });

  const handleCreatePoll = () => {
    handleSubmit(uploadedFileId);
  };

  return (
    <BottomCTALayout.CTA>
      <div className="p-5 pb-10">
        <Button
          variant="primary"
          fullWidth={true}
          onClick={handleCreatePoll}
          disabled={!isValid || isLoading}
          loading={isLoading}
        >
          <Typo.ButtonText>
            {isLoading ? "생성 중..." : "폴 만들기"}
          </Typo.ButtonText>
        </Button>
      </div>
    </BottomCTALayout.CTA>
  );
}

function VotingPeriodSection() {
  const [isUnlimited, setIsUnlimited] = useAtom(binaryPollIsUnlimitedAtom);
  const [startDateString, setStartDateString] = useAtom(
    binaryPollStartDateAtom
  );
  const [startTime, setStartTime] = useAtom(binaryPollStartTimeAtom);
  const [endDateString, setEndDateString] = useAtom(binaryPollEndDateAtom);
  const [endTime, setEndTime] = useAtom(binaryPollEndTimeAtom);

  // string → Date 변환
  const startDate = startDateString ? new Date(startDateString) : undefined;
  const endDate = endDateString ? new Date(endDateString) : undefined;

  // Date → string 변환 함수
  const handleStartDateChange = (date: Date | undefined) => {
    setStartDateString(date ? date.toISOString().split("T")[0]! : "");
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDateString(date ? date.toISOString().split("T")[0]! : "");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Typo.SubTitle size="large">무기한</Typo.SubTitle>
          <Typo.Body size="medium" className="text-zinc-400">
            (종료 버튼 누르기 전까지 투표 가능)
          </Typo.Body>
        </div>
        <Toggle checked={isUnlimited} onCheckedChange={setIsUnlimited} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Typo.SubTitle size="large">시작</Typo.SubTitle>
          <DateAndTimePicker
            date={startDate}
            time={startTime}
            onDateChange={handleStartDateChange}
            onTimeChange={setStartTime}
          />
        </div>

        <div className="flex justify-between items-center">
          <Typo.SubTitle size="large">종료</Typo.SubTitle>
          <DateAndTimePicker
            date={endDate}
            time={endTime}
            onDateChange={handleEndDateChange}
            onTimeChange={setEndTime}
            disabled={isUnlimited}
          />
        </div>
      </div>
    </div>
  );
}
