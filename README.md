# Akaun Master — Latihan Perakaunan

Akaun Master 是一个会计互动练习平台。界面使用中文，题目、会计术语与解题说明保留马来文，涵盖 PHR、折旧、调整、坏账、借款、资产处置及盈亏平衡等主题。

## Jalankan Secara Tempatan

需要 Node.js 20 或更新版本。

```bash
npm install
npm run dev
```

## Semakan Sebelum Penerbitan

```bash
npm run audit:questions
npm run build
```

题目审计会为每类动态练习生成 5,000 个检查样本，核对计算公式、分类、调整、负债划分及小数情况。提交到 `main` 后，GitHub Actions 会自动构建并发布到 GitHub Pages。

