# 소개영상 (Remotion)

`AI 퀴즈 생성기` 소개영상 소스. 앱과 **별도의 독립 프로젝트**다.
루트 `package.json` 에 Remotion 을 넣으면 Vercel 배포에 불필요한 네이티브 바이너리가
따라가므로 여기서 따로 관리한다.

## 미리보기 / 렌더

```bash
cd video
npm install
npm run studio     # http://localhost:3100 (앱의 3000 번과 겹치지 않게)
npm run render     # ../out/intro.mp4
```

| 컴포지션 | 용도 |
| --- | --- |
| `Intro` | 최종 산출물 (1920×1080 · 30fps · 53.6초) |
| `S1Hook` … `S7Outro` | 씬별 — 전체를 스크럽하지 않고 한 씬만 보며 다듬기 위한 것 |
| `PlantLoop` | README 용 식물 성장 루프 (1080×1080) |

## 알아둘 것

- **CSS transition / animation 을 쓰지 않는다.** Remotion 은 프레임을 하나씩 독립적으로
  그리기 때문에 CSS transition 이 발동하지 않고, 렌더 결과가 비결정적이 된다.
  모든 움직임은 `interpolate` / `spring` 으로 만든다.
- `src/Plant.tsx` 는 앱의 `components/plant.tsx` 를 옮긴 것이다. 원본은 `correct`(정수)를
  받아 CSS 가 보간하지만, 여기서는 `progress`(실수)를 프레임마다 직접 계산한다.
  기하학 상수와 계산식은 원본과 동일하게 유지했다.
- `src/theme.ts` 는 `app/globals.css` 의 토큰을 복제한 것이다. 앱 디자인이 바뀌면 여기도
  같이 고쳐야 한다. **앱 코드를 import 하지 않는다** — `"use client"` 와 Tailwind 클래스가
  딸려 들어온다.
- `src/timeline.ts` 가 모든 프레임 숫자의 단일 출처다. 씬 파일에 매직 넘버를 두지 않는다.
- 이 영상은 앱의 `55a11b1` 시점 화면을 기준으로 만들었다.
