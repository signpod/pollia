import { useRef } from "react";

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
  return {
    box: useRef<HTMLDivElement>(null),
    checkIcon: useRef<HTMLDivElement>(null),
    surveyContent: useRef<HTMLDivElement>(null),
    logo: useRef<HTMLDivElement>(null),
    title: useRef<HTMLDivElement>(null),
    infoBox: useRef<HTMLDivElement>(null),
    image: useRef<HTMLDivElement>(null),
    text: useRef<HTMLDivElement>(null),
    afterTitle: useRef<HTMLDivElement>(null),
    button: useRef<HTMLButtonElement>(null),
    shareButtons: useRef<HTMLDivElement>(null),
  };
}
