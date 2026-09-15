import React from "react";
import { Composition } from "remotion";
import "./fonts"; // 폰트 로딩은 어떤 컴포지션보다 먼저 시작되어야 한다
import { Intro } from "./Intro";
import { FPS, HEIGHT, SCENES, TOTAL, WIDTH } from "./timeline";
import { S1Hook } from "./scenes/S1Hook";
import { S2Form } from "./scenes/S2Form";
import { S5Answer } from "./scenes/S5Answer";
import { S6Bloom } from "./scenes/S6Bloom";
import { S7Outro } from "./scenes/S7Outro";
import { PlantLoop } from "./PlantLoop";

const SCENE_COMPONENTS: Record<string, React.FC> = {
  S1Hook,
  S2Form,
  S5Answer,
  S6Bloom,
  S7Outro,
};

export const RemotionRoot: React.FC = () => (
  <>
    {/* 최종 산출물 */}
    <Composition
      id="Intro"
      component={Intro}
      durationInFrames={TOTAL}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />

    {/* 씬별 컴포지션 — 55초를 스크럽하지 않고 한 씬만 보며 다듬기 위한 것.
        길이는 timeline.ts 에서 가져오므로 본편과 절대 어긋나지 않는다. */}
    {SCENES.map((s) => (
      <Composition
        key={s.id}
        id={s.id}
        component={SCENE_COMPONENTS[s.id]}
        durationInFrames={s.durationInFrames}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    ))}

    {/* README 용 식물 성장 루프 (GIF 로 뽑는다) */}
    <Composition
      id="PlantLoop"
      component={PlantLoop}
      durationInFrames={180}
      fps={FPS}
      width={1080}
      height={1080}
    />
  </>
);
