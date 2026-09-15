"use client";

/** 흙 표면 y 좌표 — 식물이 자라나는 기준선. */
const SOIL_Y = 150;
/** 줄기 밑동은 흙 속에 살짝 묻어 둔다. */
const STEM_BOTTOM = 158;
const MAX_STEM = 112;

/** 잎이 돋아나는 시점(성장률)과 줄기에서의 높이 비율. */
const LEAVES = [
  { at: 0.15, h: 0.32, dir: -1 },
  { at: 0.4, h: 0.56, dir: 1 },
  { at: 0.64, h: 0.78, dir: -1 },
];

/** 꽃은 성장률 55% 부터 봉오리로 나타나 100% 에서 만개한다. */
const BLOOM_FROM = 0.55;

export default function Plant({
  correct,
  total,
  celebrate = false,
  className = "h-44 w-44",
  label,
}: {
  correct: number;
  total: number;
  /** 방금 정답을 맞혀 성장한 순간인지 — 살짝 튀어오르는 연출용 */
  celebrate?: boolean;
  className?: string;
  label?: string;
}) {
  const progress = total > 0 ? Math.min(correct / total, 1) : 0;
  const stemHeight = progress === 0 ? 0 : 10 + progress * (MAX_STEM - 10);
  const tipY = SOIL_Y - stemHeight;
  const bloom = Math.max(0, Math.min((progress - BLOOM_FROM) / (1 - BLOOM_FROM), 1));

  return (
    <svg
      viewBox="0 0 200 220"
      role="img"
      aria-label={
        label ??
        `${total}문제 중 ${correct}문제 정답, 식물이 ${Math.round(progress * 100)}% 자랐습니다`
      }
      className={`${className} shrink-0 ${celebrate ? "animate-[plant-pop_600ms_ease-out]" : ""}`}
    >
      {/* 화분 몸통 */}
      <path
        d="M63 164 h74 l-8 41 a7 7 0 0 1 -7 6 h-44 a7 7 0 0 1 -7 -6 z"
        className="fill-orange-700"
      />
      {/* 화분 테두리 */}
      <rect x="55" y="149" width="90" height="16" rx="5" className="fill-orange-600" />
      {/* 흙 */}
      <ellipse cx="100" cy={SOIL_Y} rx="39" ry="7" className="fill-amber-900" />

      {/* 줄기 */}
      <rect
        x="96"
        y={tipY}
        width="8"
        height={progress === 0 ? 0 : STEM_BOTTOM - tipY}
        rx="4"
        className="fill-emerald-600 transition-all duration-700 ease-out"
      />

      {/* 잎 */}
      {LEAVES.map((leaf, i) => {
        const shown = progress >= leaf.at;
        const cy = SOIL_Y - stemHeight * leaf.h;
        const cx = 100 + leaf.dir * 23;
        return (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx="24"
            ry="11"
            transform={`rotate(${leaf.dir * -20} ${cx} ${cy})`}
            className="fill-emerald-500 transition-all duration-700 ease-out"
            style={{
              opacity: shown ? 1 : 0,
              transformBox: "fill-box",
              transformOrigin: leaf.dir < 0 ? "right center" : "left center",
              scale: shown ? "1" : "0.15",
            }}
          />
        );
      })}

      {/* 꽃 — 줄기 끝에 붙어 함께 올라간다 */}
      <g
        className="transition-all duration-700 ease-out"
        style={{
          opacity: bloom === 0 ? 0 : 1,
          transform: `translate(100px, ${tipY}px) scale(${0.25 + bloom * 0.75})`,
          transformBox: "view-box",
          transformOrigin: "0 0",
        }}
      >
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse
            key={angle}
            cx="0"
            cy="-15"
            rx="10"
            ry="16"
            transform={`rotate(${angle})`}
            className="fill-pink-400"
          />
        ))}
        <circle cx="0" cy="0" r="9" className="fill-amber-300" />
      </g>

      {/* 씨앗 — 아직 아무것도 못 맞혔을 때만 흙 위에 보인다 */}
      {progress === 0 && (
        <g transform={`rotate(-20 100 ${SOIL_Y - 11})`}>
          <ellipse cx="100" cy={SOIL_Y - 11} rx="13" ry="10" className="fill-amber-500" />
          <path
            d={`M92 ${SOIL_Y - 15} q8 -5 16 3`}
            className="stroke-amber-200"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      )}
    </svg>
  );
}
