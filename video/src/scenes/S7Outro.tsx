import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Plant } from "../Plant";
import { C } from "../theme";
import { FONT_FAMILY } from "../fonts";
import { HeroGradient } from "../ui/Bits";
import { EASE_OUT, fadeUp } from "../lib/anim";
import { S7 } from "../timeline";
import { APP_URL, REPO_URL } from "../lib/data";

export const S7Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const plantIn = spring({
    frame: frame - S7.plantIn[0],
    fps,
    config: { damping: 200 },
    durationInFrames: S7.plantIn[1] - S7.plantIn[0],
  });

  const breathe = 1 + 0.012 * Math.sin((2 * Math.PI * frame) / 100);

  // 마지막은 살짝 밀어 넣으며 마무리한다.
  // 완전히 페이드아웃시키면 마지막 1초가 빈 화면이 되고, 썸네일로 잡히는 마지막
  // 프레임에도 아무것도 안 남는다. 내용은 끝까지 화면에 둔다.
  const finalScale = interpolate(frame, S7.fadeOut, [1, 1.02], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 그라디언트가 아주 천천히 흐르게 해서 정지 구간에도 화면이 죽지 않게 한다
  const drift = interpolate(frame, [0, 210], [0, 30]);

  return (
    <AbsoluteFill style={{ background: C.background }}>
      <HeroGradient offset={drift} />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT_FAMILY,
          color: C.foreground,
          wordBreak: "keep-all",

          transform: `scale(${finalScale})`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 80 }}>
          {/* 식물 */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${(0.9 + plantIn * 0.1) * breathe})`,
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 380,
                height: 380,
                borderRadius: "50%",
                background: "rgba(0,212,146,0.22)",
                filter: "blur(48px)",
              }}
            />
            <Plant progress={1} size={380} opacity={plantIn} />
          </div>

          {/* 텍스트 */}
          <div style={{ maxWidth: 720 }}>
            <div
              style={{
                ...fadeUp(frame, S7.titleIn, 20),
                fontSize: 82,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
              }}
            >
              AI 퀴즈 생성기
            </div>
            <div
              style={{
                ...fadeUp(frame, S7.subtitleIn, 16),
                fontSize: 40,
                color: C.muted,
                marginTop: 14,
              }}
            >
              주제만 입력하면, 직접 키워 보세요
            </div>

            <div
              style={{
                ...fadeUp(frame, S7.urlIn, 18),
                display: "inline-block",
                marginTop: 36,
                borderRadius: 14,
                background: C.accent,
                color: "#fff",
                fontSize: 36,
                fontWeight: 600,
                padding: "18px 32px",
              }}
            >
              {APP_URL}
            </div>

            <div
              style={{
                ...fadeUp(frame, S7.githubIn, 14),
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 26,
                fontSize: 28,
                color: C.muted,
              }}
            >
              <svg width="30" height="30" viewBox="0 0 16 16" fill={C.muted}>
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
              </svg>
              {REPO_URL}
            </div>

            <div
              style={{
                ...fadeUp(frame, S7.stackIn, 12),
                marginTop: 26,
                fontSize: 24,
                color: C.muted,
              }}
            >
              OpenAI × Neon × Vercel
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
