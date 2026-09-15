import React from "react";
import { Easing, interpolate } from "remotion";
import { C } from "./theme";

/** Tailwind 의 `ease-out` = cubic-bezier(0, 0, 0.2, 1). */
const EASE_OUT = Easing.bezier(0, 0, 0.2, 1);

/** 앱이 식물을 그리는 기준 크기(h-44 = 176px). translateY 보정에 쓴다. */
const APP_PLANT_PX = 176;

/**
 * components/plant.tsx 의 영상용 이식본.
 *
 * 원본은 `correct`(정수)를 받아 CSS `transition-all duration-700 ease-out` 으로
 * 브라우저가 중간값을 보간해 준다. Remotion 은 프레임을 하나씩 독립적으로 그려서
 * CSS transition 이 아예 발동하지 않으므로, 대신 **progress 를 실수로 받아**
 * 매 프레임 기하학을 직접 계산한다.
 *
 * 기하학 상수와 계산식은 원본과 동일하게 유지한다. 달라진 점은 두 가지뿐:
 *  1. progress 가 연속값이다.
 *  2. 잎 등장과 씨앗 퇴장이 임계값에서 뚝 끊기지 않고 짧은 구간에 걸쳐 섞인다.
 */

const SOIL_Y = 150;
const STEM_BOTTOM = 158;
const MAX_STEM = 112;

const LEAVES = [
  { at: 0.15, h: 0.32, dir: -1 },
  { at: 0.4, h: 0.56, dir: 1 },
  { at: 0.64, h: 0.78, dir: -1 },
];

const BLOOM_FROM = 0.55;

/** 잎이 완전히 펴지는 데 걸리는 progress 폭. 원본의 700ms transition 을 대신한다. */
const LEAF_FADE = 0.12;
/** 줄기가 0 에서 원본 공식의 시작값 10 까지 올라오는 구간. */
const STEM_RAMP = 0.05;
/** 씨앗이 사라지는 구간. */
const SEED_FADE = 0.05;

const clamp01 = (v: number) => Math.max(0, Math.min(v, 1));

/**
 * plant-pop 키프레임의 프레임 기반 구현.
 * 원본 CSS: 0% scale(1) → 35% scale(1.09) translateY(-4px) → 100% scale(1), 600ms.
 */
function popTransform(framesSincePop: number | null, fps: number, size: number) {
  if (framesSincePop === null || framesSincePop < 0) return { scale: 1, dy: 0 };
  const duration = (600 / 1000) * fps; // 600ms
  if (framesSincePop > duration) return { scale: 1, dy: 0 };
  const mid = duration * 0.35; // 35% 키프레임. 18프레임 기준 6.3 — 정수로 반올림하지 않는다.
  const opts = {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  } as const;
  const scale = interpolate(framesSincePop, [0, mid, duration], [1, 1.09, 1], opts);
  // 원본의 -4px 는 176px 로 그릴 때의 값이다. 영상은 훨씬 크게 그리므로 비례 보정한다.
  const peak = -4 * (size / APP_PLANT_PX);
  const dy = interpolate(framesSincePop, [0, mid, duration], [0, peak, 0], opts);
  return { scale, dy };
}

