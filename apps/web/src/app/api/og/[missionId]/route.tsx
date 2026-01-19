import { missionService } from "@/server/services/mission";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

/**
 * wsrv.nl 이미지 프록시를 사용해 이미지를 PNG로 변환하고 리사이즈
 * https://wsrv.nl/docs/
 */
function getProxiedImageUrl(url: string, width: number, height: number): string {
  const encodedUrl = encodeURIComponent(url);
  return `https://wsrv.nl/?url=${encodedUrl}&w=${width}&h=${height}&fit=cover&output=png`;
}

async function fetchImageAsBase64(
  url: string,
  width?: number,
  height?: number,
): Promise<string | null> {
  try {
    // wsrv.nl 프록시를 통해 PNG로 변환 및 리사이즈
    const fetchUrl =
      width && height ? getProxiedImageUrl(url, width, height) : url;

    const res = await fetch(fetchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });

    if (!res.ok) {
      console.error(
        `Failed to fetch image: ${fetchUrl}, status: ${res.status}`,
      );
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
    const { title, imageUrl, brandLogoUrl } = mission;

    const displayTitle = title
      ? title.length > 50
        ? `${title.substring(0, 47)}...`
        : title
      : "";

    // wsrv.nl 프록시를 통해 PNG로 변환 및 리사이즈
    const [missionImage, brandLogo, polliaLogo] = await Promise.all([
      imageUrl ? fetchImageAsBase64(imageUrl, 300, 300) : null,
      brandLogoUrl ? fetchImageAsBase64(brandLogoUrl, 56, 56) : null,
      fetchImageAsBase64("https://pollia.me/images/pollia-logo.png", 100, 32),
    ]);

    return new ImageResponse(
      (
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
            {missionImage ? (
              <img
                src={missionImage}
                width={630}
                height={630}
                style={{
                  objectFit: "cover",
                  objectPosition: "top",
                }}
              />
            ) : null}
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
            {brandLogo ? (
              <img
                src={brandLogo}
                width={56}
                height={56}
                style={{
                  borderRadius: 28,
                  marginBottom: 24,
                }}
              />
            ) : null}

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

            {polliaLogo ? (
              <div style={{ marginTop: "auto", display: "flex" }}>
                <img src={polliaLogo} height={32} />
              </div>
            ) : null}
          </div>
        </div>
      ),
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
    return new Response(`Failed to generate image: ${error}`, { status: 500 });
  }
}
