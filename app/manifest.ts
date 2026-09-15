import type { MetadataRoute } from "next";

/** PWA 매니페스트 — 브라우저가 이 앱을 독립 실행형 앱으로 설치할 수 있게 한다. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AI 퀴즈 생성기",
    short_name: "AI 퀴즈",
    description: "주제를 입력하면 AI 가 객관식 퀴즈를 만들어 주는 앱",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0b0f",
    theme_color: "#4f46e5",
    lang: "ko",
    categories: ["education", "games"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
