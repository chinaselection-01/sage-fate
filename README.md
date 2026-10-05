# SageFate · 神机 — Fortune Telling Site

面向外国人的中文玄学付费算命站。静态站点（HTML + CSS + JS），零后端依赖。

## 部署现状（已上线，待你填 DNS）
- **代码仓库**：https://github.com/chinaselection-01/sage-fate （已 push 到 main 分支）
- **托管**：GitHub Pages，源 = main 分支根目录，构建状态 `built`
- **自定义域名**：已设为 `sage-fate.com`（仓库根 `CNAME` 文件生效）
- **还差一步**：在你的域名注册商后台填 DNS 解析（见下文），填完 10 分钟~24 小时内 `sage-fate.com` 就能打开，GitHub 自动签发 HTTPS 证书。

## 站点结构
```
index.html      落地页（首页，全品类入口）
bazi.html       八字排盘完整报告（v2，仿专业排盘站，已可算）
js/bazi.js      排盘引擎（Node 可 require 测试，页面共用同一份代码）
zodiac.html     生肖查询（已上线，免费小工具）
tarot.html      塔罗（内容页 + 预约）
fengshui.html   风水（内容页 + 预约）
name.html       姓名解析（内容页 + 预约）
css/style.css   全局样式（深色神秘风 + 金/玉点缀）
js/site.js      公共脚本（移动端菜单、年份）
CNAME           GitHub Pages 自定义域名声明 = sage-fate.com
```

## 本地预览
```bash
cd 项目目录
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
```

## 绑定域名 sage-fate.com（你在注册商后台操作，最后一步）
前提：你已在 namecheap / 阿里云国际 注册 `sage-fate.com`。

**在注册商 DNS 后台添加以下记录（4 条 A + 1 条 CNAME）：**

| 类型 | 主机名/主机记录 | 值 / 记录值 | 说明 |
|---|---|---|---|
| A | `@`（或留空，表示根域名） | `185.199.108.153` | GitHub Pages |
| A | `@` | `185.199.109.153` | GitHub Pages |
| A | `@` | `185.199.110.153` | GitHub Pages |
| A | `@` | `185.199.111.153` | GitHub Pages |
| CNAME | `www` | `chinaselection-01.github.io` | www 跳转到根域名 |

填完后：
1. 回到 GitHub 仓库 → Settings → Pages，确认 Custom domain 显示 `sage-fate.com` 且出现绿色 "DNS check successful"。
2. 勾选 **Enforce HTTPS**（GitHub 验证 DNS 后会自动签发证书，可能需要几分钟到几小时）。

**验证是否生效：**
```bash
# 在本地终端执行，看到 200 即成功
curl -s -o /dev/null -w "%{http_code}\n" https://sage-fate.com/
```

> 如果你注册商支持"用 nameserver 托管"，也可以把域名 nameserver 改成 GitHub Pages 的（但 GitHub Pages 不提供自定义 nameserver，所以**用上面的 A/CNAME 记录方式**即可）。

## 下一步（付费闭环，待接）
- [ ] **AI 解读报告**：调 OpenAI / Claude API，把八字排盘结果喂进去生成英文报告，输出 PDF。
- [ ] **支付**：接 Stripe（信用卡，老外首选）或 PayPal；bazi.html 的 "Get My AI Reading — $19.9" 按钮目前是占位提示。
- [ ] **其余品类**：tarot / fengshui / name 目前是内容+预约页，后续补测算逻辑。
- [ ] **社媒账号**：Instagram / TikTok / YouTube / X 统一抢注 `@sagefate`（注意是 **sagefate** 无连字符的社媒 handle，域名是 sage-fate.com 带连字符，两者不同），发生肖运程/八字冷知识引流。

## 注意
- 全站定位为 entertainment / self-reflection，页脚已注明，规避合规风险。
- 八字排盘用 lunar.js（CDN 引入），无需自建历法算法，准确度高。
- 后续改站：改完 push 到 main 分支，GitHub Pages 自动重新构建（约 1 分钟生效）。
