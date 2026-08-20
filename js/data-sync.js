/* ============================================================
   真和盛 zhenhesheng.cn · 道之器 / 盘道 实时数据同步
   数据源: 道元易学 CloudBase (dy-api 云函数, CORS 已开启)
   ============================================================ */
(function () {
  "use strict";

  var API = "https://cloud1-d8gs2k9m311f7272f-1464523137.ap-shanghai.app.tcloudbase.com/dy-api";

  function call(action, data) {
    return fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: action, data: data || {} }),
    })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.status === 200) return j.data;
        throw new Error((j && j.msg) || "加载失败");
      });
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function resolveImg(src) {
    if (!src || src.indexOf("cloud://") === 0) return "images/products/product-01.png";
    return src;
  }

  /* ---------------- 道之器: 商品实时同步 ---------------- */
  var shopGrid = document.querySelector(".shop-grid[data-dynamic]");
  var shopNote = document.querySelector(".shop-note");
  if (shopGrid) {
    var CATE_NAMES = {};   /* 由 categories.list 动态填充 */
    var allCards = [];

    /* 与 H5 商城界面一致: 分类与商品均从接口实时同步 */
    call("categories.list", {}).then(function (cates) {
      var tabsWrap = document.querySelector(".shop-tabs");
      cates = cates || [];
      cates.forEach(function (c) { CATE_NAMES[c.id] = c.name; });
      if (tabsWrap && cates.length) {
        var html = '<button class="shop-tab on" data-cate="all">全部</button>';
        cates.forEach(function (c) {
          html += '<button class="shop-tab" data-cate="' + esc(c.id) + '">' + esc(c.name) + "</button>";
        });
        tabsWrap.innerHTML = html;
      }
      return call("products.list", {});
    }).then(function (list) {
      allCards = (list || []).filter(function (p) { return p.is_show !== false; });
      shopGrid.innerHTML = "";
      if (!allCards.length) {
        shopGrid.innerHTML = '<div class="section-tip">暂无商品，敬请期待</div>';
        if (shopNote) shopNote.style.display = "none";
        return;
      }
      allCards.forEach(function (p) {
        var img = resolveImg(p.images && p.images[0]);
        var card = document.createElement("a");
        card.className = "product-card";
        card.setAttribute("data-cate", String(p.cate_id || 0));
        card.href = "https://club.zhenhesheng.cn/";
        card.target = "_blank";
        card.innerHTML =
          '<div class="product-img-wrap">' +
          '<span class="product-cate">' + esc(CATE_NAMES[p.cate_id] || "雅器") + "</span>" +
          '<img src="' + esc(img) + '" alt="' + esc(p.name) + '" onerror="this.onerror=null;this.src=\'images/products/product-01.png\'">' +
          "</div>" +
          '<div class="product-body">' +
          '<div class="product-name">' + esc(p.name) + "</div>" +
          '<p class="product-desc">' + esc(p.description || "") + "</p>" +
          '<div class="product-foot">' +
          '<span class="product-sales">已售 ' + (p.sales || 0) + "</span>" +
          '<span class="product-cta">前往选购</span>' +
          "</div></div>";
        shopGrid.appendChild(card);
      });
      bindShopTabs();
    }).catch(function (e) {
      if (shopGrid) shopGrid.innerHTML = '<div class="section-tip">数据加载失败，请稍后刷新重试</div>';
    });

    function bindShopTabs() {
      var tabsWrap = document.querySelector(".shop-tabs");
      if (!tabsWrap) return;
      tabsWrap.addEventListener("click", function (e) {
        var tab = e.target.closest ? e.target.closest(".shop-tab") : null;
        if (!tab) return;
        var all = tabsWrap.querySelectorAll(".shop-tab");
        all.forEach(function (t) { t.classList.remove("on"); });
        tab.classList.add("on");
        var cate = tab.getAttribute("data-cate");
        document.querySelectorAll(".shop-grid .product-card").forEach(function (card) {
          var show = cate === "all" || card.getAttribute("data-cate") === cate;
          card.style.display = show ? "" : "none";
        });
      });
    }
  }

  /* ---------------- 盘道: 活动实时同步 ---------------- */
  var pandaoGrid = document.querySelector(".schedule-grid[data-dynamic]");
  if (pandaoGrid) {
    call("pandao.list", {}).then(function (list) {
      pandaoGrid.innerHTML = "";
      if (!list || !list.length) {
        pandaoGrid.innerHTML = '<div class="section-tip">暂无盘道活动</div>';
        return;
      }
      list.forEach(function (pd) {
        var price = pd.price;
        var priceHtml = price && Number(price) > 0 ? "¥" + Number(price).toFixed(0) : "免费";
        var card = document.createElement("a");
        card.className = "schedule-card";
        card.href = "https://club.zhenhesheng.cn/";
        card.target = "_blank";
        card.style.cursor = "pointer";
        card.innerHTML =
          '<span class="sch-day">' + esc(pd.day || "") + "</span>" +
          '<div class="sch-title">' + esc(pd.title || "") + "</div>" +
          '<p class="sch-meta">' +
          (pd.start_date ? "🕐 " + esc(pd.start_date) + (pd.time ? " " + esc(pd.time) : "") + "<br>" : "") +
          (pd.place ? "📍 " + esc(pd.place) + "<br>" : "") +
          '<span class="tag">' + priceHtml + "</span>" +
          (pd.desc ? "<br><span>" + esc(pd.desc) + "</span>" : "") +
          "</p>";
        pandaoGrid.appendChild(card);
      });
    }).catch(function (e) {
      pandaoGrid.innerHTML = '<div class="section-tip">数据加载失败，请稍后刷新重试</div>';
    });
  }
})();
