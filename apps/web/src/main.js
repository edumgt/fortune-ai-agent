import "../styles/tailwind.css";

import { initOffcanvas, initRightOffcanvas } from "./ui/offcanvas.js";
import { onRouteChange, getRoute } from "./router.js";

import { HomePage, HomeMount } from "./pages/Home.js";
import { SajuResultPage, SajuResultMount } from "./pages/SajuResult.js";
import { DaeunPage, DaeunMount } from "./pages/Daeun.js";
import { GunghapPage, GunghapMount } from "./pages/Gunghap.js";
import { DailyFortunePage, DailyFortuneMount } from "./pages/DailyFortune.js";
import { LoginPage, LoginMount } from "./pages/Login.js";
import { RegisterPage, RegisterMount } from "./pages/Register.js";
import { BiorhythmPage, BiorhythmMount } from "./pages/Biorhythm.js";
import { MbtiPage, MbtiMount } from "./pages/Mbti.js";
import { InvestmentPage, InvestmentMount } from "./pages/Investment.js";
import { LottoPage, LottoMount } from "./pages/Lotto.js";
import { StockTimingPage, StockTimingMount } from "./pages/StockTiming.js";
import { API_BASE, getUser, logout, setApiBase } from "./api.js";

const state = { form: null, lastResult: null };

function renderUserBadge() {
  const user = getUser();
  const el = document.getElementById("userBadge");
  if (!el) return;
  if (user) {
    el.innerHTML = `
      <div class="flex items-center justify-between gap-2 px-3 py-3 text-sm">
        <span class="font-medium truncate max-w-[160px]">${user.name || user.email}</span>
        <button id="logoutBtn" class="text-xs text-slate-500 underline">로그아웃</button>
      </div>`;
    document.getElementById("logoutBtn")?.addEventListener("click", logout);
  } else {
    el.innerHTML = `
      <div class="flex gap-2 px-3 py-3 text-sm">
        <a href="#/login" class="underline text-indigo-700">로그인</a>
        <span class="text-slate-300">|</span>
        <a href="#/register" class="underline text-indigo-700">회원가입</a>
      </div>`;
  }
}

function initAccountPanel() {
  const input = document.getElementById("apiBaseInput");
  const saveBtn = document.getElementById("saveApiBaseBtn");
  if (input) input.value = API_BASE;
  saveBtn?.addEventListener("click", () => {
    const v = input?.value?.trim();
    if (v) setApiBase(v);
  });
}

function render() {
  const app = document.getElementById("app");
  const path = getRoute();

  const routes = {
    "/": { view: () => HomePage(state), mount: () => HomeMount(state) },
    "/result": { view: () => SajuResultPage(state), mount: () => SajuResultMount(state) },
    "/daeun": { view: () => DaeunPage(state), mount: () => DaeunMount(state) },
    "/gunghap": { view: () => GunghapPage(state), mount: () => GunghapMount(state) },
    "/daily": { view: () => DailyFortunePage(state), mount: () => DailyFortuneMount(state) },
    "/login": { view: () => LoginPage(), mount: () => LoginMount() },
    "/register": { view: () => RegisterPage(), mount: () => RegisterMount() },
    "/biorhythm": { view: () => BiorhythmPage(state), mount: () => BiorhythmMount(state) },
    "/mbti": { view: () => MbtiPage(state), mount: () => MbtiMount(state) },
    "/investment": { view: () => InvestmentPage(state), mount: () => InvestmentMount(state) },
    "/lotto": { view: () => LottoPage(state), mount: () => LottoMount(state) },
    "/stock-timing": { view: () => StockTimingPage(state), mount: () => StockTimingMount(state) },
  };

  const route = routes[path] || routes["/"];
  app.innerHTML = route.view();
  route.mount();

  const label = document.getElementById("apiBaseLabel");
  if (label) label.textContent = API_BASE;
  const labelTop = document.getElementById("apiBaseLabelTop");
  if (labelTop) labelTop.textContent = API_BASE;

  renderUserBadge();

  document.querySelectorAll("a.nav-link").forEach((a) => {
    const isActive = a.getAttribute("href") === `#${path}` || (path === "/" && a.getAttribute("href") === "#/");
    a.className = `nav-link ${isActive ? "copilot-nav-link-active" : "copilot-nav-link"}`;
  });
}

initOffcanvas();
initRightOffcanvas();
initAccountPanel();
onRouteChange(render);
