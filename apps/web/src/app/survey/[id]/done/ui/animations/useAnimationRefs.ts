import { useMemo, useRef } from "react";

export interface AnimationRefs {
  box: React.RefObject<HTMLDivElement | null>;
  checkIcon: React.RefObject<HTMLDivElement | null>;
  surveyContent: React.RefObject<HTMLDivElement | null>;
  logo: React.RefObject<HTMLDivElement | null>;
  title: React.RefObject<HTMLDivElement | null>;
  infoBox: React.RefObject<HTMLDivElement | null>;
  image: React.RefObject<HTMLDivElement | null>;
  text: React.RefObject<HTMLDivElement | null>;
  afterTitle: React.RefObject<HTMLDivElement | null>;
  button: React.RefObject<HTMLButtonElement | null>;
  shareButtons: React.RefObject<HTMLDivElement | null>;
}

export function useAnimationRefs(): AnimationRefs {
  const box = useRef<HTMLDivElement>(null);
  const checkIcon = useRef<HTMLDivElement>(null);
  const surveyContent = useRef<HTMLDivElement>(null);
  const logo = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const infoBox = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLDivElement>(null);
  const afterTitle = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const shareButtons = useRef<HTMLDivElement>(null);

  return useMemo(
    () => ({
      box,
      checkIcon,
      surveyContent,
      logo,
      title,
      infoBox,
      image,
      text,
      afterTitle,
      button,
      shareButtons,
    }),
    [],
  );
}
