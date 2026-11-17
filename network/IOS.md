# iPhone／iPad Shadowrocket 接入

1. 保留目前配置；新增配置，URL 填入 `https://raw.githubusercontent.com/fchuang508/fulive/main/network/adapters/shadowrocket-ios.conf`。先下載預覽，未確認前不要覆寫原配置。
2. 在新配置的代理分組，為 FC-AI-Claude／FC-AI-OpenAI 選日本、新加坡或其他已識別的合格節點；FC-AI-Muse-US 只選美國，若有高帶寬 3–6 可先測試。三組預設 REJECT，沒有合格節點時維持拒絕，不要改成 DIRECT 或香港。
3. 啟用新配置，分別打開 Claude／ChatGPT／Muse，從 Shadowrocket 日誌確認命中 FC-AI-*。規則集下載失敗、無節點或功能異常時，切回保留的原配置。

這是三服務的最小配置範本，不含訂閱、節點憑證、Mac 程序規則或其他個人服務。一般流量走 app 的 PROXY，局域網 IPv4 直連；DNS／IPv6／其他服務需依手機原環境核對。地區只依節點名稱辨識，不能證明真實 IP 或住宅身分。手機 App 尚須使用者實機驗收；不將 Mac／CI 成功當作手機成功。
