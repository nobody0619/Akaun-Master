# Akaun Master — Latihan Perakaunan

Akaun Master 是一个会计互动练习平台。标题与会计题目使用马来文，界面说明与解析提供中文，涵盖 PHR、折旧、调整、坏账、借款、资产处置、盈亏平衡及 Perkongsian 等主题。

## Latihan Perkongsian

Faedah atas Pinjaman、Gaji Pekongsi 和 Penyata Pelarasan Untung Rugi 各有 10 道固定题，参考教师提供的例题重新设计。所有全年利息与薪金协议适用于完整会计年度，答案为整数；包含试算表未列出已付金额、部分已付及全部已付三种情况。答对或答错后均显示马来文计算与中文解析。

贷款利息的全年金额列入 Akaun Untung Rugi，Akaun Pengasingan Untung Rugi 为 0；合伙人薪金的全年金额列入 Akaun Pengasingan Untung Rugi。两类题中的 Akaun Semasa 均要求填未付净调整额（全年应付减已付），不是往来账户的期末总余额。

Penyata Pelarasan Untung Rugi 要逐项判断 Tambah (+)、Tolak (−) 或 Tiada Pelarasan、填写金额，再计算调整后净利润。题目明确哪些金额已计入原净利润，避免把已付利息重复扣除；解析同时展示费用或收入的变动如何影响净利润。

## Jalankan Secara Tempatan

需要 Node.js 20 或更新版本。

```bash
npm install
npm run dev
```

## Semakan Sebelum Penerbitan

```bash
npm run audit:questions
npm run audit:partnership
npm run build
```

题目审计会为每类动态练习生成 5,000 个检查样本，核对计算公式、分类、调整、负债划分及小数情况。提交到 `main` 后，GitHub Actions 会自动构建并发布到 GitHub Pages。

