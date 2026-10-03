# Akaun Master — Latihan Perakaunan

Akaun Master 是一个会计互动练习平台。整体界面、首页标语、导航及答题提示使用中文；课文相关的专题名称、题目与会计术语保留马来文，解析提供中文说明，涵盖 PHR、折旧、调整、坏账、借款、资产处置、盈亏平衡及 Perkongsian 等主题。

## Latihan Perkongsian

Faedah atas Pinjaman、Gaji Pekongsi 和 Penyata Pelarasan Untung Rugi 各有 10 道固定题，参考教师提供的例题重新设计。借款利息包含 7 道全年题与 3 道按日期计算的题（3、6、9 个月）；薪金为全年金额，所有答案均为整数。包含试算表未列出已付金额、部分已付及全部已付三种情况。题干简短，提交后显示马来文计算与中文解析；金额留空按 0 判断，不跳过评分。

贷款利息的本期金额列入 Akaun Untung Rugi，Akaun Pengasingan Untung Rugi 为 0；合伙人薪金的全年金额列入 Akaun Pengasingan Untung Rugi。两类题中的 Akaun Semasa 均要求填未付净调整额（本期应付减已付），不是往来账户的期末总余额。借款利息仅填写这三个账户，没有额外的全年利息填写栏。

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

