import { missionService } from "@/server/services/mission";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const IMAGE_SIZE = 630;

const COLORS = {
  white: "#ffffff",
  zinc50: "#fafafa",
  zinc100: "#f4f4f5",
  zinc200: "#e4e4e7",
  zinc950: "#09090b",
  violet500: "#8d5df9",
  violet100: "#ede9fe",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ missionId: string }> },
) {
  const { missionId } = await params;

  try {
    const mission = await missionService.getMission(missionId);
    const { title, imageUrl, brandLogoUrl } = mission;

    if (!imageUrl) {
      return new Response("Image not found", { status: 404 });
    }

    return new ImageResponse(
      (
        <div
          style={{
            width: OG_WIDTH,
            height: OG_HEIGHT,
            display: "flex",
            backgroundColor: COLORS.zinc50,
          }}
        >
          {/* 왼쪽: 1:1 비율로 위에서부터 자른 이미지 */}
          <div
            style={{
              width: IMAGE_SIZE,
              height: IMAGE_SIZE,
              overflow: "hidden",
              display: "flex",
            }}
          >
            <img
              src={imageUrl}
              alt=""
              width={IMAGE_SIZE}
              height={IMAGE_SIZE}
              style={{
                objectFit: "cover",
                objectPosition: "top",
              }}
            />
          </div>

          {/* 오른쪽: 미션 정보 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "48px",
              gap: "24px",
            }}
          >
            {/* 브랜드 로고 */}
            {brandLogoUrl && (
              <img
                src={brandLogoUrl}
                alt=""
                width={56}
                height={56}
                style={{
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: `2px solid ${COLORS.zinc200}`,
                }}
              />
            )}

            {/* 미션 제목 */}
            {title && (
              <div
                style={{
                  color: COLORS.zinc950,
                  fontSize: 36,
                  fontWeight: 700,
                  lineHeight: 1.3,
                  wordBreak: "keep-all",
                }}
              >
                {title.length > 50 ? `${title.substring(0, 47)}...` : title}
              </div>
            )}

            {/* Pollia 브랜딩 */}
            <img
              src={`${process.env.NEXT_PUBLIC_APP_URL || "https://pollia.me"}/images/pollia-logo.png`}
              alt="pollia"
              height={32}
              style={{
                marginTop: "auto",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
      ),
      {
        width: OG_WIDTH,
        height: OG_HEIGHT,
        headers: {
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
      },
    );
  } catch (error) {
    console.error("OG image generation error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
