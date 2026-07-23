#!/usr/bin/env bash

# =================================================================
# HooksVue AI Navigation Bar - One-Click Build & Deploy Tool
# =================================================================

set -e

# Color definitions
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}=====================================================${NC}"
echo -e "${CYAN}🚀 HooksVue AI 导航工具箱 - 一键构建与部署工具${NC}"
echo -e "${CYAN}=====================================================${NC}"

COMMIT_MSG="${1:-feat: update site assets, Xiaomi shop data, and navigation bar}"

echo -e "\n${YELLOW}📦 Step 1: 确保商品与全局 JSON 数据生成...${NC}"
if [ -f "scratch/generate_shop_json.cjs" ]; then
    node scratch/generate_shop_json.cjs
fi

echo -e "\n${YELLOW}🔨 Step 2: 正在执行本地生产编译构建 (8GB Heap Limit)...${NC}"
export NODE_OPTIONS="--max-old-space-size=8192"
npm run build

echo -e "\n${YELLOW}📋 Step 3: 查看 Git 修改状态...${NC}"
git status --short

echo -e "\n${YELLOW}➕ Step 4: 正在暂存文件 (git add)...${NC}"
git add README.md README.en.md README.jp.md package.json .github/ src/ public/ scripts/

echo -e "\n${YELLOW}📝 Step 5: 提交 Commit...${NC}"
git commit -m "$COMMIT_MSG" || echo -e "${YELLOW}提示: 没有需要提交的新变更。${NC}"

echo -e "\n${YELLOW}⬆️  Step 6: 推送到远程 GitHub 仓库 (git push origin main)...${NC}"
git push origin main

echo -e "\n${GREEN}=====================================================${NC}"
echo -e "${GREEN}✅ 一键构建并推送完成！${NC}"
echo -e "${GREEN}🌐 GitHub Actions 已自动触发全新的部署 Flow。${NC}"
echo -e "${CYAN}查看构建状态: https://github.com/mhxy13867806343/front-end-navigation-bar/actions${NC}"
echo -e "${GREEN}=====================================================${NC}\n"
