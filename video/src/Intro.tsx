import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { C } from "./theme";
import { SCENES, TRANSITIONS } from "./timeline";
import { S1Hook } from "./scenes/S1Hook";
import { S2Form } from "./scenes/S2Form";
import { S5Answer } from "./scenes/S5Answer";
import { S6Bloom } from "./scenes/S6Bloom";
import { S7Outro } from "./scenes/S7Outro";

const [d1, d2, d3, d4, d5] = SCENES.map((s) => s.durationInFrames);
const [t1, t2, t3, t4] = TRANSITIONS;

export const Intro: React.FC = () => (
  <AbsoluteFill style={{ background: C.background }}>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={d1}>
        <S1Hook />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: t1 })}
      />

      <TransitionSeries.Sequence durationInFrames={d2}>
        <S2Form />
      </TransitionSeries.Sequence>

      {/* 실제 앱의 router.push('/quiz/[id]') 를 흉내 낸다 */}
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: t2 })}
      />

      <TransitionSeries.Sequence durationInFrames={d3}>
        <S5Answer />
      </TransitionSeries.Sequence>

      {/* 식물이 화면을 이어 주는 구간이라 와이프가 아니라 페이드로 넘긴다 */}
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: t3 })}
      />

      <TransitionSeries.Sequence durationInFrames={d4}>
        <S6Bloom />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-bottom" })}
        timing={linearTiming({ durationInFrames: t4 })}
      />

      <TransitionSeries.Sequence durationInFrames={d5}>
        <S7Outro />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);
