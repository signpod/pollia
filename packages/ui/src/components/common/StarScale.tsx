"use client";
import StarFilled from "@public/svgs/star-filled.svg";
import StarHalf from "@public/svgs/star-half.svg";
import StarSmile from "@public/svgs/star-smile.svg";

import { Slider } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { useState } from "react";

export function StarScale() {
  const [value, setValue] = useState(1);
  const maxStars = 5;

  return (
    <div className="relative w-full px-14">
      <Slider.Root
        value={[value]}
        onValueChange={values => {
          const newValue = values[0];
          if (newValue !== undefined) {
            setValue(newValue);
          }
        }}
        min={0.5}
        max={maxStars}
        step={0.5}
        className="relative flex h-18 w-full touch-none select-none items-center"
      >
        <Slider.Track>
          <div className="pointer-events-none absolute left-0 right-0 top-1/2 flex w-full -translate-y-1/2 items-center justify-between px-0">
            {Array.from({ length: maxStars }).map((_, index) => {
              const starIndex = index + 1;
              const starValue = index + 1;
              const StarIcon = value === maxStars ? StarSmile : StarFilled;
              const isFilled = value >= starValue;
              const isHalf = value >= starValue - 0.5 && value < starValue;

              if (isHalf) {
                return <StarHalf key={starIndex} className="size-15 transition-colors" />;
              }

              return (
                <StarIcon
                  key={starIndex}
                  className={cn(
                    "size-15 transition-colors",
                    isFilled ? "text-yellow-500" : "text-zinc-100",
                  )}
                />
              );
            })}
          </div>
        </Slider.Track>
      </Slider.Root>
    </div>
  );
}
