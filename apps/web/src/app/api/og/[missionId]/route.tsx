import { missionService } from "@/server/services/mission";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import sharp from "sharp";

async function fetchAndOptimizeImage(
  url: string,
  width?: number,
  height?: number,
): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });

    if (!res.ok) return null;

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // sharp로 PNG 변환 및 리사이즈
    let sharpInstance = sharp(buffer);

    if (width && height) {
      sharpInstance = sharpInstance.resize(width, height, {
        fit: "cover",
        position: "top",
      });
    }

    const pngBuffer = await sharpInstance.png().toBuffer();
    const base64 = pngBuffer.toString("base64");

    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error("Image optimization error:", error);
    return null;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ missionId: string }> },
) {
  const { missionId } = await params;

  try {
    const mission = await missionService.getMission(missionId);
    const { title, imageUrl, brandLogoUrl } = mission;

    const displayTitle = title ? (title.length > 50 ? `${title.substring(0, 47)}...` : title) : "";

    const [missionImage, brandLogo, polliaLogo] = await Promise.all([
      imageUrl ? fetchAndOptimizeImage(imageUrl, 630, 630) : null,
      brandLogoUrl ? fetchAndOptimizeImage(brandLogoUrl, 112, 112) : null,
      fetchAndOptimizeImage("https://pollia.me/images/pollia-logo.png", undefined, 64),
    ]);

    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#fafafa",
        }}
      >
        {/* Left: Mission Image */}
        <div
          style={{
            width: 630,
            height: 630,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            backgroundColor: "#e4e4e7",
            overflow: "hidden",
          }}
        >
          {missionImage && (
            <img
              src={missionImage}
              width={630}
              height={630}
              alt="Mission thumbnail"
              style={{ objectFit: "cover", objectPosition: "top" }}
            />
          )}
        </div>

        {/* Right: Content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: 48,
          }}
        >
          {brandLogo && (
            <img
              src={brandLogo}
              alt="Brand logo"
              width={56}
              height={56}
              style={{
                borderRadius: 28,
                marginBottom: 24,
              }}
            />
          )}

          <div
            style={{
              color: "#09090b",
              fontSize: 36,
              fontWeight: 700,
              lineHeight: 1.3,
              marginBottom: 24,
            }}
          >
            {displayTitle}
          </div>

          {polliaLogo && (
            <div style={{ marginTop: "auto", display: "flex" }}>
              <img src={polliaLogo} height={32} alt="Pollia logo" />
            </div>
          )}
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
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
