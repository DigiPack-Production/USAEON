# template-prod-html

純靜態單頁網站模板：`index.html` + `js/` + `images/`，樣式以 Tailwind CSS v4（CSS-first 設定）建置。沒有框架、bundler、lint 與測試套件，適合活動頁、形象頁等不需後端的正式站。

## 快速開始

```bash
npm install
npm run build        # 產生 css/style.css（不在版控內，clone 後必做）
npx serve .          # 以靜態伺服器預覽 http://localhost:3000
```

開發時另開一個終端機執行 `npm run dev` 持續監看並重建 CSS。

注意事項：

- `css/style.css` 是建置產物，已被 `.gitignore` 排除。頁面完全沒有樣式時先確認是否已執行 `npm run build`。
- `npm run dev` 只是 Tailwind watch，**不會**啟動伺服器，請另外以靜態伺服器提供專案根目錄。
- 不要用 `file://` 直接開啟 `index.html`：CSP 含 `upgrade-insecure-requests`，字型與相對路徑行為也與正式站不同。
- Windows（Git Bash / PowerShell / WSL）與 macOS 皆可開發，指令請保持雙邊相容。

## npm scripts

| 指令 | 說明 |
| --- | --- |
| `npm run dev` | Tailwind watch，監看 `src/tailwind.css` 並輸出 `css/style.css` |
| `npm run build` | 建置並壓縮 `css/style.css`，發布前執行 |
| `npm run img` | 設計素材入庫工具，見下方說明 |

### 圖片素材工具

`scripts/optimize-image.js` 以 sharp 將設計師交付的原圖正規化成適合進 repo 的來源檔。不會有任何流程強制執行它，需要保留高解析原圖時就不要用。

```bash
npm run img -- inspect <檔案...>            # 唯讀檢視尺寸與大小，不產生檔案
npm run img -- <preset> <檔案...> [選項]    # 依 preset 輸出
npm run img                                 # 顯示完整用法與選項
```

| preset | 用途 |
| --- | --- |
| `photo` | 照片類素材，WebP、最大寬 2400 |
| `graphic` | 線稿、UI 截圖、含文字的圖，無損 WebP |
| `og` | 社群分享圖，固定 1200×630 並裁切，JPEG |
| `raw` | 逃生口，數值全由參數指定 |

SVG 與 GIF 會自動略過。多尺寸 `srcset` 沒有 build 期機制，需要時多次輸出後手寫。

## 目錄結構

```
.
├── index.html              # 唯一頁面，含 CSP、meta、字型與資源引用
├── src/tailwind.css        # Tailwind 進入點與 @theme token（唯一的樣式原始碼）
├── css/style.css           # 建置產物，不進版控
├── js/
│   ├── main.js             # 頁面互動（目前為回到頂部按鈕）
│   └── ga.js               # GA4 初始化，預設以註解停用
├── images/icon/            # SVG 圖示
├── scripts/optimize-image.js
├── favicon.ico
├── CLAUDE.md               # 給 Claude Code 的專案指引
├── AGENTS.md               # 給 Codex 的專案指引
└── .claude/
    ├── settings.json       # 共用的 Claude Code 設定（權限、MCP、plugin、outputStyle）
    └── skills/             # 專案 skill：畫面驗收、圖片素材、PR review 發布
```

## 以此模板起新專案

依序完成以下項目：

1. **頁面資訊**：填寫 `index.html` 的 `<title>`、`description`、`author` 與 `og:*` 系列 meta。
2. **品牌色**：在 `src/tailwind.css` 的 `@theme` 調整 `--color-brand-orange` 或新增語意色 token，並在註解標明驗證過的對比情境。不要直接在 HTML 寫死色碼。
3. **字型**：預設載入 Noto Sans TC，需更換時同步修改 `<link>` 與 `@theme` 的 `--font-sans`。
4. **favicon**：更換 `favicon.ico`。
5. **GA4**：`js/ga.js` 的 `G-XXXXXXXXXX` 換成正式評估 ID，`index.html` 的 `gtag/js?id=` 也填入同一個 ID，再解除兩行 `<script>` 的註解。
6. **CSP**：新增第三方腳本、字型、圖片或 API 來源時，同步更新 `index.html` 的 `Content-Security-Policy`。
7. **快取版本號**：發布前將 `css/style.css`、`js/ga.js`、`js/main.js` 的 `?v=YYYYMMDD-NN` 更新為當日日期與流水號，詳見下方部署注意。

## 部署注意

- 正式站 nginx 對 `.css` / `.js` 設定 `Cache-Control: public, max-age=31536000, immutable`。**只要 `src/tailwind.css`、`css/style.css` 或 `js/` 有異動，發布前務必更新 `index.html` 三處 `?v=` 版本號**，格式為 `YYYYMMDD-NN`，同一天多次發布時 `NN` 遞增。沒更新時 LINE、Facebook 等 in-app 瀏覽器會持續拿到舊檔。
- 發布內容為建置後的整個專案根目錄（不含 `node_modules`、`src/`、`scripts/`），記得先 `npm run build`。
- `index.html` 與 `js/` 原樣提供給瀏覽器，每一行都等同公開。未公布的內容不要放進前端檔案，即使加了 `hidden` 也一樣。

## 開發慣例

細節寫在 `CLAUDE.md`，以下為摘要：

- **Tailwind**：所有 token 寫在 `@theme`，沒有 `tailwind.config.js`。重複的 utility 組合抽成 `@layer components`，非標準值反覆出現時建語意 token 而非到處寫 arbitrary value。
- **無障礙**：目標 WCAG 2.1 AA。字級用 rem、觸控目標至少 44×44 px、對比一般 ≥ 4.5:1、互動元素用 `<button>` / `<a>`、圖片給 `alt`、動畫尊重 `prefers-reduced-motion`。
- **SVG 圖示**：外層 `<svg>` 使用與 `viewBox` 對應的數值 `width` / `height`，不用百分比，也不加 `preserveAspectRatio="none"`；HTML 的 `<img>` 一律補 `width` / `height`。
- **Commit**：Conventional Commits，type 與 scope 用英文，subject 與 body 用繁體中文。

## AI 協作

- `CLAUDE.md` 給 Claude Code，`AGENTS.md` 給 Codex，兩者內容對應同一套慣例。
- `.claude/skills/` 提供三個專案 skill：`frontend-ui-validation`（以 Playwright MCP 驗收畫面，是本專案唯一的驗證手段）、`image-assets`（圖片入庫流程）、`pr-review-publish`（PR review 發布流程）。
- `.claude/settings.json` 為共用設定，已將 `outputStyle` 設為 `Concise`。個人偏好不同時，在 `.claude/settings.local.json`（已被 `.gitignore` 排除）或以 `/config` 覆寫即可，local 設定優先於共用設定。
- MCP 伺服器定義在 `.mcp.json`：`context7`（查文件）與 `playwright`（瀏覽器驗證）。
