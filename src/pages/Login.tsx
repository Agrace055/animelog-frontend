import { useState } from "react";
import type React from "react";
import { useNavigate, Link } from "react-router";
import { useStore } from "../store/atoms";
import { authApi } from "../api/auth";
import { ApiError } from "../api/client";

type LoginTab = "password" | "code";

export default function Login() {
  const loginAsync = useStore((state) => state.loginAsync);
  const loginWithCodeAsync = useStore((state) => state.loginWithCodeAsync);
  const navigate = useNavigate();

  const [tab, setTab] = useState<LoginTab>("password");

  // Password login
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Code login
  const [codeIdentifier, setCodeIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  // Forgot password modal
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<"verify" | "reset">("verify");
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSending, setForgotSending] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

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

  const handleCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError("");

    if (!codeIdentifier || !code) {
      setCodeError("请输入账号和验证码");
      return;
    }

    setCodeLoading(true);
    try {
      await loginWithCodeAsync(codeIdentifier, code);
      navigate("/");
    } catch (e) {
      setCodeError(e instanceof ApiError ? e.message : "登录失败，请重试");
    } finally {
      setCodeLoading(false);
    }
  };

  const handleSendCode = async () => {
    if (!codeIdentifier) {
      setCodeError("请先输入手机号或邮箱");
      return;
    }
    setSendingCode(true);
    setCodeError("");
    try {
      if (codeIdentifier.includes("@")) {
        await authApi.sendEmailCode(codeIdentifier, "login");
      } else {
        await authApi.sendSmsCode(codeIdentifier, "login");
      }
      setCodeError("验证码已发送");
    } catch (e) {
      setCodeError(e instanceof ApiError ? e.message : "发送失败");
    } finally {
      setSendingCode(false);
    }
  };

  const openForgotModal = () => {
    setForgotStep("verify");
    setForgotIdentifier("");
    setForgotCode("");
    setForgotPassword("");
    setForgotError("");
    setShowForgot(true);
  };

  const handleForgotSendCode = async () => {
    if (!forgotIdentifier) {
      setForgotError("请先输入手机号或邮箱");
      return;
    }
    setForgotSending(true);
    setForgotError("");
    try {
      if (forgotIdentifier.includes("@")) {
        await authApi.sendEmailCode(forgotIdentifier, "reset");
      } else {
        await authApi.sendSmsCode(forgotIdentifier, "reset");
      }
      setForgotError("验证码已发送");
    } catch (e) {
      setForgotError(e instanceof ApiError ? e.message : "发送失败");
    } finally {
      setForgotSending(false);
    }
  };

  const handleForgotVerify = async () => {
    if (!forgotIdentifier || !forgotCode) {
      setForgotError("请填写完整信息");
      return;
    }
    setForgotStep("reset");
    setForgotError("");
  };

  const handleForgotReset = async () => {
    if (!forgotPassword || forgotPassword.length < 6) {
      setForgotError("新密码长度不能少于 6 位");
      return;
    }
    setForgotLoading(true);
    setForgotError("");
    try {
      await authApi.resetPassword(forgotIdentifier, forgotCode, forgotPassword);
      setShowForgot(false);
      alert("密码已重置，请使用新密码登录。");
    } catch (e) {
      setForgotError(e instanceof ApiError ? e.message : "重置失败");
    } finally {
      setForgotLoading(false);
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
          <p className="text-slate-500 font-medium mb-6">记录你的二次元生活</p>

          {/* Tabs */}
          <div className="w-full flex gap-1 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              onClick={() => {
                setTab("password");
                setErrorMsg("");
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                tab === "password"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              密码登录
            </button>
            <button
              onClick={() => {
                setTab("code");
                setCodeError("");
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                tab === "code"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              验证码登录
            </button>
          </div>

          {/* Password Login Form */}
          {tab === "password" && (
            <>
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

              <div className="w-full mt-3 text-right">
                <button
                  onClick={openForgotModal}
                  className="text-sm text-slate-400 hover:text-rose-500 transition-colors"
                >
                  忘记密码？
                </button>
              </div>
            </>
          )}

          {/* Code Login Form */}
          {tab === "code" && (
            <>
              {codeError && (
                <div
                  className={`w-full text-sm py-2 rounded-lg mb-4 ${
                    codeError === "验证码已发送"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-500"
                  }`}
                >
                  {codeError}
                </div>
              )}

              <form onSubmit={handleCodeLogin} className="w-full space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="手机号 / 邮箱"
                    value={codeIdentifier}
                    onChange={(e) => setCodeIdentifier(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="验证码"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={sendingCode}
                    className="whitespace-nowrap px-4 text-sm font-semibold bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 disabled:opacity-50 transition-colors"
                  >
                    {sendingCode ? "发送中..." : "获取验证码"}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={codeLoading}
                  className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-bold py-3 mt-4 rounded-xl shadow-lg shadow-rose-200 transition-transform active:scale-95"
                >
                  {codeLoading ? "登录中..." : "登 录"}
                </button>
              </form>
            </>
          )}

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

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {forgotStep === "verify" ? "找回密码" : "设置新密码"}
            </h3>

            {forgotError && (
              <div
                className={`text-sm px-3 py-2 rounded-lg mb-4 flex items-center gap-2 ${
                  forgotError === "验证码已发送"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {forgotError}
              </div>
            )}

            {forgotStep === "verify" ? (
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="手机号 / 邮箱"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 transition-colors bg-slate-50"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="验证码"
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 transition-colors bg-slate-50"
                  />
                  <button
                    onClick={handleForgotSendCode}
                    disabled={forgotSending}
                    className="whitespace-nowrap px-3 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 disabled:opacity-50 transition-colors"
                  >
                    {forgotSending ? "发送中..." : "获取验证码"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <input
                    type="password"
                    placeholder="新密码（至少 6 位）"
                    value={forgotPassword}
                    onChange={(e) => setForgotPassword(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 transition-colors bg-slate-50"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForgot(false)}
                className="flex-1 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={
                  forgotStep === "verify" ? handleForgotVerify : handleForgotReset
                }
                disabled={forgotLoading}
                className="flex-1 py-2.5 rounded-xl font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-colors disabled:opacity-70"
              >
                {forgotLoading
                  ? "重置中..."
                  : forgotStep === "verify"
                    ? "下一步"
                    : "重置密码"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
