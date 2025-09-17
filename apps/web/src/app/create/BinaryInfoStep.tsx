import {
  binaryPollCategoryAtom,
  binaryPollEndTimeAtom,
  binaryPollEndDateAtom,
  binaryPollStartTimeAtom,
  binaryPollStartDateAtom,
  binaryPollThumbnailUrlAtom,
  binaryPollDescriptionAtom,
  binaryPollTitleAtom,
  binaryPollIsUnlimitedAtom,
} from "@/atoms/create/binaryPollAtoms";
import {
  useStep,
  Button,
  ImageSelector,
  Input,
  Typo,
  BottomCTALayout,
} from "@repo/ui/components";
import { useAtom } from "jotai";
import { ChevronRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

export default function BinaryInfoStep() {
  return (
    <div className="flex flex-col gap-6 px-5">
      <CategoryButton />
      <ThumbnailSelector />
      <SubjectInput />
      <DescriptionInput />

      <BinaryInfoCTAButton />
    </div>
  );
}

function CategoryButton() {
  const { goNext } = useStep();

  return (
    <Button
      variant="secondary"
      onClick={goNext}
      fullWidth
      textAlign="left"
      rightIcon={<ChevronRight className="w-6 h-6" />}
    >
      <div className="flex items-center gap-1">
        <span className="font-bold text-zinc-950">카테고리</span>
        <span className="text-red-500">*</span>
      </div>
    </Button>
  );
}

function ThumbnailSelector() {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");

  // 컴포넌트 언마운트 시 메모리 정리
  useEffect(() => {
    return () => {
      if (thumbnailUrl) {
        URL.revokeObjectURL(thumbnailUrl);
      }
    };
  }, [thumbnailUrl]);

  const handleImageSelect = (file: File) => {
    // 기존 URL이 있다면 먼저 메모리 해제
    if (thumbnailUrl) {
      URL.revokeObjectURL(thumbnailUrl);
    }

    // 선택된 파일을 미리보기 URL로 변환
    const url = URL.createObjectURL(file);
    setThumbnailUrl(url);

    // TODO: 실제 파일 업로드 로직 구현 presigned url 사용
    console.log("선택된 파일:", file);
  };

  const handleImageDelete = () => {
    // 기존 URL이 있다면 메모리 해제
    if (thumbnailUrl) {
      URL.revokeObjectURL(thumbnailUrl);
    }
    setThumbnailUrl("");
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
        imageUrl={thumbnailUrl}
        onImageSelect={handleImageSelect}
        onImageDelete={handleImageDelete}
      />
    </div>
  );
}

function SubjectInput() {
  const [subject, setSubject] = useState("");

  return (
    <div className="flex flex-col gap-2">
      <Input
        label="주제"
        required
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="주제를 작성해주세요"
        maxLength={30}
      />
    </div>
  );
}

function DescriptionInput() {
  const [description, setDescription] = useState("");

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
  const { isValid, handleSubmit } = useSubmitBinaryInfo();

  return (
    <BottomCTALayout.CTA>
      <div className="p-5 pb-10">
        <Button
          variant="primary"
          fullWidth={true}
          onClick={handleSubmit}
          disabled={!isValid}
        >
          <Typo.ButtonText>다음</Typo.ButtonText>
        </Button>
      </div>
    </BottomCTALayout.CTA>
  );
}

function useSubmitBinaryInfo() {
  const [category] = useAtom(binaryPollCategoryAtom);
  const [title] = useAtom(binaryPollTitleAtom);
  const [description] = useAtom(binaryPollDescriptionAtom);
  const [thumbnailUrl] = useAtom(binaryPollThumbnailUrlAtom);
  const [isUnlimited] = useAtom(binaryPollIsUnlimitedAtom);
  const [startDate] = useAtom(binaryPollStartDateAtom);
  const [startTime] = useAtom(binaryPollStartTimeAtom);
  const [endDate] = useAtom(binaryPollEndDateAtom);
  const [endTime] = useAtom(binaryPollEndTimeAtom);

  /**
   * 각 옵션값들에 대한 validate 진행.
   */

  const isValid = useMemo(() => {
    // TODO: validate 진행
    return true;
  }, []);

  const handleSubmit = () => {
    console.log("category", category);
    console.log("title", title);
    console.log("description", description);
    console.log("thumbnailUrl", thumbnailUrl);
    console.log("isUnlimited", isUnlimited);
    console.log("startDate", startDate);
    console.log("startTime", startTime);
    console.log("endDate", endDate);
    console.log("endTime", endTime);
  };

  return {
    isValid,
    handleSubmit,
  };
}
