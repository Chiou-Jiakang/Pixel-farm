# DEVLOG｜Pixel Farm 開發日誌

本文件記錄**有對話或已產生檔案可支持的實際事件**，並標示尚待確認之處。不編造錯誤排查過程、耗時、測試腳本或技術決策。

## 2026-10-19｜專案初始化與 v0.1.0

### 已發生事件

- 確認第二個專案定位為 Pixel Farm，沿用 HTML／CSS／JavaScript，規劃後續 Node.js／Express／SQLite。
- 在 Windows 桌面建立 `Pixel-farm` 資料夾，並加入既有 VS Code 多資料夾工作區。
- 在本機執行 `git init`、建立 `main`，新增 `.gitignore` 與 `README.md`，完成初始 Commit `d7354e4`。
- 建立 GitHub 儲存庫 `Chiou-Jiakang/Pixel-farm`；因本機與遠端都有初始 Commit，合併時 `README.md` 發生 add/add conflict。
- 選擇保留本機 README，完成合併 Commit `53a2b70`，並成功 Push。
- 匯入 v0.1.0 前端檔案 `public/index.html`、`public/style.css`、`public/script.js`。
- 開發者提供遊戲執行截圖，畫面出現 4 × 4 農田、倒數／成熟作物與統計。
- 開發者回報 v0.1.0 五項最終人工功能驗收全部通過。
- v0.1.0 程式 Commit `e4bc208` 並成功 Push 至 `main`，建立 `v0.1.0` 標籤及 GitHub Pre-release；發布頁面截圖顯示標籤指向 `e4bc208`。

### 已知小問題及處理

- ZIP 解壓縮後多了一層 `Pixel-farm-v0.1.0/` 資料夾；已指導將 `public/` 放置在專案根目錄，並避免把多餘資料夾提交。
- `git add` 曾顯示 LF／CRLF 換行提示；此為環境提示，非功能錯誤。

## 2026-10-19｜v0.2.0 作物成長系統

### 已發生事件

- 以完整 ZIP 提供新版前端程式碼，沿用現有 `Pixel-farm` 儲存庫及 `public/` 結構。
- 新增三種作物（胡蘿蔔、馬鈴薯、番茄）、不同成熟時間、四個成長階段、作物選擇、分類收成統計。
- 前端遊戲狀態仍在瀏覽器記憶體，沒有實作資料庫或永久存檔。
- 開發者提供 v0.2.0 遊戲截圖，顯示選種區、農田與分類收成統計；畫面顯示播種 66、收成 57、成長中 0，分類收成為 35、6、16，合計 57。
- 開發者明確回報 v0.2.0 六項功能手動測試均通過。
- 決定在 v0.2.0 Release 前補齊專案文件體系：README、CHANGELOG、PRD、ROADMAP、DEVLOG、TESTING 與 Release Notes。

### 技術設計依據（可由 v0.2.0 程式碼確認）

- 使用 `CROPS` 物件集中管理品種與 `growMs`。
- 使用陣列儲存 16 格，每格包含 `cropId`、`plantedAt`。
- `getPlotStage()` 根據 `Date.now()` 計算空地／種子／幼苗／成長中／成熟階段。
- UI 以 `render()` 更新，並透過 `setInterval(..., 250)` 週期性刷新。
- `interactWithPlot()` 統一處理空地播種、成熟收成與未成熟提示；重設由 `resetFarm()` 處理。
- 注意：這些規則**仍在前端**，不能視為伺服器可信驗證。

### 尚待完成

- v0.2.0 的 Git Commit、Push、Tag 與 GitHub Release：**本文件製作時尚無成功截圖或回報，不應註記完成。**
- v0.3.0 商店與經濟、v0.4.0 後端資料庫等後續開發。

## 日誌紀錄原則

- 「開發者回報測試通過」與「自動化測試通過」必須分開記載。
- 未取得命令輸出、測試報告或成功畫面，不寫為客觀已驗證。
- 每個新版本在本日誌新增日期、主要變更、重要問題、決策、剩餘工作；不為充實文件而創造不存在的 Bug。
