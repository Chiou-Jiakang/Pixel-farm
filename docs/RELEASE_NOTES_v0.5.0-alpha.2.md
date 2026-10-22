# Pixel Farm v0.5.0-alpha.2 — Crop Animation & Interaction System

開發版候選，**尚未發布／尚待使用者本機驗收**。

## 變更
- 保留原作物圖像和 4×4 農田，加入階段切換動畫。
- 操作成功後提供播種、收成與金幣變動動效。
- 避免每 500 毫秒輪詢重新建立農田 DOM。
- 支援系統的減少動畫偏好。
- 更新前端與伺服器版本標籤。

## 架構
保留 Node.js／Express／SQLite 的資料權威與持久化。未修改經濟規則及資料庫 Schema。

## 驗收
參閱 `docs/ALPHA2_TESTING.md`；尚未宣稱已通過使用者端測試。
