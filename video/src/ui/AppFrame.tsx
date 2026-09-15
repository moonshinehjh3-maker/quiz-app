import React from "react";
import { C } from "../theme";
import { FONT_FAMILY } from "../fonts";

/** app/layout.tsx 의 헤더/메인/푸터 크롬을 그대로 옮긴 것. */
export const AppFrame: React.FC<{
  children: React.ReactNode;
  /** 본문 폭. 앱은 max-w-3xl(768px) 이지만 씬에 따라 넓게 쓴다. */
  contentWidth?: number;
  height?: number;
  /** 본문 세로 여백. 내용이 많은 씬에서는 줄여서 잘림을 막는다. */
  padY?: number;
}> = ({ children, contentWidth = 768, height = 880, padY = 32 }) => (
  <div
    style={{
      width: "100%",
      height,
      background: C.background,
      color: C.foreground,
      fontFamily: FONT_FAMILY,
      wordBreak: "keep-all",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}
  >
    {/* 헤더 */}
    <div style={{ borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
      <div
        style={{
          maxWidth: contentWidth,
          margin: "0 auto",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em" }}>
          AI 퀴즈 생성기
        </span>
        <span style={{ fontSize: 12, color: C.muted }}>OpenAI × Neon × Vercel</span>
      </div>
    </div>

    {/* 본문 */}
    <div style={{ flex: 1, overflow: "hidden" }}>
      <div style={{ maxWidth: contentWidth, margin: "0 auto", padding: `${padY}px 20px` }}>
        {children}
      </div>
    </div>

    {/* 푸터 */}
    <div style={{ borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
      <div
        style={{
          maxWidth: contentWidth,
          margin: "0 auto",
          padding: "16px 20px",
          fontSize: 12,
          color: C.muted,
        }}
      >
        문제는 생성형 AI 가 만들며 사실과 다를 수 있습니다.
      </div>
    </div>
  </div>
);

/** 카드 — 앱의 `rounded-2xl border border-border bg-card` 레시피. */
export const Card: React.FC<{
  children: React.ReactNode;
  padding?: number;
  style?: React.CSSProperties;
}> = ({ children, padding = 24, style }) => (
  <div
    style={{
      borderRadius: 16,
      border: `1px solid ${C.border}`,
      background: C.card,
      padding,
      ...style,
    }}
  >
    {children}
  </div>
);
