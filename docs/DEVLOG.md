## 2026-10-22～23｜v0.5.0-beta.1 行動裝置介面開發（最新補充）

- 以已合併 alpha.3 的 `main` 為起點，在 `feature/pixel-farm-beta1` 分支持續開發，保留既有 Express、SQLite、音效與遊戲規則。
- Commit `6287857`：加入 beta.1 響應式 UI、手機操作調整與原有測試驗證。
- Commit `22c8f09`：加入農田、商店、背包、交易紀錄四分頁與精簡手機排版；使用者確認 Push 成功。
- Commit `9e9d11d`：將手機農田分頁中次要資訊調整歸入紀錄，保留桌面側欄；使用者確認 Push 並同步遠端追蹤分支。
- 曾遇到 Chrome／Edge `ERR_CONNECTION_REFUSED`；原因待每次依伺服器是否在 127.0.0.1:3000 監聽確認，不可將該畫面直接當作 CSS 缺陷。
- Windows PowerShell 5.1 初次執行匯入腳本曾因編碼解析失敗，使用修正版安裝後成功；多次有 LF/CRLF 警告但 `git diff --check` 未回報格式錯誤。
- 截至 2026-10-23，使用者提供 `npm test` 31/31 通過；手機四分頁操作曾回報正常。完整的多尺寸人工驗收與正式發布仍待確認。


# DEVLOG｜Pixel Farm 開發日誌

> 僅記錄對話中可確認的事件與此套件實際執行的工作。不編造遇到過的 Bug、討論會議或測試成果。

## 2026-10-19｜v0.1.0
- 建立本機 `Pixel-farm` 與 GitHub Repository `Chiou-Jiakang/Pixel-farm`。
- 初始兩邊的 Git 歷史不同；合併 `README.md` 時遇到 add/add conflict，保留本地 README 後合併成功。
- 交付 4×4 農田、胡蘿蔔成熟及收成前端原型。
- 使用者實際操作並回報五項手動驗收全部通過。
- Commit、Push、Tag v0.1.0 並發布 GitHub Pre-release。

## 2026-10-19｜v0.2.0
- 交付三作物選擇、成熟時間差異、成長階段及分類收成統計。
- 使用者回報六項功能測試通過，提供執行畫面。
- 文件架構新增 README、CHANGELOG、DEVLOG、PRD、ROADMAP、TESTING、Release Notes。
- Commit `6689f8e`、Tag v0.2.0；使用者確認 GitHub Pre-release 已發布。

## 2026-10-20｜v0.3.0 開發與正式發布
- 基於 v0.2.0 前端程式，保留農田與生長階段並新增金幣、商店、背包與販售。
- 將經濟規則獨立到 `public/game-core.js`，UI `script.js` 僅負責呈現與操作轉接，以利測試與後續移植至後端。
- 設定初始資金 120、贈送胡蘿蔔種子 3 顆。購買扣款、播種扣種子、成熟收成入庫、販售加款。
- 支出與收入記錄為交易現金流，刻意避免把「收入－支出」誤稱為正式會計利潤。
- 在產生套件的執行環境使用 Node.js 內建測試器跑完 10 項核心邏輯測試，皆通過；另通過 JS 語法檢查。
- 使用者在本機瀏覽器實際操作，回報種子購買、播種、收成、販售、金幣計算、交易紀錄及重設正常。
- 曾出現部分田地似乎無法播種的疑慮；購買新種子後可正常種植，確認原因為種子庫存限制，並非農田點擊失效。後續應改善庫存不足的操作提示。
- 已完成 Commit、Push 與 `v0.3.0` Tag，GitHub Pre-release 已發布；標籤、`main` 與遠端追蹤分支均對應 Commit `1747895`。
- 後續另以文件專用 Commit 更新 v0.3.0 已發布與人工驗收狀態。

## 2026-10-20｜v0.4.0 後端與資料庫開發、驗收完成（待發布）
- 以 Node.js 內建 `node:sqlite` 及 Express 建立本機 REST API，使用 `game`、`plots`、`inventory`、`transactions` 等 SQLite 資料表。
- 前端改向伺服器請求狀態，核心買賣與農田操作由伺服器執行；伺服器時間戳決定成熟，不再依賴瀏覽器倒數作為判定依據。
- 以 SQLite `BEGIN IMMEDIATE` 交易執行寫入，避免操作失敗時留下部分變更；重設亦由後端處理。
- 匯入 v0.4.0 ZIP 後，首次 `npm test` 只找到 10 項，原因是 `tests/` 缺少 API 與 database 測試檔；從原始 ZIP 補入後修正。
- 使用者的 Windows PowerShell、Node.js v24.15.0 環境執行 `npm install` 成功（當時 npm 回報 0 已知漏洞），`npm test` **17/17 通過**（10 核心、5 SQLite、2 API）。
- 使用者提供瀏覽器畫面，確認農田、商店、背包、交易紀錄及經濟統計呈現；曾核對金幣餘額 39 = 初始 120 − 支出 162 + 收入 81。
- 使用者回報五項 SQLite 持久化人工驗收通過，含重新整理與重新啟動伺服器後仍保留進度、按原時間成熟及重設狀態保存。
- 發布前檢查：Git 已忽略 `node_modules/` 與 SQLite 存檔 `data/pixel-farm.sqlite`；`data/.gitkeep` 可納入版本管理，舊版解壓縮資料夾不應提交。
- 發現 v0.4.0 文件套件覆蓋部分 v0.3.0 詳細歷史，並將 v0.4.0 測試狀態保留在驗收前；進行文件合併以避免版本歷史倒退。
- **尚未建立 v0.4.0 Git Commit、Tag 或 GitHub Release。**

## 技術取捨與後續風險
- v0.3.0 未引入 localStorage；其交易紀錄僅存在當局記憶體。v0.4.0 改由 SQLite 保存資料，UI 顯示最近 20 筆交易。
- `node:sqlite` 在部分 Node 版本仍有實驗性 API 警告；目前已確認 Node.js v24.15.0 可執行本機測試。
- v0.4.0 仍只有單一可信任本機存檔，沒有身份驗證、多人帳戶或雲端同步；不可直接公開部署。
- 尚未完成壓力測試、跨瀏覽器相容性全面測試或並發競態壓力驗證。
