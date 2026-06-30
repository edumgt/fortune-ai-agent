import { card, alertBox, escapeHtml } from "../ui/components.js";
import { calcDaily, getUser, getVapidPublicKey, subscribePush, unsubscribePush } from "../api.js";

const LEVEL_LABEL = { great: "🌟 대길", good: "✨ 길", neutral: "😐 평운", caution: "⚠️ 주의" };
const LEVEL_CLASS = {
  great: "bg-emerald-50 border-emerald-200 text-emerald-900",
  good: "bg-sky-50 border-sky-200 text-sky-900",
  neutral: "bg-slate-50 border-slate-200 text-slate-700",
  caution: "bg-amber-50 border-amber-200 text-amber-900",
};

function luckBar(score) {
  const pct = Math.round(score);
  const color = score >= 70 ? "bg-emerald-500" : score >= 50 ? "bg-sky-400" : score >= 30 ? "bg-amber-400" : "bg-rose-400";
  return `
    <div class="flex items-center gap-3">
      <div class="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
        <div class="${color} h-full rounded-full transition-all" style="width:${pct}%"></div>
      </div>
      <span class="text-sm font-bold w-10 text-right">${pct}점</span>
    </div>`;
}

function renderAreaCard(label, emoji, area) {
  const cls = LEVEL_CLASS[area.level] || LEVEL_CLASS.neutral;
  return `
    <div class="p-3 rounded-xl border ${cls}">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-lg">${emoji}</span>
        <span class="font-semibold text-sm">${label}</span>
        <span class="ml-auto text-xs font-medium">${LEVEL_LABEL[area.level] || area.level}</span>
      </div>
      <div class="text-xs leading-relaxed">${escapeHtml(area.message)}</div>
    </div>`;
}

function renderDaily(daily) {
  if (!daily) return alertBox("warn", "운세 데이터를 불러올 수 없습니다.");

  const areas = daily.areas || {};
  return `
    <div class="space-y-4">
      <div class="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 text-white">
        <div class="text-4xl">${daily.todayGanzhi?.emoji || "🔮"}</div>
        <div>
          <div class="text-2xl font-bold">${escapeHtml(daily.date || "")}</div>
          <div class="text-sm opacity-80">오늘의 일진: <b>${escapeHtml(daily.todayGanzhi?.pillar || "")}</b> (${escapeHtml(daily.todayGanzhi?.element || "")} · ${escapeHtml(daily.todayGanzhi?.yinyang || "")})</div>
          <div class="text-xs opacity-60 mt-0.5">세운: ${escapeHtml(daily.yearGanzhi?.pillar || "")} ${daily.yearGanzhi?.emoji || ""}</div>
        </div>
      </div>

      ${daily.myDayStem ? `
      <div class="p-3 rounded-xl border bg-slate-50 text-sm text-slate-700">
        내 일간: <b>${escapeHtml(daily.myDayStem.stem)}</b> (${escapeHtml(daily.myDayStem.element)} ${daily.myDayStem.emoji || ""})
        &nbsp;→&nbsp; 오늘 일진과의 관계: <b>${escapeHtml(daily.relations?.stem || "")}</b>
      </div>` : ""}

      <div class="space-y-2">
        <div class="text-sm font-medium text-slate-700">종합 운세</div>
        ${luckBar(daily.score || 50)}
        <div class="p-3 rounded-xl border ${LEVEL_CLASS[daily.luckLevel] || LEVEL_CLASS.neutral} text-sm leading-relaxed">
          ${escapeHtml(daily.overall || "")}
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        ${renderAreaCard("연애운", "💕", areas.love || { level: "neutral", message: "" })}
        ${renderAreaCard("직업운", "💼", areas.work || { level: "neutral", message: "" })}
        ${renderAreaCard("재물운", "💰", areas.money || { level: "neutral", message: "" })}
        ${renderAreaCard("건강운", "🏃", areas.health || { level: "neutral", message: "" })}
      </div>
    </div>
  `;
}

function renderPushSection() {
  return `
    <div id="pushSection" class="space-y-2">
      <div class="text-sm text-slate-600">아침마다 오늘의 운세를 푸시 알림으로 받아보세요.</div>
      <div id="pushStatus" class="text-xs text-slate-500">푸시 알림 상태를 확인 중...</div>
      <div class="flex gap-2">
        <button id="subscribePushBtn" class="hidden btn-primary text-sm">🔔 알림 구독하기</button>
        <button id="unsubscribePushBtn" class="hidden px-4 py-2 rounded-xl border bg-white text-sm">🔕 알림 취소</button>
      </div>
      <div id="pushMsg" class="mt-1"></div>
    </div>
  `;
}

