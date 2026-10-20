# Pixel Farm v0.4.0 — Backend & Database System

> **已完成驗收、待 GitHub 發布。** 使用者已於 2026-10-20 完成本機套件安裝、17 項自動化測試及 5 項 SQLite 持久化人工驗收；**尚未建立 v0.4.0 Tag 與 GitHub Release**。

Pixel Farm v0.4.0 是首個以 Express 與 SQLite 支援的本機全端遊戲版本，將原本由瀏覽器管理的農場狀態交由伺服器處理並持久化。

## 新增功能
- Express REST API：查詢遊戲狀態、買種子、播種、收成、販售及重設。
- SQLite 資料庫保存金幣、農地、背包與交易紀錄。
- `BEGIN IMMEDIATE` 資料庫交易保護核心遊戲操作。
- 作物成熟由伺服器時間判定；重新整理或伺服器重啟後可接續進度。
- 資料庫與 API 測試程式。

## 安裝
需要 Node.js >=22.13。下載 Source code ZIP 後在根目錄執行：

```powershell
npm install
npm test
npm start
```

開啟 http://127.0.0.1:3000。此版不能直接雙擊 `public/index.html`。

## 已驗證範圍
交付環境原先通過 15 項核心及 SQLite 測試；使用者在 Windows／Node.js v24.15.0 本機安裝 Express 後，執行 `npm test`，**17/17 項通過**（核心 10、SQLite 5、API 2），失敗及略過皆為 0。使用者亦回報五項 SQLite 持久化人工驗收通過，包括重新整理、伺服器重啟、跨重啟成熟計算及重設存檔。尚未執行完整跨瀏覽器、效能、無障礙與安全性測試。

## 已知限制
- 僅支援單機本地使用，無登入、多人遊戲、雲端同步或公網安全保護。
- 在部分 Node.js 22 版本中 `node:sqlite` 仍顯示實驗性功能警告。
- 未完成跨瀏覽器與壓力測試。
