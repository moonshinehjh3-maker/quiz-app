import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, HERO_GRADIENT } from "../theme";
import { FONT_FAMILY } from "../fonts";
import { EASE_POINTER, fadeInOut, ramp } from "../lib/anim";

/** 하단 자막 밴드. 무음 영상이라 이게 내레이션을 대신한다. */
export const Caption: React.FC<{ text: string; range: readonly number[] }> = ({
  text,
  range,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeInOut(frame, range);
  if (opacity <= 0.001) return null;
  const t = ramp(frame, [range[0], range[0] + 10]);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 64,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${(1 - t) * 14}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 40,
          fontWeight: 600,
          lineHeight: 1.35,
          color: C.foreground,
          textAlign: "center",
          background: "rgba(247,247,248,0.86)",
          padding: "16px 36px",
          borderRadius: 18,
          border: `1px solid ${C.border}`,
          whiteSpace: "pre-line",
          wordBreak: "keep-all",
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** 가짜 타이핑. 글자 수는 항상 정수여야 하므로 interpolate 를 쓰지 않는다. */
export const TypedText: React.FC<{
  text: string;
  startFrame: number;
  delays: readonly number[];
  placeholder?: string;
  fontSize?: number;
}> = ({ text, startFrame, delays, placeholder, fontSize = 16 }) => {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;

  let acc = 0;
  let visible = 0;
  for (let i = 0; i < text.length; i++) {
    acc += delays[i] ?? delays[delays.length - 1] ?? 6;
    if (acc <= elapsed) visible = i + 1;
  }

  const typing = elapsed >= 0 && visible < text.length;
  // 타이핑 중엔 캐럿을 켜두고, 멈추면 500ms 주기로 깜빡인다.
  const caretOn = typing ? true : Math.floor(frame / 15) % 2 === 0;

  return (
    <span style={{ fontSize, display: "inline-flex", alignItems: "center" }}>
      {visible === 0 && elapsed < 0 && placeholder ? (
        <span style={{ color: C.muted }}>{placeholder}</span>
      ) : (
        <span>{text.slice(0, visible)}</span>
      )}
      {elapsed >= 0 && caretOn && (
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: fontSize * 1.15,
            background: C.accent,
            marginLeft: 1,
          }}
        />
      )}
    </span>
  );
};

/** 가짜 마우스 커서 + 클릭 파동. 반드시 앱 뷰포트와 같은 좌표계 안에 둔다. */
export const Cursor: React.FC<{
  path: readonly { frame: number; x: number; y: number }[];
  clicks?: readonly number[];
}> = ({ path, clicks = [] }) => {
  const frame = useCurrentFrame();
  const frames = path.map((p) => p.frame);
  const opts = { easing: EASE_POINTER, extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const x = interpolate(frame, frames, path.map((p) => p.x), opts);
  const y = interpolate(frame, frames, path.map((p) => p.y), opts);

  const lastClick = clicks.filter((c) => c <= frame).pop() ?? null;
  const sinceClick = lastClick === null ? null : frame - lastClick;

  const dip =
    sinceClick !== null && sinceClick <= 7
      ? interpolate(sinceClick, [0, 3, 7], [1, 0.86, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  const rippleT = sinceClick !== null && sinceClick <= 14 ? sinceClick / 14 : null;

  return (
    <>
      {rippleT !== null && (
        <div
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: rippleT * 80,
            height: rippleT * 80,
            marginLeft: (-rippleT * 80) / 2,
            marginTop: (-rippleT * 80) / 2,
            borderRadius: "50%",
            background: C.accent,
            opacity: (1 - rippleT) * 0.35,
            pointerEvents: "none",
            zIndex: 49,
          }}
        />
      )}
      <svg
        width="30"
        height="44"
        viewBox="0 0 30 44"
        style={{
          position: "absolute",
          left: x,
          top: y,
          transform: `scale(${dip})`,
          transformOrigin: "top left",
          filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.25))",
          zIndex: 50,
          pointerEvents: "none",
        }}
      >
        <path
          d="M3 2 L3 32 L11 25 L16 37 L21 35 L16 23 L26 22 Z"
          fill="#ffffff"
          stroke={C.foreground}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
};

/**
 * 앱 홈 히어로의 라디얼 그라디언트 한 쌍.
 *
 * offset 으로 배경을 천천히 흘려 정지 구간에서도 화면이 죽지 않게 한다.
 * 이때 inset:0 이면 밀린 만큼 가장자리가 안 칠해져 프레임 테두리에 띠가 생기므로,
 * 흐를 폭보다 넉넉히 바깥으로 빼서 깐다.
 */
export const HeroGradient: React.FC<{ opacity?: number; offset?: number }> = ({
  opacity = 1,
  offset = 0,
}) => (
  <div
    style={{
      position: "absolute",
      inset: -120,
      background: HERO_GRADIENT,
      backgroundPosition: `${offset}px ${offset}px`,
      opacity,
    }}
  />
);

/** 진행바 — 앱의 h-1.5 bg-border 트랙 + emerald 채움. */
export const ProgressBar: React.FC<{ progress: number; width?: number }> = ({
  progress,
  width,
}) => (
  <div
    style={{
      width: width ?? "100%",
      height: 6,
      borderRadius: 3,
      background: C.border,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        width: `${Math.min(progress, 1) * 100}%`,
        height: "100%",
        background: C.emerald500,
      }}
    />
  </div>
);