export const Plant: React.FC<{
  /** 0 ~ 1. 원본의 correct/total 에 해당하지만 실수다. */
  progress: number;
  /** 정답을 맞힌 순간부터 지난 프레임 수. null 이면 바운스 없음. */
  framesSincePop?: number | null;
  fps?: number;
  size: number;
  opacity?: number;
}> = ({ progress: rawProgress, framesSincePop = null, fps = 30, size, opacity = 1 }) => {
  const progress = clamp01(rawProgress);

  // 줄기 — progress>0 에서 10 으로 점프하는 원본의 불연속을 STEM_RAMP 구간으로 흡수한다.
  // progress >= STEM_RAMP 부터는 원본 공식(10 + p*102)과 완전히 동일하다.
  const stemBase = 10 * clamp01(progress / STEM_RAMP);
  const stemHeight = progress === 0 ? 0 : stemBase + progress * (MAX_STEM - 10);
  const tipY = SOIL_Y - stemHeight;

  const bloom = clamp01((progress - BLOOM_FROM) / (1 - BLOOM_FROM));
  const seedOpacity = 1 - clamp01(progress / SEED_FADE);
  const pop = popTransform(framesSincePop, fps, size);

  return (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={size}
      style={{
        display: "block",
        flexShrink: 0,
        opacity,
        transform: `scale(${pop.scale}) translateY(${pop.dy}px)`,
        transformOrigin: "center bottom",
      }}
    >
      {/* 화분 몸통 */}
      <path
        d="M63 164 h74 l-8 41 a7 7 0 0 1 -7 6 h-44 a7 7 0 0 1 -7 -6 z"
        fill={C.potBody}
      />
      {/* 화분 테두리 */}
      <rect x="55" y="149" width="90" height="16" rx="5" fill={C.potRim} />
      {/* 흙 */}
      <ellipse cx="100" cy={SOIL_Y} rx="39" ry="7" fill={C.soil} />

      {/* 줄기 */}
      <rect
        x="96"
        y={tipY}
        width="8"
        height={progress === 0 ? 0 : STEM_BOTTOM - tipY}
        rx="4"
        fill={C.stem}
      />

      {/* 잎 — 원본은 임계값에서 on/off 후 CSS 가 보간했다. 여기서는 직접 섞는다. */}
      {LEAVES.map((leaf) => {
        const t = clamp01((progress - leaf.at) / LEAF_FADE);
        if (t === 0) return null;
        const cx = 100 + leaf.dir * 23;
        const cy = SOIL_Y - stemHeight * leaf.h;
        const scale = 0.15 + t * 0.85;
        // 원본은 transformBox:fill-box + transformOrigin:"right|left center" 로
        // **줄기 쪽 끝**을 축으로 잎을 펼친다. 그 축의 좌표가 cx - dir*24 다.
        // (dir=-1 인 왼쪽 잎은 오른쪽 끝 cx+24, dir=+1 인 오른쪽 잎은 왼쪽 끝 cx-24)
        // CSS transformOrigin 과 SVG transform 속성을 한 요소에 섞으면 렌더러마다
        // 결과가 달라지므로, 전부 SVG transform 리스트 하나로 합친다.
        const ax = cx - leaf.dir * 24;
        return (
          <g
            key={leaf.at}
            transform={
              `rotate(${leaf.dir * -20} ${cx} ${cy}) ` +
              `translate(${ax} ${cy}) scale(${scale}) translate(${-ax} ${-cy})`
            }
            opacity={t}
          >
            <ellipse cx={cx} cy={cy} rx="24" ry="11" fill={C.leaf} />
          </g>
        );
      })}

      {/* 꽃 — 줄기 끝에 붙어 함께 올라간다 */}
      {bloom > 0 && (
        <g
          transform={`translate(100 ${tipY}) scale(${0.25 + bloom * 0.75})`}
          opacity={bloom === 0 ? 0 : 1}
        >
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse
              key={angle}
              cx="0"
              cy="-15"
              rx="10"
              ry="16"
              transform={`rotate(${angle})`}
              fill={C.petal}
            />
          ))}
          <circle cx="0" cy="0" r="9" fill={C.flowerCenter} />
        </g>
      )}

      {/* 씨앗 — 원본은 progress===0 에서만 렌더. 여기서는 짧게 페이드아웃시킨다. */}
      {seedOpacity > 0 && (
        <g transform={`rotate(-20 100 ${SOIL_Y - 11})`} opacity={seedOpacity}>
          <ellipse cx="100" cy={SOIL_Y - 11} rx="13" ry="10" fill={C.seed} />
          <path
            d={`M92 ${SOIL_Y - 15} q8 -5 16 3`}
            stroke={C.seedHighlight}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      )}
    </svg>
  );
};
