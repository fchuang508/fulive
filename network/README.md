# FC 公開服務規則

此目錄由 dotfiles 的驗證／發布程式產生，請勿在此手動維護第二份來源。

共用 `.list` 是不含目標策略的 classical text。Clash 使用 `behavior: classical`、`format: text`；Shadowrocket 使用 `RULE-SET,URL,策略組`。服務規則須位於一般地區／供應商 fallback 之前。

`adapters/clash.json` 與 `adapters/shadowrocket.conf` 為引用片段，須由客戶端定義策略組與節點。Clash 片段包含 AI UDP 防落空；Shadowrocket 片段僅列出服務路由，不承諾平台限制完全相同。

iPhone／iPad 可另存 `adapters/shadowrocket-ios.conf` 為新配置，操作見 [IOS.md](./IOS.md)。三個 AI 組預設 REJECT，必須手動選取合格節點；這是三服務範本，沒有包含 Mac 全部政策。

dotfiles 的 Global Script 可將三份服務設為 HTTP provider，每日更新並保留已成功載入的快取；首次接入先執行 prepare-clash、備份並實機驗收。發布本身不會自動改動裝置，首次沒有有效快取時不可假設離線可用。

`manifest.json` 記錄來源 commit、內容識別與逐檔 SHA-256。回退由 dotfiles 還原來源後重新驗證發布，客戶端需再次更新才會取得修正。
