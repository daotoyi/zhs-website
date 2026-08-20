/* 真和盛 zhenhesheng.cn · 全站交互 */
(function () {
  "use strict";

  /* 移动端导航开关 */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") links.classList.remove("open");
    });
  }

  /* 道之器：分类筛选（无价格，点击卡片跳转俱乐部） */
  var shopTabs = document.querySelectorAll(".shop-tab[data-cate]");
  var shopCards = document.querySelectorAll(".product-card[data-cate]");
  if (shopTabs.length && shopCards.length) {
    shopTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        shopTabs.forEach(function (t) { t.classList.remove("on"); });
        tab.classList.add("on");
        var cate = tab.getAttribute("data-cate");
        shopCards.forEach(function (card) {
          var show = cate === "all" || card.getAttribute("data-cate") === cate;
          card.style.display = show ? "" : "none";
        });
      });
    });
  }

  /* 道之器：点击任意产品 → 跳转俱乐部 */
  document.querySelectorAll(".product-card").forEach(function (card) {
    card.addEventListener("click", function () {
      window.open("https://club.zhenhesheng.cn/", "_blank");
    });
  });
})();
