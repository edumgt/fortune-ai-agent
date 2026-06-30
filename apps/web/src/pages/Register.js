import { card, alertBox } from "../ui/components.js";
import { apiRegister, setToken, setUser } from "../api.js";

export function RegisterPage() {
  return `
    <div class="max-w-md mx-auto space-y-4">
      ${card("회원가입", `
        <form id="registerForm" class="space-y-3">
          <div>
            <label class="text-xs text-slate-600">이름(닉네임)</label>
            <input name="name" type="text" class="w-full px-3 py-2 rounded-xl border bg-white" placeholder="홍길동" />
          </div>
          <div>
            <label class="text-xs text-slate-600">이메일</label>
            <input name="email" type="email" class="w-full px-3 py-2 rounded-xl border bg-white" placeholder="your@email.com" required />
          </div>
          <div>
            <label class="text-xs text-slate-600">비밀번호 (6자 이상)</label>
            <input name="password" type="password" class="w-full px-3 py-2 rounded-xl border bg-white" placeholder="••••••" required minlength="6" />
          </div>
          <div>
            <label class="text-xs text-slate-600">비밀번호 확인</label>
            <input name="password2" type="password" class="w-full px-3 py-2 rounded-xl border bg-white" placeholder="••••••" required minlength="6" />
          </div>
          <button type="submit" class="btn-primary w-full">가입하기</button>
        </form>
        <div id="registerMsg" class="mt-3"></div>
        <div class="mt-4 text-sm text-slate-600 text-center">
          이미 계정이 있으신가요? <a href="#/login" class="underline text-slate-900">로그인</a>
        </div>
      `)}
    </div>
  `;
}

export function RegisterMount() {
  const form = document.getElementById("registerForm");
  const msg = document.getElementById("registerMsg");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const email = fd.get("email");
    const password = fd.get("password");
    const password2 = fd.get("password2");
    const name = fd.get("name");

    if (password !== password2) {
      if (msg) msg.innerHTML = alertBox("error", "비밀번호가 일치하지 않습니다.");
      return;
    }
    if (msg) msg.innerHTML = alertBox("info", "가입 중...");
    try {
      const data = await apiRegister(email, password, name);
      setToken(data.token);
      setUser(data.user);
      location.hash = "#/";
      location.reload();
    } catch (err) {
      if (msg) msg.innerHTML = alertBox("error", `오류: ${err.message}`);
    }
  });
}