export function DailyFortunePage(state) {
  const user = getUser();
  const r = state.lastResult;
  const hasBirth = r?.saju;

  return `
    <div class="space-y-4">
      ${card("오늘의 운세", `
        ${!hasBirth ? `<div class="mb-3 text-sm text-slate-600">사주 정보를 입력하면 더 정밀한 운세를 확인할 수 있습니다. <a href="#/" class="underline">홈에서 계산하기</a></div>` : ""}
        <div id="dailyContent">${alertBox("info", "운세를 불러오는 중...")}</div>
      `)}

      ${user ? card("아침 운세 알림 설정 🔔", renderPushSection()) : `
        <div class="p-4 rounded-2xl border bg-amber-50 border-amber-200 text-amber-900 text-sm">
          <b>로그인</b>하면 매일 아침 오늘의 운세 푸시 알림을 받을 수 있습니다.
          <a href="#/login" class="ml-2 underline font-medium">로그인하기</a>
        </div>
      `}
    </div>
  `;
}

export async function DailyFortuneMount(state) {
  const r = state.lastResult;
  const contentEl = document.getElementById("dailyContent");
  const user = getUser();

  // Load daily fortune
  try {
    const input = r?.saju
      ? {
          year: state.form?.year,
          month: state.form?.month,
          day: state.form?.day,
          hour: state.form?.hour || 0,
          minute: state.form?.minute || 0,
          gender: state.form?.gender || "M",
          longitude: state.form?.longitude || 127,
          applyTimeCorrection: state.form?.applyTimeCorrection !== false,
        }
      : {};
    const data = await calcDaily(input);
    if (contentEl) contentEl.innerHTML = renderDaily(data.daily);
  } catch (err) {
    if (contentEl) contentEl.innerHTML = alertBox("error", `오류: ${err.message}`);
  }

  // Push notification setup
  if (!user) return;

  const statusEl = document.getElementById("pushStatus");
  const subBtn = document.getElementById("subscribePushBtn");
  const unsubBtn = document.getElementById("unsubscribePushBtn");
  const pushMsg = document.getElementById("pushMsg");

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    if (statusEl) statusEl.textContent = "이 브라우저는 푸시 알림을 지원하지 않습니다.";
    return;
  }

  async function updatePushUI() {
    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    if (existing) {
      if (statusEl) statusEl.textContent = "✅ 현재 알림 구독 중입니다.";
      if (subBtn) subBtn.classList.add("hidden");
      if (unsubBtn) unsubBtn.classList.remove("hidden");
    } else {
      if (statusEl) statusEl.textContent = "알림이 구독되지 않은 상태입니다.";
      if (subBtn) subBtn.classList.remove("hidden");
      if (unsubBtn) unsubBtn.classList.add("hidden");
    }
  }

  try {
    await navigator.serviceWorker.register("/sw.js");
    await updatePushUI();
  } catch (e) {
    if (statusEl) statusEl.textContent = `서비스 워커 오류: ${e.message}`;
    return;
  }

  subBtn?.addEventListener("click", async () => {
    try {
      const keyData = await getVapidPublicKey();
      if (!keyData.publicKey) throw new Error("VAPID 공개키가 설정되지 않았습니다. 서버 환경 변수를 확인하세요.");
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
      });
      await subscribePush(sub.toJSON());
      if (pushMsg) pushMsg.innerHTML = alertBox("ok", "✅ 알림 구독 완료! 매일 아침 8시에 오늘의 운세를 받아보실 수 있습니다.");
      await updatePushUI();
    } catch (err) {
      if (pushMsg) pushMsg.innerHTML = alertBox("error", `구독 실패: ${err.message}`);
    }
  });

  unsubBtn?.addEventListener("click", async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
      await unsubscribePush();
      if (pushMsg) pushMsg.innerHTML = alertBox("info", "알림 구독이 취소되었습니다.");
      await updatePushUI();
    } catch (err) {
      if (pushMsg) pushMsg.innerHTML = alertBox("error", `취소 실패: ${err.message}`);
    }
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
