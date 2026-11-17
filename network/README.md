# FC 公開服務規則

此目錄由 dotfiles 的驗證／發布程式產生，請勿在此手動維護第二份來源。

共用 `.list` 是不含目標策略的 classical text。Clash 使用 `behavior: classical`、`format: text`；Shadowrocket 使用 `RULE-SET,URL,策略組`。

`adapters/` 只提供引用片段，不建立策略組、節點、DNS 或 TUN。Clash 片段包含 AI UDP 防落空；Shadowrocket 片段僅列出服務路由，不承諾平台限制與 Clash 完全相同，須在 App 驗收。請將服務規則置於一般地區／供應商 fallback 之前。

現有日常 Clash 尚未因本次發布而改用遠端清單；接入應另行驗收，下載或驗收失敗時保留原可用配置。

`manifest.json` 記錄來源 commit、內容識別與逐檔 SHA-256。回退可由 dotfiles 還原來源後重新驗證發布；客戶端需再次更新才會取得修正。
