import { card, alertBox } from "../ui/components.js";
import { apiLogin, apiRegister, setToken, setUser } from "../api.js";

export function LoginPage() {
  return `
    <div class="max-w-md mx-auto space-y-4">
      ${card("로그인", `
        <form id="loginForm" class="space-y-3">
          <div>
            <label class="text-xs text-slate-600">이메일</label>
            <input name="email" type="email" class="w-full px-3 py-2 rounded-xl border bg-white" placeholder="test1@test.com" required />
          </div>
          <div>
            <label class="text-xs text-slate-600">비밀번호</label>
            <input name="password" type="password" class="w-full px-3 py-2 rounded-xl border bg-white" placeholder="123456" required />
          </div>
          <button type="submit" class="btn-primary w-full">로그인</button>
        </form>
        <div id="loginMsg" class="mt-3"></div>
        <div class="mt-4 text-sm text-slate-600 text-center">
          계정이 없으신가요? <a href="#/register" class="underline text-slate-900">회원가입</a>
        </div>
        <div class="mt-3 p-3 rounded-xl bg-slate-50 border text-xs text-slate-500">
          <div class="font-medium mb-1">테스트 계정</div>
          <div>test1@test.com / 123456</div>
          <div>test2@test.com / 123456</div>
        </div>
      `)}
    </div>
  `;
}

export function LoginMount() {
  const form = document.getElementById("loginForm");
  const msg = document.getElementById("loginMsg");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const email = fd.get("email");
    const password = fd.get("password");
    if (msg) msg.innerHTML = alertBox("info", "로그인 중...");
    try {
      const data = await apiLogin(email, password);
      setToken(data.token);
      setUser(data.user);
      location.hash = "#/";
      location.reload();
    } catch (err) {
      if (msg) msg.innerHTML = alertBox("error", `오류: ${err.message}`);
    }
  });
}
