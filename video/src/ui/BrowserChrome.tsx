import React from "react";
import { C } from "../theme";
import { FONT_FAMILY } from "../fonts";

/** 앱 화면을 감싸는 브라우저 창. 영상에 "웹 앱"이라는 맥락을 준다. */
export const BrowserChrome: React.FC<{
  url: string;
  width: number;
  height: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ url, width, height, children, style }) => (
  <div
    style={{
      width,
      height,
      borderRadius: 18,
      overflow: "hidden",
      background: "#ffffff",
      boxShadow: "0 40px 90px rgba(16,16,26,0.16), 0 6px 18px rgba(16,16,26,0.08)",
      border: `1px solid ${C.border}`,
      display: "flex",
      flexDirection: "column",
      ...style,
    }}
  >
    {/* 타이틀 바 */}
    <div
      style={{
        height: 52,
        flexShrink: 0,
        background: "#f1f1f4",
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        padding: "0 18px",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", gap: 8 }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <div key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />
        ))}
      </div>
      <div
        style={{
          flex: 1,
          height: 30,
          borderRadius: 15,
          background: "#ffffff",
          border: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT_FAMILY,
          fontSize: 13,
          color: C.muted,
        }}
      >
        {url}
      </div>
    </div>

    <div style={{ flex: 1, overflow: "hidden" }}>{children}</div>
  </div>
);
