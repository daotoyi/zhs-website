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

# ---------- 2. Git commit & tag ----------
MESSAGE="${*:-Auto deploy v${NEW_VERSION}}"
git add -A
git commit -m "[${NEW_TAG}] ${MESSAGE}"
git tag -a "${NEW_TAG}" HEAD -m "Website ${NEW_TAG}: ${MESSAGE}"
git push origin main
git push origin "${NEW_TAG}"

echo "✅ Git committed & pushed (${MESSAGE})"

# ---------- 3. Upload to CloudBase via mcporter ----------
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ZHS_DIR="$(dirname "$SCRIPT_DIR")"

NODE_BIN="/Users/wenhua/.workbuddy/binaries/node/versions/22.22.2/bin/node"
MCPORTER_JSON="${ZHS_DIR}/../zhs-deploy/.mcp/cloudbase-mcp/node_modules/mcporter/package.json"

if [[ ! -f "$MCPORTER_JSON" ]]; then
    # Fallback: use npx mcporter
    echo "⚠️  Local mcporter not found, using npx..."
    cd "$ZHS_DIR/../zhs-deploy"
    npx -y mcporter call cloudbase.manageHosting action=upload \
        --args "{\"localPath\":\"${ZHS_DIR}\",\"cloudPath\":\"/\",\"ignore\":[\"zhs/**\",\".git/**\"]}"
else
    MCP_CLI="$(dirname "$(dirname "$MCPORTER_JSON")")/cli.cjs"
    if [[ -f "$MCP_CLI" ]]; then
        echo "📦 Uploading to CloudBase static hosting..."
        cd "$ZHS_DIR/../zhs-deploy"
        $NODE_BIN "$MCP_CLI" call cloudbase.manageHosting action=upload \
            --args "{\"localPath\":\"${ZHS_DIR}\",\"cloudPath\":\"/\",\"ignore\":[\"zhs/**\",\".git/**\"]}"
    else
        echo "❌ CLI not found at $MCP_CLI"
        exit 1
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " ✅ 部署完成 | ${NEW_TAG}"
echo "   URL: https://cloud1-d8gs2k9m311f7272f.tcloudbaseapp.com/"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
