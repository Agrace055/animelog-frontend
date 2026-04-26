import { useState } from "react";
import type React from "react";
import { useNavigate, Link } from "react-router";
import { useStore } from "../store/atoms";
import { authApi } from "../api/auth";
import { ApiError } from "../api/client";

export default function Register() {
  const navigate = useNavigate();
  const registerAsync = useStore((state) => state.registerAsync);

  const [registerType, setRegisterType] = useState<"email" | "phone">("email");

  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [codeSending, setCodeSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  const handleSendCode = async () => {
    setErrorMsg("");
    if (!emailOrPhone) {
      setErrorMsg(`请输入${registerType === "email" ? "邮箱" : "手机号"}`);
      return;
    }
    if (registerType === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone)) {
        setErrorMsg("邮箱格式不正确");
        return;
      }
    } else {
      if (!/^1\d{10}$/.test(emailOrPhone)) {
        setErrorMsg("手机号格式不正确 (仅支持中国大陆手机号)");
        return;
      }
    }

    setCodeSending(true);
    try {
      if (registerType === "email") {
        await authApi.sendEmailCode(emailOrPhone, "register");
      } else {
        await authApi.sendSmsCode(emailOrPhone, "register");
      }
      setCodeSent(true);
      alert("验证码已发送！");
    } catch (e) {
      setErrorMsg(e instanceof ApiError ? e.message : "验证码发送失败，请重试");
    } finally {
      setCodeSending(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!username || !nickname || !password || !emailOrPhone || !verifyCode) {
      setErrorMsg("请填写完整所有注册信息");
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      setErrorMsg("用户名只能包含字母和数字");
      return;
    }

    setSubmitting(true);
    try {
      await registerAsync({
        username,
        nickname,
        password,
        email: registerType === "email" ? emailOrPhone : undefined,
        phone: registerType === "phone" ? emailOrPhone : undefined,
        code: verifyCode,
      });
      alert("注册成功，请登录！");
      navigate("/login");
    } catch (e) {
      setErrorMsg(e instanceof ApiError ? e.message : "注册失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 animate-in fade-in zoom-in-95 duration-300">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 opacity-20"></div>

        <div className="relative z-10 w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              注册新账号
            </h1>
          </div>

          {/* Registration Type Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => {
                setRegisterType("email");
                setEmailOrPhone("");
                setCodeSent(false);
                setErrorMsg("");
              }}
              className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors ${registerType === "email" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}
            >
              邮箱验证
            </button>
            <button
              onClick={() => {
                setRegisterType("phone");
                setEmailOrPhone("");
                setCodeSent(false);
                setErrorMsg("");
              }}
              className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors ${registerType === "phone" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}
            >
              手机验证
            </button>
          </div>

          {errorMsg && (
            <div className="w-full bg-red-50 text-red-500 text-sm py-2 px-3 rounded-lg mb-4 text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Username & Nickname */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">
                用户名 (唯一，不可重复)
              </label>
              <input
                type="text"
                placeholder="由字母或数字组成"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">
                昵称 (对外显示的名号)
              </label>
              <input
                type="text"
                placeholder="你的昵称"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>

            {/* Email or Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">
                {registerType === "email" ? "邮箱地址" : "手机号码"}
              </label>
              <input
                type="text"
                placeholder={
                  registerType === "email" ? "demo@example.com" : "13800138000"
                }
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>

            {/* Verification Code */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="验证码"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={codeSent || codeSending}
                className="whitespace-nowrap px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold text-sm rounded-xl transition-colors disabled:opacity-50"
              >
                {codeSending ? "发送中..." : codeSent ? "已发送" : "获取验证码"}
              </button>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">
                登录密码
              </label>
              <input
                type="password"
                placeholder="设置你的密码..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-bold py-3 mt-6 rounded-xl shadow-lg shadow-indigo-200 transition-transform active:scale-95"
            >
              {submitting ? "注册中..." : "注 册"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            已有账号？{" "}
            <Link
              to="/login"
              className="text-indigo-500 font-semibold hover:underline"
            >
              去登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
