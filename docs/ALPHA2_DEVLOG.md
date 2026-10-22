# Pixel Farm v0.5.0-alpha.2｜開發紀錄

- 基準：GitHub Commit `1da491c`（alpha.1）。
- 目標：播種、成長、成熟與收成動畫；購買和販售的金幣變化提示。
- 前端保留同一農田格子的 DOM 節點，僅狀態階段改變時重建圖像，避免每 500 毫秒重新啟動動畫。
- API 回傳成功才播放成功動畫；失敗僅提示錯誤。所有金幣、播種、收成判定均由 Express／SQLite 處理。
- 新增 `prefers-reduced-motion` 支援。
- `package.json` 與伺服器啟動訊息更新為 alpha.2；不修改 SQLite schema。
- 本文件記錄交付實作；使用者本機操作尚待驗收。
