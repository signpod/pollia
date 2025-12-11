export const getScaleClassName = (hasImage: boolean) => (hasImage ? "" : "pt-6");

export const scaleValueToStarRating = (scaleValue: number): number => {
  return scaleValue / 2;
};

export const starRatingToScaleValue = (starRating: number): number => {
  return starRating * 2;
};
