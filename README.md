# Pixel Farm｜像素農場經營遊戲

**目前工作版本：v0.4.0 — Backend & Database（已完成本機測試與持久化驗收，待 GitHub 發布）**

本專案為單人本機農場網頁遊戲。v0.4.0 延續 v0.3.0 的 4×4 農田、三種作物、金幣、種子商店、背包及交易紀錄，首次導入 **Node.js、Express REST API 與 SQLite 永久存檔**。交易規則由伺服器執行，瀏覽器僅操作及呈現狀態。

## 使用環境

- **Node.js 22.13.0 或更新的 22.x／支援 `node:sqlite` 的版本**（本版使用 Node 內建 SQLite API；在 Node 22.x 可能有 ExperimentalWarning，這不是執行失敗）。建議使用 Node 22 LTS 的較新修補版本。
- npm；需首次連網安裝 Express。
- Windows PowerShell / macOS / Linux 均可在終端機啟動。

## 安裝與啟動（與 v0.3.0 不同）

1. 將此版本的 `public/`、`server/`、`tests/`、`docs/`、`package.json`、`README.md`、`CHANGELOG.md` 複製到原本 `Pixel-farm` 根目錄，**保留 `.git/`**，保留或合併 `.gitignore`。
2. VS Code 打開 `Pixel-farm` 的終端機，依序執行：

```powershell
node -v
npm install
npm start
```

3. 在瀏覽器開啟 **http://127.0.0.1:3000**。
4. 要停止伺服器：在終端機按 **Ctrl + C**。

**不可再用 `file:///.../public/index.html` 雙擊啟動遊戲**：此版需要 API 及資料庫服務。

首次執行將自動建立 `data/pixel-farm.sqlite`。重新整理網頁或重新啟動伺服器後，同一台電腦的存檔仍在。請勿把資料庫上傳 GitHub；`.gitignore` 已排除它。

## 遊戲規則

- 16 格農田；胡蘿蔔 10 秒、馬鈴薯 18 秒、番茄 30 秒成熟。
- 初始 120 金幣及 3 顆胡蘿蔔種子。
- 種子單價依序為 8、14、22；作物販售價依序為 14、25、40。
- 商店購買 1 或 5 顆、播種扣種子、成熟收成入背包、販售獲得金幣。
- 最近 20 筆交易顯示於畫面，**資料庫則保留交易歷史**；重設農場會清除歷史。
- 伺服器以時間戳判斷成熟，前端倒數僅用來顯示，不能決定能否收成。
- 購買、播種、收成及販售在 SQLite `BEGIN IMMEDIATE` 交易內驗證並提交，拒絕操作不更改存檔。

## 專案結構

```text
Pixel-farm/
├── public/
│   ├── index.html
│   ├── style.css
│   ├── script.js             # 前端 API 呼叫與 UI 渲染
│   └── game-core.js          # 共享純遊戲規則
├── server/
│   ├── index.cjs             # 啟動本機伺服器
│   ├── app.cjs               # Express 路由
│   └── database.cjs          # SQLite Schema、交易、存檔
├── tests/
│   ├── game-core.test.cjs
│   ├── database.test.cjs
│   └── api.test.cjs
├── data/                     # 執行時產生資料庫（不提交）
├── docs/
│   ├── PRD.md
│   ├── ROADMAP.md
│   ├── DEVLOG.md
│   ├── TESTING.md
│   ├── RELEASE_NOTES_v0.2.0.md
│   ├── RELEASE_NOTES_v0.3.0.md
│   └── RELEASE_NOTES_v0.4.0.md
├── package.json
├── README.md
├── CHANGELOG.md
└── .gitignore
```

## 測試

```powershell
npm test
```

套件產製環境曾完成核心 10 項及 SQLite 資料層 5 項測試。**2026-10-20 使用者在 Windows、Node.js v24.15.0 本機執行 `npm install` 與 `npm test`，17/17 項通過**（核心 10、SQLite 5、Express API 2；失敗 0、略過 0）。使用者亦回報五項 SQLite 持久化人工驗收全部通過；包含頁面重新整理、伺服器重新啟動、成熟時間延續，以及重設狀態保留等。此為使用者回報，不等同於完整跨瀏覽器、負載或資安測試。

## 文件索引

- [`CHANGELOG.md`](CHANGELOG.md)：歷次版本變更。
- [`docs/DEVLOG.md`](docs/DEVLOG.md)：實際開發與驗收紀錄。
- [`docs/PRD.md`](docs/PRD.md)：需求規格與驗收準則。
- [`docs/ROADMAP.md`](docs/ROADMAP.md)：原訂時程及版本進度。
- [`docs/TESTING.md`](docs/TESTING.md)：測試證據、通過範圍及限制。
- [`docs/RELEASE_NOTES_v0.4.0.md`](docs/RELEASE_NOTES_v0.4.0.md)：待發布的版本說明。

## API 摘要

| HTTP | 路徑 | JSON Body |
|---|---|---|
| GET | `/api/health` | 無 |
| GET | `/api/game` | 無 |
| POST | `/api/game/buy` | `{ "cropId": "carrot", "quantity": 1 }` |
| POST | `/api/game/plant` | `{ "cropId": "carrot", "index": 0 }` |
| POST | `/api/game/harvest` | `{ "index": 0 }` |
| POST | `/api/game/sell` | `{ "cropId": "carrot", "quantity": 1 }` |
| POST | `/api/game/reset` | `{}` |

## 限制

- 單一本機存檔，**無登入、多玩家、雲端同步**；伺服器預設僅監聽 `127.0.0.1`。
- `node:sqlite` 在部分 Node 版本仍屬實驗性 API；正式長期維護可評估成熟 SQLite 驅動。
- API 沒有身份驗證，只適用本機可信任環境；不可直接公開部署到網際網路。
- 已完成本次約定的瀏覽器功能及五項 SQLite 持久化人工驗收；尚未完成全面跨瀏覽器、負載、無障礙與安全性測試。
- 原有 `v0.3.0` Tag/Release 保留；**v0.4.0 尚待 Git Commit、Push、Tag 與 GitHub Pre-release**。

詳見 `docs/PRD.md`、`docs/TESTING.md`、`docs/ROADMAP.md`。
