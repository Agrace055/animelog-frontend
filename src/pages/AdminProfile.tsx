import { useState } from "react";
import { useNavigate } from "react-router";
import { useStore } from "../store/atoms";
import { ApiError } from "../api/client";
import { User, Lock, ArrowLeft } from "lucide-react";

export default function AdminProfile() {
  const user = useStore((state) => state.user);
  const updateProfileAsync = useStore((state) => state.updateProfileAsync);
  const changePasswordAsync = useStore((state) => state.changePasswordAsync);
  const navigate = useNavigate();

  const [nickname, setNickname] = useState(user?.name ?? "");
  const [nicknameMsg, setNicknameMsg] = useState("");
  const [savingNickname, setSavingNickname] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  if (!user || user.role !== "admin") {
    navigate("/login");
    return null;
  }

  const handleSaveNickname = async () => {
    if (!nickname.trim()) {
      setNicknameMsg("昵称不能为空");
      return;
    }
    setSavingNickname(true);
    setNicknameMsg("");
    try {
      await updateProfileAsync({ nickname: nickname.trim() });
      setNicknameMsg("昵称已更新");
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
      setPasswordMsg("密码已更新");
    } catch (e) {
      setPasswordMsg(e instanceof ApiError ? e.message : "修改失败");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-300">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">返回仪表盘</span>
      </button>

      <h1 className="text-2xl font-bold text-white mb-8">个人中心</h1>

      <div className="space-y-6">
        {/* Nickname Section */}
        <section className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <User className="w-4 h-4" />
              编辑昵称
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full border border-slate-600"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-xs text-slate-400">@{user.username}</p>
              </div>
            </div>
            <div>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="输入新昵称"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            {nicknameMsg && (
              <p
                className={`text-xs ${
                  nicknameMsg.includes("失败")
                    ? "text-red-400"
                    : "text-emerald-400"
                }`}
              >
                {nicknameMsg}
              </p>
            )}
            <button
              onClick={handleSaveNickname}
              disabled={savingNickname}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors"
            >
              {savingNickname ? "保存中..." : "保存昵称"}
            </button>
          </div>
        </section>

        {/* Password Section */}
        <section className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Lock className="w-4 h-4" />
              修改密码
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="当前密码"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="新密码（至少 6 位）"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="确认新密码"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            {passwordMsg && (
              <p
                className={`text-xs ${
                  passwordMsg.includes("失败") || passwordMsg.includes("不一致") || passwordMsg.includes("不能")
                    ? "text-red-400"
                    : "text-emerald-400"
                }`}
              >
                {passwordMsg}
              </p>
            )}
            <button
              onClick={handleChangePassword}
              disabled={savingPassword}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors"
            >
              {savingPassword ? "修改中..." : "修改密码"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
