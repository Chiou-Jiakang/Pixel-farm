# Pixel Farm｜像素農場經營遊戲（v0.5.0-beta.1）

> **目前狀態：beta.1 候選版本，功能開發分支 `feature/pixel-farm-beta1`；尚未合併至 `main` 或發布正式 Release。** 下方保留 v0.4.0 歷史 README，供追溯舊版資訊；如有衝突，請以本節最新說明為準。

Pixel Farm 為單人本機全端像素農場遊戲，使用 HTML、CSS、JavaScript、Node.js、Express 與 SQLite。玩家可以選擇三種作物、在 4×4 農田播種與收成，於商店購買種子、背包販售作物，並查閱交易紀錄。伺服器負責交易驗證與持久化；前端提供成長動畫、音效以及響應式介面。

## beta.1 重點

- 行動版四分頁：**農田／商店／背包／紀錄**；行動分頁顯示與桌面完整布局切換。
- 手機 390 × 844 的精簡版排版：頂部音效、金幣及統計區壓縮，三種作物橫向排列；保留 16 格農田可操作性。
- 農田優先的資訊架構：次要經營資訊在手機版歸入紀錄分頁，桌面版保留原側欄。
- 延續 Web Audio API 操作回饋、靜音與音量偏好，以及 SQLite 本機存檔。
- **31 項本機 Node 測試全數通過（使用者於 2026-10-23 回報）**；這不是跨裝置全面驗收。

## 本機執行

```powershell
cd "C:\Users\jerry chiou\OneDrive\Desktop\Pixel-farm-beta1"
npm ci
npm test
npm start
```

在 Edge／Chrome 開啟 `http://127.0.0.1:3000`。不要以 `file://` 直接開啟 HTML；本版需要 Express API 與 SQLite。開發用 Node 需支援 `node:sqlite`（`package.json` 要求 Node >=22.13.0）。伺服器保持運行才能連線；停止請按 `Ctrl + C`。

## 使用方式

1. 選擇胡蘿蔔／馬鈴薯／番茄；需要先有種子。
2. 點農田空格播種；分別需 10／18／30 秒成熟，成熟後點擊收成。
3. 商店可購買 1 或 5 顆種子；背包可出售收成物；紀錄可查看交易及經營資料。
4. 遊戲進度存在本機 SQLite；重新整理不應清空資料。重設農場會清除進度，請謹慎操作。

## 測試與開發狀態

- Commit #1：`6287857` 響應式 UI；Commit #2：`22c8f09` 四分頁；Commit #3：`9e9d11d` 資訊架構精修，皆已推送至功能分支。
- `npm test`：31/31 通過；`git diff --check` 未見格式錯誤（截至 2026-10-23 使用者提供之終端機截圖）。
- 用戶回報四個手機分頁的操作正常；但**尚需最終跨尺寸回歸、存檔確認與發布檢查**，不得視為 beta.1 已正式發布。
- 詳見 `docs/TESTING.md`、`docs/ROADMAP.md` 與 `docs/RELEASE_NOTES_v0.5.0-beta.1.md`。

## 原始架構與歷史

目前程式另包含 `public/beta1.css`、`public/beta1.js`、`public/mobile-tabs.css`、`public/mobile-tabs.js`，以及對應測試。`data/` 的實際 SQLite 存檔與 `node_modules/` **不得提交 Git**。

---

## 歷史內容：v0.4.0 README（原文保留）

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
