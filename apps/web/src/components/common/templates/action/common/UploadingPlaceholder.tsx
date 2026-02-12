"use client";

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

function CircularProgress({ progress, size = 24, strokeWidth = 3 }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="white"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-200 ease-out"
      />
    </svg>
  );
}

interface UploadingPlaceholderProps {
  progress: number;
}

export function UploadingPlaceholder({ progress }: UploadingPlaceholderProps) {
  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-zinc-300">
      <div className="absolute inset-0 flex items-center justify-center">
        <CircularProgress progress={progress} />
      </div>
    </div>
  );
}
