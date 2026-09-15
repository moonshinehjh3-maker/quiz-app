// 설치 가능 조건을 만족시키기 위한 최소 서비스 워커.
// 퀴즈 내용은 항상 최신이어야 하므로 응답을 캐시하지 않고 그대로 통과시킨다.
// 오프라인일 때 페이지 이동만 안내 화면으로 대체한다.
const OFFLINE_HTML = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>오프라인</title><style>
body{margin:0;height:100dvh;display:grid;place-items:center;background:#0b0b0f;color:#ededf0;
font-family:"Malgun Gothic",system-ui,sans-serif;text-align:center;padding:24px}
p{color:#9ca3af;font-size:14px;margin-top:8px}
</style></head><body><div><h1>연결이 끊겼습니다</h1>
<p>AI 퀴즈는 문제 생성을 위해 인터넷 연결이 필요합니다.</p></div></body></html>`;

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(Promise.resolve());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(
      () =>
        new Response(OFFLINE_HTML, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
    ),
  );
});
