#!/usr/bin/env bash
# ================================================================
#  وِجهة — Full Auto Deploy Script (Mac / Linux)
#  Runs everything: GitHub repo creation + Vercel deployment
#  Usage: bash deploy.sh YOUR_GITHUB_TOKEN YOUR_VERCEL_TOKEN
# ================================================================

set -e

GITHUB_TOKEN="${1:-}"
VERCEL_TOKEN="${2:-}"

RED='\033[0;31m'; GREEN='\033[0;32m'
YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

header() { echo -e "\n${BLUE}━━━ $1 ━━━${NC}"; }
ok()     { echo -e "${GREEN}✅ $1${NC}"; }
warn()   { echo -e "${YELLOW}⚠️  $1${NC}"; }
fail()   { echo -e "${RED}❌ $1${NC}"; exit 1; }

echo -e "${BLUE}"
cat << 'BANNER'
  ╔═══════════════════════════════════════╗
  ║      🧭  وِجهة — Auto Deploy          ║
  ╚═══════════════════════════════════════╝
BANNER
echo -e "${NC}"

# ── Check tokens provided ─────────────────────────────────
if [ -z "$GITHUB_TOKEN" ] || [ -z "$VERCEL_TOKEN" ]; then
  echo -e "${YELLOW}Usage: bash deploy.sh GITHUB_TOKEN VERCEL_TOKEN${NC}"
  echo ""
  echo "Get your tokens:"
  echo "  GitHub → https://github.com/settings/tokens/new"
  echo "           Scopes needed: repo, delete_repo"
  echo ""
  echo "  Vercel → https://vercel.com/account/tokens"
  echo ""
  exit 1
fi

# ── 1. Requirements ───────────────────────────────────────
header "1/6  Checking Requirements"
command -v node >/dev/null || fail "Node.js not found — install from https://nodejs.org"
command -v git  >/dev/null || fail "Git not found — install from https://git-scm.com"
NODE_V=$(node -e "console.log(process.versions.node.split('.')[0])")
[ "$NODE_V" -ge 18 ] || fail "Node 18+ required, you have $(node --version)"
ok "Node $(node --version) | Git $(git --version | awk '{print $3}')"

# ── 2. Install dependencies ───────────────────────────────
header "2/6  Installing Dependencies"
npm install
ok "node_modules ready"

# ── 3. Git init ───────────────────────────────────────────
header "3/6  Initializing Git"
git init
git add .
git commit -m "🚀 Initial commit — وِجهة Qatar Coupon App" || true
ok "Git repository initialized"

# ── 4. Create GitHub repo via API ─────────────────────────
header "4/6  Creating GitHub Repository"

GITHUB_USER=$(curl -sf -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/user | python3 -c "import sys,json; print(json.load(sys.stdin)['login'])")

[ -z "$GITHUB_USER" ] && fail "Invalid GitHub token or API unreachable"
ok "GitHub user: $GITHUB_USER"

# Delete existing repo if present (ignore error)
curl -sf -X DELETE \
  -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_USER/wejha-app" 2>/dev/null || true

# Create new repo
REPO_RESPONSE=$(curl -sf -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"wejha-app\",\"description\":\"وِجهة — Qatar Coupon App\",\"private\":false,\"auto_init\":false}")

REPO_URL=$(echo "$REPO_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['clone_url'])")
REPO_HTML=$(echo "$REPO_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['html_url'])")

[ -z "$REPO_URL" ] && fail "Failed to create GitHub repo"
ok "Repository created: $REPO_HTML"

# ── 5. Push to GitHub ─────────────────────────────────────
header "5/6  Pushing to GitHub"
AUTHED_URL="https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/wejha-app.git"
git remote remove origin 2>/dev/null || true
git remote add origin "$AUTHED_URL"
git branch -M main
git push -u origin main --force
ok "Code pushed to GitHub"

# ── 6. Deploy to Vercel ───────────────────────────────────
header "6/6  Deploying to Vercel"

# Install Vercel CLI if needed
if ! command -v vercel &>/dev/null; then
  npm install -g vercel --silent
fi

# Create Vercel project and deploy using token
VERCEL_OUTPUT=$(VERCEL_TOKEN="$VERCEL_TOKEN" vercel deploy \
  --token "$VERCEL_TOKEN" \
  --yes \
  --name wejha-app \
  --prod \
  2>&1)

DEPLOY_URL=$(echo "$VERCEL_OUTPUT" | grep -E "https://wejha" | tail -1 | tr -d ' ')
[ -z "$DEPLOY_URL" ] && DEPLOY_URL=$(echo "$VERCEL_OUTPUT" | grep -E "https://" | tail -1 | tr -d ' ')

ok "Deployed to Vercel"

# ── Summary ───────────────────────────────────────────────
echo -e "\n${GREEN}"
cat << SUMMARY
  ╔══════════════════════════════════════════════════════════╗
  ║                  🎉  DEPLOYMENT COMPLETE!                ║
  ╠══════════════════════════════════════════════════════════╣
  ║                                                          ║
  ║  GitHub  →  https://github.com/${GITHUB_USER}/wejha-app
  ║  Live    →  ${DEPLOY_URL}
  ║                                                          ║
  ╠══════════════════════════════════════════════════════════╣
  ║  ⚠️  Add these in Vercel Dashboard → Settings → Env Vars  ║
  ║                                                          ║
  ║  NEXT_PUBLIC_SUPABASE_URL      = your_supabase_url       ║
  ║  NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key           ║
  ║                                                          ║
  ║  Then click "Redeploy" in Vercel Dashboard               ║
  ╚══════════════════════════════════════════════════════════╝
SUMMARY
echo -e "${NC}"
