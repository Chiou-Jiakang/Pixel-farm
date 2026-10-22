# Pixel Farm v0.5.0-alpha.3 — Sound & Feedback System

> 開發候選版本；尚未進行使用者端瀏覽器驗收，也未建立 GitHub Release。

## 新增

- Web Audio API 合成播種、收成、買種子、販售及重設音效。
- 交易失敗時提示音；繼續保留現有文字錯誤訊息。
- 作物首次成熟時提示音，不隨週期性重繪重複觸發。
- 靜音切換、音量控制與瀏覽器 `localStorage` 設定。
- 新增純音效規則模組及測試；不新增 npm 相依套件。

## 不變

保留 Node.js、Express、SQLite、16 格農田、三種作物、商店、販售、交易紀錄及原有動畫。不修改 SQLite Schema。

## 測試

參閱 `ALPHA3_TEST_REPORT.md` 與 `docs/ALPHA3_TESTING.md`，已驗證與待使用者驗收的部分分開記錄。
