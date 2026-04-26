import { useState } from "react";
import { useStore } from "../store/atoms";
import { useNavigate } from "react-router";
import {
  Settings as SettingsIcon,
  LogOut,
  ChevronRight,
  Moon,
  ShieldAlert,
  Smartphone,
  Mail,
  AlertTriangle,
  MessageSquarePlus,
  LifeBuoy,
} from "lucide-react";
import { authApi } from "../api/auth";
import { ApiError } from "../api/client";

export default function Settings() {
  const user = useStore((state) => state.user);
  const darkMode = useStore((state) => state.darkMode);
  const setUser = useStore((state) => state.setUser);
  const toggleDarkMode = useStore((state) => state.toggleDarkMode);
  const updateProfileAsync = useStore((state) => state.updateProfileAsync);
  const changePasswordAsync = useStore((state) => state.changePasswordAsync);
  const submitFeedbackAsync = useStore((state) => state.submitFeedbackAsync);
  const applyNsfwAsync = useStore((state) => state.applyNsfwAsync);
  const navigate = useNavigate();

  const [reason, setReason] = useState("");
  const [bindModal, setBindModal] = useState<{
    isOpen: boolean;
    type: "email" | "phone";
  }>({ isOpen: false, type: "email" });
  const [inputValue, setInputValue] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [bindError, setBindError] = useState("");
  const [codeSending, setCodeSending] = useState(false);

  // Feedback State
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"bug" | "feature">("bug");
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Nickname State
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(user?.name ?? "");
  const [nicknameMsg, setNicknameMsg] = useState("");
  const [savingNickname, setSavingNickname] = useState(false);

  // Password State
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const handleApplyNsfw = async () => {
    if (!reason.trim()) {
      alert("请提供申请理由");
      return;
    }
    try {
      await applyNsfwAsync(reason);
      alert("申请已提交，请等待管理员审核。");
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "申请失败，请重试");
    }
  };

  const handleOpenBind = (type: "email" | "phone") => {
    setBindModal({ isOpen: true, type });
    setInputValue("");
    setVerifyCode("");
    setBindError("");
  };

  const handleUnbind = async (type: "email" | "phone") => {
    if (
      window.confirm(
        `确定要解绑${type === "email" ? "邮箱" : "手机号"}吗？解绑后将无法使用该方式登录。`,
      )
    ) {
      try {
        await updateProfileAsync({ [type]: "" });
      } catch (e) {
        alert(e instanceof ApiError ? e.message : "解绑失败");
      }
    }
  };

  const handleSendBindCode = async () => {
    if (!inputValue) {
      setBindError(`请输入${bindModal.type === "email" ? "邮箱" : "手机号"}`);
      return;
    }
    setCodeSending(true);
    try {
      if (bindModal.type === "email") {
        await authApi.sendEmailCode(inputValue, "bind");
      } else {
        await authApi.sendSmsCode(inputValue, "bind");
      }
      alert("验证码已发送");
    } catch (e) {
      setBindError(e instanceof ApiError ? e.message : "发送失败");
    } finally {
      setCodeSending(false);
    }
  };

  const handleConfirmBind = async () => {
    if (!inputValue || !verifyCode) {
      setBindError("请填写完整信息");
      return;
    }
    try {
      await updateProfileAsync({ [bindModal.type]: inputValue });
      setBindModal({ isOpen: false, type: "email" });
      alert("绑定成功！");
    } catch (e) {
      setBindError(e instanceof ApiError ? e.message : "绑定失败");
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      alert("请填写反馈内容");
      return;
    }
    setIsSubmittingFeedback(true);
    try {
      await submitFeedbackAsync(feedbackType, feedbackText);
      setIsFeedbackModalOpen(false);
      setFeedbackText("");
      alert("感谢您的反馈！我们会尽快处理。");
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "提交失败，请重试");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleSaveNickname = async () => {
    if (!nicknameInput.trim()) {
      setNicknameMsg("昵称不能为空");
      return;
    }
    setSavingNickname(true);
    setNicknameMsg("");
    try {
      await updateProfileAsync({ nickname: nicknameInput.trim() });
      setEditingNickname(false);
    } catch (e) {
      setNicknameMsg(e instanceof ApiError ? e.message : "保存失败");
    } finally {
      setSavingNickname(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordMsg("请填写所有密码字段");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg("新密码长度不能少于 6 位");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg("两次输入的新密码不一致");
      return;
    }
    setSavingPassword(true);
    setPasswordMsg("");
    try {
      await changePasswordAsync(oldPassword, newPassword);
      setShowPasswordChange(false);
    } catch (e) {
      setPasswordMsg(e instanceof ApiError ? e.message : "修改失败");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-in fade-in duration-500 pb-24 md:pb-8">
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className="w-8 h-8 text-rose-500" />
        <h1 className="text-3xl font-extrabold text-slate-900">设置</h1>
      </div>

      <div className="space-y-6">
        {/* Account Section */}
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-800 text-sm tracking-wider uppercase">
              账号设置
            </h2>
          </div>
          <div className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100">
            <div className="flex items-center gap-4">
              <img
                src={user.avatar}
                className="w-12 h-12 rounded-full border border-slate-200"
                alt="Avatar"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="font-bold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">
                  用户名: {user.username}
                </p>
              </div>
            </div>
          </div>

          {/* Nickname Edit */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700 font-medium">昵称</span>
              {!editingNickname ? (
                <button
                  onClick={() => {
                    setNicknameInput(user.name);
                    setNicknameMsg("");
                    setEditingNickname(true);
                  }}
                  className="text-xs text-indigo-500 font-medium hover:underline"
                >
                  编辑
                </button>
              ) : null}
            </div>
            {editingNickname && (
              <div className="mt-3 space-y-2">
                <input
                  type="text"
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors bg-slate-50"
                />
                {nicknameMsg && (
                  <p className={`text-xs ${nicknameMsg.includes("失败") ? "text-red-500" : "text-emerald-500"}`}>
                    {nicknameMsg}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNickname}
                    disabled={savingNickname}
                    className="text-xs bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg font-medium transition"
                  >
                    {savingNickname ? "保存中..." : "保存"}
                  </button>
                  <button
                    onClick={() => setEditingNickname(false)}
                    className="text-xs border border-slate-200 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-50 font-medium transition"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3 text-slate-700 font-medium">
              <Mail className="w-5 h-5" />
              <div>
                <span className="text-sm">绑定邮箱</span>
                {user.email && (
                  <div className="text-xs text-slate-500 font-normal">
                    {user.email}
                  </div>
                )}
              </div>
            </div>
            {user.email ? (
              <button
                onClick={() => handleUnbind("email")}
                className="text-xs border border-slate-200 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-50 font-medium transition"
              >
                解绑
              </button>
            ) : (
              <button
                onClick={() => handleOpenBind("email")}
                className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg font-medium transition"
              >
                去绑定
              </button>
            )}
          </div>

          <div className="p-4 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3 text-slate-700 font-medium">
              <Smartphone className="w-5 h-5" />
              <div>
                <span className="text-sm">绑定手机</span>
                {user.phone && (
                  <div className="text-xs text-slate-500 font-normal">
                    {user.phone}
                  </div>
                )}
              </div>
            </div>
            {user.phone ? (
              <button
                onClick={() => handleUnbind("phone")}
                className="text-xs border border-slate-200 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-50 font-medium transition"
              >
                解绑
              </button>
            ) : (
              <button
                onClick={() => handleOpenBind("phone")}
                className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg font-medium transition"
              >
                去绑定
              </button>
            )}
          </div>

          {/* Password Change */}
          <div className="p-4 border-b border-slate-100">
            {!showPasswordChange ? (
              <button
                onClick={() => {
                  setOldPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordMsg("");
                  setShowPasswordChange(true);
                }}
                className="text-indigo-500 font-medium text-sm hover:underline"
              >
                修改密码
              </button>
            ) : (
              <div className="space-y-3">
                <div>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="当前密码"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors bg-slate-50"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="新密码（至少 6 位）"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors bg-slate-50"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="确认新密码"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors bg-slate-50"
                  />
                </div>
                {passwordMsg && (
                  <p className={`text-xs ${passwordMsg.includes("失败") || passwordMsg.includes("不一致") || passwordMsg.includes("不能") ? "text-red-500" : "text-emerald-500"}`}>
                    {passwordMsg}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleChangePassword}
                    disabled={savingPassword}
                    className="text-xs bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg font-medium transition"
                  >
                    {savingPassword ? "修改中..." : "确认修改"}
                  </button>
                  <button
                    onClick={() => setShowPasswordChange(false)}
                    className="text-xs border border-slate-200 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-50 font-medium transition"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>

          <div
            className="p-4 flex items-center justify-between hover:bg-rose-50 cursor-pointer transition-colors"
            onClick={handleLogout}
          >
            <div className="flex items-center gap-3 text-rose-500 font-medium">
              <LogOut className="w-5 h-5" />
              退出登录
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-800 text-sm tracking-wider uppercase">
              偏好设置
            </h2>
          </div>
          <div
            className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100"
            onClick={toggleDarkMode}
          >
            <div className="flex items-center gap-3 text-slate-700 font-medium">
              <Moon className="w-5 h-5" />
              深色模式
            </div>
            <div
              className={`w-11 h-6 rounded-full relative transition-colors ${
                darkMode ? "bg-indigo-500" : "bg-slate-200"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${
                  darkMode ? "translate-x-5" : "left-0.5"
                }`}
              ></div>
            </div>
          </div>
        </section>

        {/* Support & Feedback */}
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-800 text-sm tracking-wider uppercase">
              支持与反馈
            </h2>
          </div>
          <div
            className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
            onClick={() => setIsFeedbackModalOpen(true)}
          >
            <div className="flex items-center gap-3 text-slate-700 font-medium">
              <LifeBuoy className="w-5 h-5" />
              问题反馈与功能建议
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>
        </section>

        {/* Hidden World Application */}
        <section className="bg-white rounded-2xl border border-rose-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-rose-100 bg-rose-50">
            <h2 className="font-bold text-rose-600 text-sm tracking-wider uppercase border-rose-200">
              高级功能
            </h2>
          </div>
          <div className="p-4">
            <div className="flex items-start gap-3 mb-4">
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-900">里世界访问权限</h3>
                <p className="text-xs text-slate-500 mt-1">
                  申请访问成人内容区域。申请后需管理员审核通过方可进入。
                </p>
              </div>
            </div>

            {user.nsfwStatus === "none" && (
              <div className="space-y-3 mt-4">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="请输入申请理由..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none resize-none h-20"
                />
                <button
                  onClick={handleApplyNsfw}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition-colors"
                >
                  提交申请
                </button>
              </div>
            )}
            {user.nsfwStatus === "pending" && (
              <div className="w-full bg-amber-50 text-amber-600 font-bold py-2.5 rounded-xl text-center border border-amber-200">
                审核中...
              </div>
            )}
            {user.nsfwStatus === "approved" && (
              <div className="w-full bg-emerald-50 text-emerald-600 font-bold py-2.5 rounded-xl text-center border border-emerald-200">
                已获得里世界权限
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Bind Modal */}
      {bindModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              绑定{bindModal.type === "email" ? "邮箱" : "手机号"}
            </h3>

            {bindError && (
              <div className="bg-red-50 text-red-500 text-sm px-3 py-2 rounded-lg mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {bindError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder={`请输入您的${bindModal.type === "email" ? "邮箱" : "手机号"}`}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 transition-colors bg-slate-50"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="验证码"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 transition-colors bg-slate-50"
                />
                <button
                  onClick={handleSendBindCode}
                  disabled={codeSending}
                  className="whitespace-nowrap px-3 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 disabled:opacity-50 transition-colors"
                >
                  {codeSending ? "发送中..." : "获取验证码"}
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setBindModal({ isOpen: false, type: "email" })}
                className="flex-1 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmBind}
                className="flex-1 py-2.5 rounded-xl font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-colors"
              >
                确认绑定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-indigo-500" />
              提交反馈
            </h3>

            <div className="space-y-4">
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                <button
                  onClick={() => setFeedbackType("bug")}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${feedbackType === "bug" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                >
                  运行Bug发现
                </button>
                <button
                  onClick={() => setFeedbackType("feature")}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${feedbackType === "feature" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                >
                  新功能建议
                </button>
              </div>

              <div>
                <textarea
                  placeholder={
                    feedbackType === "bug"
                      ? "请描述您遇到的问题、复现步骤或报错信息..."
                      : "请描述您希望增加的功能或改进建议..."
                  }
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-indigo-500 transition-colors bg-slate-50 resize-none h-32"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsFeedbackModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={isSubmittingFeedback}
                className="flex-1 py-2.5 rounded-xl font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmittingFeedback ? "提交中..." : "发送反馈"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
