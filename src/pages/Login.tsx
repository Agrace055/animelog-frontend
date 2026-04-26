import { useState } from "react";
import type React from "react";
import { useNavigate, Link } from "react-router";
import { useStore } from "../store/atoms";
import { ApiError } from "../api/client";

export default function Login() {
  const loginAsync = useStore((state) => state.loginAsync);
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!identifier || !password) {
      setErrorMsg("请输入账号和密码");
      return;
    }

    setLoading(true);
    try {
      await loginAsync(identifier, password);
      navigate("/");
    } catch (e) {
      setErrorMsg(e instanceof ApiError ? e.message : "登录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-in fade-in zoom-in-95 duration-300">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 opacity-20"></div>

        <div className="relative z-10 w-full flex flex-col items-center">
          <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-black text-2xl">A</span>
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-indigo-600 mb-2">
            AnimeLog
          </h1>
          <p className="text-slate-500 font-medium mb-8">记录你的二次元生活</p>

          {errorMsg && (
            <div className="w-full bg-red-50 text-red-500 text-sm py-2 rounded-lg mb-4">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div>
              <input
                type="text"
                placeholder="用户名 / 邮箱 / 手机号"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-slate-400"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="登录密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-bold py-3 mt-4 rounded-xl shadow-lg shadow-rose-200 transition-transform active:scale-95"
            >
              {loading ? "登录中..." : "登 录"}
            </button>
          </form>

          <div className="mt-6 text-sm text-slate-500">
            还没有账号？{" "}
            <Link
              to="/register"
              className="text-rose-500 font-semibold hover:underline"
            >
              立即注册
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
