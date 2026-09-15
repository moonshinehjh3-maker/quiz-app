import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Plant } from "./Plant";
import { C } from "./theme";
import { EASE_OUT } from "./lib/anim";

/** README 에 넣을 식물 성장 루프. 씨앗 → 만개 → 유지 → 리셋. */
export const PlantLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 0~90: 성장, 90~160: 유지, 160~180: 페이드로 리셋
  const progress = interpolate(frame, [0, 90], [0, 1], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const resetFade = interpolate(frame, [160, 178], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pops = [18, 36, 54, 72, 88];
  const lastPop = pops.filter((p) => p <= frame).pop() ?? null;

  return (
    <AbsoluteFill
      style={{ background: C.background, alignItems: "center", justifyContent: "center" }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "rgba(0,212,146,0.22)",
            filter: "blur(60px)",
            transform: `scale(${0.6 + progress * 0.8})`,
          }}
        />
        <Plant
          progress={progress}
          size={700}
          framesSincePop={lastPop === null ? null : frame - lastPop}
          fps={fps}
          opacity={resetFade}
        />
      </div>
    </AbsoluteFill>
  );
};
