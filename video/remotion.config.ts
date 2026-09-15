import { existsSync } from "node:fs";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setCodec("h264");
Config.setChromiumOpenGlRenderer("angle");

// CRF 을 여기서 전역으로 걸면 안 된다. gif 코덱은 --crf 를 거부해서
// PlantLoop 렌더가 "The gif codec does not support the --crf option" 으로 죽는다.
// mp4 는 render 스크립트에서 --crf=18 로 준다.

// 이 PC 에 Playwright 가 받아둔 Chromium 이 있으면 재사용해 별도 다운로드를 피한다.
// 없으면 Remotion 이 알아서 자체 브라우저를 내려받는다.
// 경로는 역슬래시 이스케이프 실수를 피하려고 슬래시로 쓴다 (Windows 도 받아들인다).
const PLAYWRIGHT_CHROME =
  "C:/Users/hj777/AppData/Local/ms-playwright/chromium-1244/chrome-win64/chrome.exe";
if (existsSync(PLAYWRIGHT_CHROME)) {
  Config.setBrowserExecutable(PLAYWRIGHT_CHROME);
}
