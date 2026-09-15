"use client";

import { useEffect } from "react";

/** 서비스 워커 등록 — 앱 설치(PWA) 조건을 만족시킨다. */
export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // 등록 실패해도 앱 동작에는 영향이 없다.
    });
  }, []);

  return null;
}
