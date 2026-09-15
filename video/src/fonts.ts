import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadNotoKR } from "@remotion/google-fonts/NotoSansKR";
import { continueRender, delayRender } from "remotion";

/**
 * 앱은 Geist 를 latin 서브셋만 로드해서 한글이 시스템 폰트로 떨어진다.
 * 렌더 머신마다 글자가 달라지므로 영상에서는 한글 폰트를 명시적으로 싣는다.
 *
 * 폰트가 준비되기 전에 프레임이 캡처되면 대체 폰트(궁서/Malgun)로 찍히고
 * 글자 폭이 달라져 레이아웃이 튄다. delayRender 로 첫 프레임을 붙잡아 둔다.
 */
const handle = delayRender("웹폰트 로딩 대기");

const geist = loadGeist("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

// 한글 subset 은 유니코드 구간이 잘게 쪼개져 있어 요청 수가 폭증한다.
// 라틴/숫자는 Geist 가 담당하므로 여기서는 latin 을 빼고 한글만 싣는다.
const noto = loadNotoKR("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["korean"],
});

Promise.all([geist.waitUntilDone(), noto.waitUntilDone()])
  .then(() => continueRender(handle))
  .catch((err) => {
    // 폰트 로딩이 실패해도 렌더 자체는 진행시킨다 (대체 폰트로라도 나오게).
    console.error("폰트 로딩 실패:", err);
    continueRender(handle);
  });

/** 라틴/숫자는 Geist, 한글은 Noto Sans KR 로 떨어지도록 순서를 잡는다. */
export const FONT_FAMILY = `${geist.fontFamily}, ${noto.fontFamily}, sans-serif`;
