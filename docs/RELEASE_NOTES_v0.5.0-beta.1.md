# Pixel Farm v0.5.0-beta.1 — Release Notes（候選稿）

> **狀態：尚未正式發布，供開發分支 PR 與最終驗收使用。**

## 本版重點
- 以行動裝置為優先的響應式 Pixel Farm UI。
- 手機新增農田、商店、背包、交易紀錄四分頁。
- 農田優先的精簡布局；將次要資訊收整於紀錄分頁，桌面仍維持原本面板。
- 保留 16 格農田、三作物 10／18／30 秒成熟、商店購買、收成、販售及交易紀錄。
- 沿用 Express REST API、SQLite 本機存檔、前端動畫、Web Audio API 操作音效與偏好設定。

## 驗證狀態
- 截至 2026-10-23，本機 `npm test`：**31/31 通過，0 失敗**（使用者執行畫面）。
- 三筆 beta.1 功能 Commit：`6287857`、`22c8f09`、`9e9d11d`。
- 最終行動／桌面回歸、SQLite 持久化檢查與 PR 合併尚未完成。

## 啟動方式
```powershell
npm ci
npm test
npm start
```
於本機瀏覽器開啟 `http://127.0.0.1:3000`。Node.js 需支援 `node:sqlite`。

## 限制
- 單人本機遊戲，無登入、雲端同步與正式公網安全控制。
- 不應把 `data/*.sqlite` 或 `node_modules/` 納入版本管理。
- 目前屬 beta 候選稿，不是已發布的正式 Release。
