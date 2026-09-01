import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "HOAcove — Simple HOA management for self-managed boards";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 100,
            height: 100,
            borderRadius: 24,
            background: "#ffffff",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 58,
            fontWeight: 700,
            color: "#0a0a0a",
          }}
        >
          H
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 700,
            marginTop: 44,
          }}
        >
          HOAcove
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "#a3a3a3",
            marginTop: 18,
          }}
        >
          Simple HOA management for self-managed boards
        </div>
      </div>
    ),
    { ...size }
  );
}
