/* 真和盛 zhenhesheng.cn · 全站交互 */
(function () {
  "use strict";

  /* 导航高亮: 按当前页面自动匹配 (红框 + 浮动动画) */
  (function () {
    var page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (!page) page = "index.html";
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      a.classList.remove("active");
      var href = (a.getAttribute("href") || "").toLowerCase().split("?")[0];
      if (href === page) a.classList.add("active");
    });
  })();

  /* 主题切换: 浅色 / 暗色 / 随系统 */
  (function () {
    var KEY = "zhs-theme";
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var root = document.documentElement;

    function resolve(theme) {
      if (theme === "dark") return "dark";
      if (theme === "light") return "light";
      return mq.matches ? "dark" : "light";
    }

    function apply(theme) {
      var real = resolve(theme);
      root.setAttribute("data-theme", real);
      document.querySelectorAll(".ts-btn[data-theme]").forEach(function (b) {
        b.classList.toggle("on", b.getAttribute("data-theme") === theme);
      });
    }

    var saved = "auto";
    try { saved = localStorage.getItem(KEY) || "auto"; } catch (e) {}
    apply(saved);

    var wrap = document.getElementById("themeSwitch");
    if (wrap) {
      wrap.addEventListener("click", function (e) {
        var btn = e.target.closest ? e.target.closest(".ts-btn") : null;
        if (!btn) return;
        var t = btn.getAttribute("data-theme");
        try { localStorage.setItem(KEY, t); } catch (e) {}
        apply(t);
      });
    }

    if (mq.addEventListener) {
      mq.addEventListener("change", function () {
        var cur = "auto";
        try { cur = localStorage.getItem(KEY) || "auto"; } catch (e) {}
        if (cur === "auto") apply("auto");
      });
    }
  })();

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
