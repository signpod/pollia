declare module "*.png" {
  const content: { src: string; height: number; width: number; blurDataURL?: string };
  export default content;
}

declare module "@public/images/*.png" {
  const content: { src: string; height: number; width: number; blurDataURL?: string };
  export default content;
}
