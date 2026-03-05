import { missionService } from "@/server/services/mission";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

const SUIT_FONT_URL = "https://cdn.jsdelivr.net/gh/sunn-us/SUIT@2/fonts/static/woff/SUIT-Bold.woff";

async function loadSuitFont(): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(SUIT_FONT_URL);
    if (!response.ok) {
      console.error(`Failed to fetch SUIT font: ${response.status}`);
      return null;
    }
    return await response.arrayBuffer();
  } catch (error) {
    console.error("SUIT font fetch error:", error);
    return null;
  }
}

/**
 * wsrv.nl 이미지 프록시를 사용해 이미지를 PNG로 변환하고 리사이즈
 * https://wsrv.nl/docs/
 */
function getProxiedImageUrl(
  url: string,
  width: number,
  height: number,
  fit: "cover" | "contain" = "cover",
): string {
  const encodedUrl = encodeURIComponent(url);
  return `https://wsrv.nl/?url=${encodedUrl}&w=${width}&h=${height}&fit=${fit}&output=png`;
}

async function fetchImageAsBase64(
  url: string,
  width?: number,
  height?: number,
  fit: "cover" | "contain" = "cover",
): Promise<string | null> {
  try {
    // wsrv.nl 프록시를 통해 PNG로 변환 및 리사이즈
    const fetchUrl = width && height ? getProxiedImageUrl(url, width, height, fit) : url;

    const res = await fetch(fetchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });

    if (!res.ok) {
      console.error(`Failed to fetch image: ${fetchUrl}, status: ${res.status}`);
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength === 0) return null;

    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    // wsrv.nl이 PNG로 변환하므로 항상 image/png
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error("Image fetch error:", error);
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
    const { title, imageUrl } = mission;

    const displayTitle = title ? (title.length > 40 ? `${title.substring(0, 37)}...` : title) : "";

    const [missionImage, polliaLogo, suitFont] = await Promise.all([
      imageUrl ? fetchImageAsBase64(imageUrl, 530, 530, "cover") : null,
      fetchImageAsBase64("https://pollia.me/images/pollia-logo.png", 158, 50, "contain"),
      loadSuitFont(),
    ]);

    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          gap: 40,
          padding: 50,
          backgroundColor: "#ffffff",
        }}
      >
        {/* Left: Mission Image */}
        <div
          style={{
            width: 530,
            height: 530,
            flexShrink: 0,
            display: "flex",
            borderRadius: 40,
            overflow: "hidden",
            backgroundColor: "#e4e4e7",
          }}
        >
          {missionImage ? (
            <img
              src={missionImage}
              alt=""
              width={530}
              height={530}
              style={{
                objectFit: "cover",
              }}
            />
          ) : null}
        </div>

        {/* Right: Title + Logo */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              color: "#000000",
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 1.2,
              fontFamily: "SUIT",
            }}
          >
            {displayTitle}
          </div>

          {polliaLogo ? (
            <div style={{ display: "flex" }}>
              <img src={polliaLogo} alt="Pollia" width={158} height={50} />
            </div>
          ) : null}
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
        fonts: suitFont
          ? [
              {
                name: "SUIT",
                data: suitFont,
                weight: 700,
                style: "normal",
              },
            ]
          : undefined,
      },
    );
  } catch (error) {
    console.error("OG image generation error:", error);
    return new Response(`Failed to generate image: ${error}`, { status: 500 });
  }
}
