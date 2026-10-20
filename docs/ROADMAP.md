# ROADMAP｜Pixel Farm 版本路線圖

原訂時間窗於 2026-10-19 規劃，保留作為計畫基準；實際開發進度較原定時間提前。以下狀態截至 2026-10-20。

| 版本 | 原訂時間窗 | 交付範圍 | 實際狀態 |
|---|---|---|---|
| v0.1.0 | 10/19–11/01 | 4×4 農田原型 | 10/19 GitHub Pre-release 已發布 |
| v0.2.0 | 11/02–11/15 | 三種作物與成長階段 | 10/19 GitHub Pre-release 已發布 |
| v0.3.0 | 11/16–11/29 | 商店、金幣、背包、販售及交易紀錄 | 10/20 GitHub Pre-release 已發布；人工驗收已回報通過 |
| v0.4.0 | 11/30–12/13 | Express API、SQLite、持久化與交易 | 10/20 開發、17 項自動化及 5 項持久化人工驗收完成；待 GitHub 發布 |
| v0.5.0 | 12/14–12/20 | 動畫、音效、視覺和響應式優化 | 規劃中 |
| v1.0.0 | 12/21–12/27 | 穩定性、完整測試、發布 | 規劃中 |
| Buffer | 12/28–01/10 | 問題修正與時程緩衝 | 保留 |

## v0.3.0 已完成事項
- 使用者回報購買、播種、成長、收成、販售及重設等功能驗收通過。
- Commit、Push、Tag `v0.3.0` 與 GitHub Pre-release 已完成。
- 待改善：種子不足提示可更加清楚；舊版解壓縮副本不得意外提交 Git。

## v0.4.0 已完成開發與驗收
- Express API 與 SQLite 作為伺服器權威來源，交易使用原子寫入。
- 伺服器依播種時間戳計算作物成熟，不依靠前端 `setTimeout` 判定可否收成。
- 使用者在本機完成 `npm install`、`npm test`（17/17 通過），並操作遊戲。
- 使用者回報 5 項 SQLite 永久存檔人工驗收均通過。

## v0.4.0 發布前尚待完成
1. 合併 README、CHANGELOG、DEVLOG、PRD、ROADMAP、TESTING 與 Release Notes；保留 v0.1.0–v0.3.0 歷史。
2. 以 `git diff --cached --name-only` 等方式確認只暫存程式碼、文件、`package-lock.json`、`data/.gitkeep`，不含 SQLite 實際存檔、`node_modules/`、舊版解壓縮資料夾與暫存差異檔。
3. Git Commit → Push → Tag `v0.4.0` → GitHub Pre-release。

## 下一階段
v0.5.0 將著重作物成長動畫、音效、行動裝置操作體驗與介面一致性。尚未開始實作或驗收。
