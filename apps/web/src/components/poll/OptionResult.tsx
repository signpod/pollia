import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { PollResult } from "@/types/poll";

interface OptionResultProps {
  result: PollResult;
  allowMultiple: boolean;
  onVote: (optionId: string) => void;
  isVoting: boolean;
}

export function OptionResult({
  result,
  allowMultiple,
  onVote,
  isVoting,
}: OptionResultProps) {
  const { option, percentage, rank, isUserVote } = result;

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `${rank}위`;
    }
  };

  const formatVoteCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toLocaleString();
  };

  return (
    <Card
      className={`overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isUserVote ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
      } ${isVoting ? "opacity-60 pointer-events-none" : ""}`}
      onClick={() => onVote(option.id)}
    >
      <div className="flex">
        <div className="relative w-32 h-24 flex-shrink-0">
          {option.imageUrl ? (
            <Image
              src={option.imageUrl}
              alt={option.title}
              fill
              className="object-cover"
              sizes="128px"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-2xl">{getRankEmoji(rank)}</span>
            </div>
          )}

          {isUserVote && (
            <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
              <Check className="w-3 h-3" />
            </div>
          )}
        </div>

        <div className="flex-1 relative min-h-24">
          <div
            className="absolute inset-0 bg-gradient-to-r from-blue-100 to-transparent opacity-60"
            style={{ width: `${percentage}%` }}
          />

          <div className="relative p-4 h-full flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {option.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-700">
                    {percentage.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatVoteCount(option.voteCount)}표
                  </span>
                </div>
              </div>

              {option.description && (
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                  {option.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                {getRankEmoji(rank)}
              </span>

              {allowMultiple && (
                <Badge variant="outline" className="text-xs">
                  복수 선택
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
