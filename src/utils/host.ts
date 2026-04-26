const ADMIN_HOSTNAME = "console.animelog.top";

export function isAdminHost() {
  return (
    typeof window !== "undefined" && window.location.hostname === ADMIN_HOSTNAME
  );
}
