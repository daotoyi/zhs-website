# 真和盛 zhenhesheng.cn

道家文化传承平台官网（静态站）。

## 页面结构

| 页面 | 说明 |
|------|------|
| `index.html` | 首页：Hero、道家四象理念、经典研习、道之器、盘道 |
| `origin.html` | 道之源：道家起源 + 千年源流时间轴 |
| `classics.html` | 道之法：德道日章 / 易卦日解 / 四柱八字 |
| `practice.html` | 道之术：五术通识、清静养生 |
| `shop.html` | 道之器：文创产品（实时同步 H5 推荐商品，无价格，点击跳俱乐部） |
| `pandao.html` | 盘道：活动安排（实时同步 H5 盘道数据，点击跳俱乐部） |
| `about.html` | 关于我们 |

## 技术说明

- 纯静态 HTML + CSS + JS，无构建依赖
- 风格：米白底 + 中国红 + 鎏金点缀，宋楷字体
- `js/data-sync.js`：通过 CloudBase 云函数接口（dy-api）实时同步道元易学商品与盘道数据
- 部署：CloudBase 静态托管（环境 cloud1-d8gs2k9m311f7272f）
  - zhenhesheng.cn / www.zhenhesheng.cn → 本站
  - club.zhenhesheng.cn → 道元易学 H5（路径重写）
  - 道元易学 H5 在 `https://zhenhesheng.cn/h5/`

## 备案

京ICP备2026047935号 · [工信部备案查询](https://beian.miit.gov.cn/)
