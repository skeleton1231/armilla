#!/usr/bin/env bash
# 确定性重启生产服务器:杀掉全部 next 实例 → 等端口真正空闲 → 再启动。
# 用法:bash scripts/restart-prod.sh [port]
set -euo pipefail
PORT="${1:-3210}"

echo "[restart-prod] killing next processes..."
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { \$_.CommandLine -match 'next' } | ForEach-Object { Stop-Process -Id \$_.ProcessId -Force -Confirm:\$false }" >/dev/null 2>&1 || true

for i in $(seq 1 20); do
  if powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort $PORT -State Listen -ErrorAction SilentlyContinue) { exit 1 } else { exit 0 }" 2>/dev/null; then
    echo "[restart-prod] port $PORT free (after ${i} checks)"
    break
  fi
  sleep 0.5
done

echo "[restart-prod] starting next start -p $PORT ..."
cd "$(dirname "$0")/.."
exec npx next start -p "$PORT"
