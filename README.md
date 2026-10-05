# SageFate · 神机 — Fortune Telling Site

面向外国人的中文玄学付费算命站。静态站点（HTML + CSS + JS），零后端依赖，可部署到任何静态托管。

## 站点结构
```
index.html      落地页（首页，全品类入口）
bazi.html       八字排盘完整报告（v2，仿专业排盘站）
js/bazi.js      排盘引擎（Node 可 require 测试，页面共用同一份代码）
zodiac.html     生肖查询（已上线，免费小工具）
tarot.html      塔罗（内容页 + 预约）
fengshui.html   风水（内容页 + 预约）
name.html       姓名解析（内容页 + 预约）
css/style.css   全局样式（深色神秘风 + 金/玉点缀）
js/site.js      公共脚本（移动端菜单、年份）
```

## 本地预览
```bash
cd 项目目录
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
```

## 部署（推荐 Vercel，免费）
1. 把整个文件夹推到 GitHub 仓库。
2. 打开 vercel.com → Import 该仓库 → Framework 选 "Other" → Deploy。
3. 部署成功后得到 `xxx.vercel.app` 临时域名，先验证页面正常。

> Netlify / GitHub Pages 同样可用，都是拖文件夹即可。

## 绑定域名 sagefate.com（你注册后在注册商后台操作）
前提：你已在 namecheap / 阿里云国际 注册 `sagefate.com`。

**方式 A（最简单，用 Vercel 的 DNS）：**
1. Vercel 项目 → Settings → Domains → 输入 `sagefate.com` 和 `www.sagefate.com` → Add。
2. 注册商后台把域名 Nameservers 改成 Vercel 给的两条：
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
3. 等 10 分钟~24 小时生效，状态变 "Valid Configuration" 即可。

**方式 B（不用 Vercel DNS，手动加解析记录）：**
在注册商 DNS 后台添加：
```
类型  主机名    值
A      @         76.76.21.21
CNAME  www       cname.vercel-dns.com
```
然后在 Vercel Domains 里加上 `sagefate.com` / `www.sagefate.com`。

## 下一步（付费闭环，待接）
- [ ] **AI 解读报告**：调 OpenAI / Claude API，把八字排盘结果喂进去生成英文报告，输出 PDF。
- [ ] **支付**：接 Stripe（信用卡，老外首选）或 PayPal；bazi.html 的 "Get My AI Reading — $19.9" 按钮目前是占位提示。
- [ ] **其余品类**：tarot / fengshui / name 目前是内容+预约页，后续补测算逻辑。
- [ ] **社媒账号**：Instagram / TikTok / YouTube / X 统一抢注 `@sagefate`，发生肖运程/八字冷知识引流。

## 注意
- 全站定位为 entertainment / self-reflection，页脚已注明，规避合规风险。
- 八字排盘用 lunar.js（CDN 引入），无需自建历法算法，准确度高。
