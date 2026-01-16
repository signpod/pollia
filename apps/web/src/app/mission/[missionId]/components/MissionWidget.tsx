"use client";

import { Typo } from "@repo/ui/components";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface BaseWidgetProps {
  icon: React.ReactNode;
  title: string;
}

interface TextWidgetProps extends BaseWidgetProps {
  descType: "text";
  description: string;
}

interface ClockWidgetProps extends BaseWidgetProps {
  descType: "clock";
  deadline: Date;
}

export type MissionWidgetProps = TextWidgetProps | ClockWidgetProps;

function AnimatedDigit({ digit }: { digit: string }) {
  return (
    <div className="relative h-[1.5em] w-[1em] overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={digit}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Typo.MainTitle size="medium" className="text-white">
            {digit}
          </Typo.MainTitle>
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function Colon() {
  return (
    <Typo.MainTitle size="medium" className="text-white/40">
      :
    </Typo.MainTitle>
  );
}

function CountdownClock({ deadline }: { deadline: Date }) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: "00", minutes: "00", seconds: "00" });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(deadline));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(deadline));
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  const { hours, minutes, seconds } = timeLeft;
  const h1 = hours[0] ?? "0";
  const h2 = hours[1] ?? "0";
  const m1 = minutes[0] ?? "0";
  const m2 = minutes[1] ?? "0";
  const s1 = seconds[0] ?? "0";
  const s2 = seconds[1] ?? "0";

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0">
        <AnimatedDigit digit={h1} />
        <AnimatedDigit digit={h2} />
      </div>
      <Colon />
      <div className="flex items-center gap-0">
        <AnimatedDigit digit={m1} />
        <AnimatedDigit digit={m2} />
      </div>
      <Colon />
      <div className="flex items-center gap-0">
        <AnimatedDigit digit={s1} />
        <AnimatedDigit digit={s2} />
      </div>
    </div>
  );
}

function calculateTimeLeft(deadline: Date) {
  const now = new Date();
  const diff = Math.max(0, deadline.getTime() - now.getTime());

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

export function MissionWidget(props: MissionWidgetProps) {
  const { icon, descType, title } = props;
  const content =
    descType === "text" ? (
      <Typo.SubTitle size="large" className="text-white">
        {props.description}
      </Typo.SubTitle>
    ) : (
      <CountdownClock deadline={props.deadline} />
    );

  return (
    <div className="flex justify-between items-center bg-black/40 rounded-md p-3 h-[50px]">
      <div className="flex items-center gap-2">
        {icon}
        <Typo.Body size="medium" className="text-zinc-200">
          {title}
        </Typo.Body>
      </div>
      <div>{content}</div>
    </div>
  );
}
