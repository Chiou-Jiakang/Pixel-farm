# Pixel Farm｜像素農場經營遊戲

**目前程式版本：v0.3.0 — Shop & Economy System（已通過使用者瀏覽器人工驗收，並發布 GitHub Pre-release）**

這是一款以 HTML、CSS、JavaScript 製作的單人農場經營網頁遊戲。沿用 v0.2.0 的 4×4 農田、三種作物與成長階段，新增商店、金幣、背包及販售交易。**目前沒有後端，也不會永久儲存資料；重新整理頁面即重置。**

## 功能與規則

- 16 格農田；三種作物：胡蘿蔔（10 秒）、馬鈴薯（18 秒）、番茄（30 秒）。
- 成長階段：種子、幼苗、成長中、成熟。未成熟不可收成，已佔用的格子不可重複播種。
- 初始金幣 **120**，贈送 **3 顆胡蘿蔔種子**；選擇作物後，背包有種子才可播種。
- 種子商店支援一次購買 1 或 5 顆；背包可以販售 1 個或目前該作物的全部收成。
- 成熟收成後，收成物進入背包；販售後取得金幣。
- 顯示金幣、累計播種與收成、正在成長作物、累計購買支出、累計販售收入及已實現**淨現金流**。
- 顯示本局最近 20 筆購買或販售紀錄。重設功能將所有遊戲狀態回復初始值。

| 作物 | 成熟時間 | 種子單價 | 收成售價 | 單次播種售出之價格差額* |
|---|---:|---:|---:|---:|
| 胡蘿蔔 | 10 秒 | 8 | 14 | 6 |
| 馬鈴薯 | 18 秒 | 14 | 25 | 11 |
| 番茄 | 30 秒 | 22 | 40 | 18 |

* 價格差額不是目前 UI 顯示的淨現金流，尚不包含初始贈品的成本歸屬、未售庫存與其他費用。

## 安裝與執行

**不需要 npm install、不需要開啟後端伺服器。** 使用 Edge 或 Chrome 開啟 `public/index.html` 即可。

1. 在原本 `Pixel-farm` 專案根目錄保留 `.git/`、`.gitignore` 等設定。
2. 用本版 `public/` 覆蓋舊版 `public/` 的檔案，並複製本版的 `docs/`、`README.md`、`CHANGELOG.md` 與 `tests/`。
3. 雙擊 `public/index.html`。測試購買種子、播種、成熟收成、背包販售及農場重設。

## 程式結構

```text
Pixel-farm/
├── public/
│   ├── index.html          # 使用者介面
│   ├── style.css           # UI 與響應式樣式
│   ├── game-core.js        # 可獨立測試的遊戲／經濟規則
│   └── script.js           # DOM 操作與畫面渲染
├── tests/
│   └── game-core.test.cjs  # Node.js 內建測試器
├── docs/
│   ├── PRD.md
│   ├── ROADMAP.md
│   ├── DEVLOG.md
│   ├── TESTING.md
│   ├── RELEASE_NOTES_v0.2.0.md
│   └── RELEASE_NOTES_v0.3.0.md
├── CHANGELOG.md
├── README.md
└── .gitignore
```

## 自動化測試（選擇性）

如本機安裝 Node.js（支援 `node --test` 的版本），在專案根目錄執行：

```powershell
node --test tests/game-core.test.cjs
```

開發環境中的 **10 項遊戲核心邏輯自動化測試已通過**。使用者另外回報完成瀏覽器人工驗收，涵蓋種子購買、播種、成熟收成、販售、金幣計算、交易紀錄與重設；尚未完成全面跨瀏覽器、效能或安全性測試。詳細範圍見 [`docs/TESTING.md`](docs/TESTING.md)。

## 文件索引

- [`CHANGELOG.md`](CHANGELOG.md)：版本已完成變更
- [`docs/PRD.md`](docs/PRD.md)：需求與產品願景
- [`docs/ROADMAP.md`](docs/ROADMAP.md)：後續版本計畫
- [`docs/DEVLOG.md`](docs/DEVLOG.md)：可追溯開發紀錄
- [`docs/TESTING.md`](docs/TESTING.md)：測試與待驗收事項
- [`docs/RELEASE_NOTES_v0.3.0.md`](docs/RELEASE_NOTES_v0.3.0.md)：v0.3.0 版本說明（[GitHub Pre-release 已發布](https://github.com/Chiou-Jiakang/Pixel-farm/releases/tag/v0.3.0)）

## 已知限制

- 所有遊戲數據只存在前端記憶體；關閉或重新整理將重新開始。
- 前端執行規則可以由使用者修改，不具有伺服器權威防作弊能力。
- 交易紀錄最多保留本局最近 20 筆；不是永久流水帳。
- 沒有多人連線、登入、SQLite、REST API；預計 v0.4.0 開始處理後端持久化。
- 目前沒有正式財務會計系統；「收入－支出」表示當局交易淨現金流。
