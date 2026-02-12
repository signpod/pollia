import type { ActionStepContentProps } from "@/constants/action";
import { ActionType } from "@/types/domain/action";
import type { ComponentType } from "react";

import { Branch } from "./branch";
import { ActionDate } from "./date";
import { ActionImage } from "./image";
import { MultipleChoice } from "./multiple-choice";
import { ActionPdf } from "./pdf";
import { MissionStarScale } from "./rating";
import { MissionRatingScale } from "./scale";
import { ShortText } from "./short-text";
import { Subjective } from "./subjective";
import { ActionTag } from "./tag";
import { ActionTime } from "./time";
import { ActionVideo } from "./video";

export {
  MultipleChoice,
  MissionRatingScale,
  MissionStarScale,
  Subjective,
  ShortText,
  ActionImage,
  ActionVideo,
  ActionTag,
  ActionPdf,
  ActionDate,
  ActionTime,
  Branch,
};

export function getActionComponent(type: ActionType): ComponentType<ActionStepContentProps> {
  switch (type) {
    case ActionType.MULTIPLE_CHOICE:
      return MultipleChoice;
    case ActionType.SCALE:
      return MissionRatingScale;
    case ActionType.RATING:
      return MissionStarScale;
    case ActionType.SUBJECTIVE:
      return Subjective;
    case ActionType.SHORT_TEXT:
      return ShortText;
    case ActionType.IMAGE:
      return ActionImage;
    case ActionType.VIDEO:
      return ActionVideo;
    case ActionType.TAG:
      return ActionTag;
    case ActionType.PDF:
      return ActionPdf;
    case ActionType.DATE:
      return ActionDate;
    case ActionType.TIME:
      return ActionTime;
    case ActionType.BRANCH:
      return Branch;
    default:
      throw new Error(`Unsupported action type: ${type}`);
  }
}
