#!/usr/bin/env bash
# ============================================================
# 真和盛 zhenhesheng.cn 静态站 — 一键部署 & 自动版本号递增
# 用法: ./scripts/deploy.sh [commit message]
# ============================================================
set -e

cd "$(dirname "$0")/.."

# ---------- 1. 自动递增语义化版本号 ----------
LATEST_TAG=$(git describe --tags --abbrev=0 HEAD 2>/dev/null || echo "v0.0.0")
VERSION=${LATEST_TAG#v}  # strip leading 'v'

IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION"
PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$PATCH"
NEW_TAG="v${NEW_VERSION}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " 🔄 真和盛官网部署 | ${NEW_TAG}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ---------- 2. Git commit & push ----------
MESSAGE="${*:-Auto deploy v${NEW_VERSION}}"
git add -A
git commit -m "[${NEW_TAG}] ${MESSAGE}"

# 远程可能已被其他流程推送过: 先 fetch + rebase 再 push, 避免 "fetch first" 直接中断整条部署链
# (2026-11-05 踩过: 远程多出 LICENSE 提交 -> push 被拒 -> set -e 中断, 后面 CloudBase 上传那步根本没跑)
git fetch origin main
if ! git rebase origin/main; then
    echo "❌ rebase 到 origin/main 失败, 请手动解决冲突后重新执行"
    exit 1
fi

# tag 必须在 rebase 之后打, 否则会指向 rebase 前的旧 commit
git tag -a "${NEW_TAG}" HEAD -m "Website ${NEW_TAG}: ${MESSAGE}"
git push origin main
git push origin "${NEW_TAG}"

echo "✅ Git committed & pushed (${MESSAGE})"

# ---------- 3. Upload to CloudBase (本地 mcporter 优先, 缺失自动降级 npx) ----------
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ZHS_DIR="$(dirname "$SCRIPT_DIR")"
# 站点目录是 zhs-website/zhenhesheng.cn, zhs-deploy 在其上两级
DEPLOY_DIR="${ZHS_DIR}/../../zhs-deploy"

# 上传参数: 只传站点根, 忽略 zhs/(旧资源)、.git、.DS_Store、scripts/ —— 绝不碰 /h5/
UPLOAD_ARGS="{\"localPath\":\"${ZHS_DIR}\",\"cloudPath\":\"/\",\"ignore\":[\"zhs/**\",\".git/**\",\".DS_Store\",\"scripts/**\"]}"

# 本地 mcporter 候选路径: 2026-11-05 起多路径探测, 全都不存在才降级 npx
# (原脚本写死 .mcp/cloudbase-mcp/node_modules/mcporter/cli.cjs, 该文件在本机已不存在 -> 整站上传被静默跳过)
MCP_CLI=""
for c in \
    "${DEPLOY_DIR}/.mcp/cloudbase-mcp/node_modules/mcporter/cli.cjs" \
    "${DEPLOY_DIR}/.mcp/cloudbase-mcp/node_modules/mcporter/dist/cli.cjs" \
    "${DEPLOY_DIR}/node_modules/mcporter/cli.cjs" \
    "${DEPLOY_DIR}/node_modules/mcporter/dist/cli.cjs"; do
    if [[ -f "$c" ]]; then MCP_CLI="$c"; break; fi
done

NODE_BIN=""
for n in \
    "/Users/wenhua/.workbuddy/binaries/node/versions/22.22.2/bin/node" \
    "$(command -v node 2>/dev/null || true)"; do
    if [[ -n "$n" && -x "$n" ]]; then NODE_BIN="$n"; break; fi
done

cd "$DEPLOY_DIR"

# 上传执行函数: 抽成函数, 便于失败后重试一次
run_upload() {
    if [[ -n "$MCP_CLI" && -n "$NODE_BIN" ]]; then
        "$NODE_BIN" "$MCP_CLI" call cloudbase.manageHosting action=upload --args "$UPLOAD_ARGS" 2>&1 || true
    else
        npx -y mcporter call cloudbase.manageHosting action=upload --args "$UPLOAD_ARGS" 2>&1 || true
    fi
}

if [[ -n "$MCP_CLI" && -n "$NODE_BIN" ]]; then
    echo "📦 Uploading to CloudBase (local mcporter: ${MCP_CLI})..."
else
    echo "📦 Uploading to CloudBase (local mcporter 缺失, 使用 npx 兜底)..."
fi

UPLOAD_OUT="$(run_upload)"

# ---------- 3.1 自愈: 连接层故障自动 restart daemon 后重试一次 ----------
# 2026-11-05 两次踩到 ECONNREFUSED / connect failed: Connection refused,
# 根因都是代理端口轮换或 daemon 假死, daemon restart 后即可恢复 -> 这里做一次自愈, 免人工
if ! printf '%s' "$UPLOAD_OUT" | grep -q '"success": *true'; then
    if printf '%s' "$UPLOAD_OUT" | grep -qiE 'connection refused|econnrefused|connect failed|broker\.sock'; then
        echo "⚠️ 检测到 mcporter 连接层故障 (非脚本/权限问题), 自动重启 daemon 后重试一次..."
        npx -y mcporter daemon restart 2>&1 || true
        sleep 2
        UPLOAD_OUT="$(run_upload)"
    fi
fi

echo "$UPLOAD_OUT"

# ---------- 4. 部署结果校验 (不采信自报, 一律看返回 + 线上实测) ----------
if ! printf '%s' "$UPLOAD_OUT" | grep -q '"success": *true'; then
    echo "❌ CloudBase 上传失败 (未返回 success:true), 详见上方输出"
    exit 1
fi

# 线上 download.html 应包含本地版本串, 反向确认整站上传真的生效
LOCAL_APK="$(grep -oE 'daoyuan-v[0-9.]+\.apk' "${ZHS_DIR}/download.html" 2>/dev/null | head -1 || true)"
if [[ -n "$LOCAL_APK" ]]; then
    REMOTE_HTML="$(curl -sL --max-time 60 https://zhenhesheng.cn/download.html || true)"
    if printf '%s' "$REMOTE_HTML" | grep -q "$LOCAL_APK"; then
        echo "✅ 线上校验通过: download.html 已指向 ${LOCAL_APK}"
    else
        echo "⚠️ 线上校验未通过: download.html 未出现 ${LOCAL_APK} (可能 CDN 缓存, 请稍后重试或手动核查)"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " ✅ 部署完成 | ${NEW_TAG}"
echo "   URL: https://cloud1-d8gs2k9m311f7272f.tcloudbaseapp.com/"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
