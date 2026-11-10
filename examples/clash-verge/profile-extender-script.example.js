// 脱敏版 Profile Extender Script（范例）
// - 内容与 FC 实际使用的订阅专属脚本一致，未含任何敏感信息
// - 用途：通用策略由 Global Extend Script 负责，订阅层只放供应商专属例外
// - 当前这份是空实现（直接返回原配置），说明该订阅无专属例外

// Common FC policy is owned by Global Extend Script (global-policy.js).
// Keep this profile layer for supplier-specific exceptions only.
function main(config) { return config; }
