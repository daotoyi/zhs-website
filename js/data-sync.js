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

  /* cloud:// fileID → 可访问签名 URL (存储桶私有读, 浏览器无法直接渲染 cloud://) */
  function resolveCloudUrls(list) {
    list = list || [];
    var files = list.filter(function (f) {
      return typeof f === "string" && f.indexOf("cloud://") === 0;
    });
    if (!files.length) return Promise.resolve(list.slice());
    return call("app.fileUrl", { fileList: files }).then(function (res) {
      var map = {};
      ((res && res.list) || []).forEach(function (it) {
        if (it && it.fileID) map[it.fileID] = it.url || "";
      });
      return list.map(function (f) {
        return (typeof f === "string" && f.indexOf("cloud://") === 0) ? (map[f] || "") : f;
      });
    }).catch(function () {
      return list.map(function () { return ""; });
    });
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
      allCards = (list || []).filter(function (p) {
        /* 与 H5 商城一致: 仅保留「属于可见分类」的商品 (隐藏分类下的商品不显示) */
        return p.is_show !== false && CATE_NAMES[p.cate_id];
      });
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
        /* 跳转到同修汇对应商品详情页 (H5 hash 路由) */
        card.href = "https://club.zhenhesheng.cn/#/pages-sub/product/detail?id=" + p.id;
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
      if (!list || !list.length) return { list: [], urlSets: [] };
      /* 每场活动的封面列表: covers 优先, 兼容旧数据只有 cover */
      var coverLists = list.map(function (pd) {
        var cs = (Array.isArray(pd.covers) && pd.covers.length)
          ? pd.covers.slice()
          : (pd.cover ? [pd.cover] : []);
        return cs;
      });
      var flat = [];
      coverLists.forEach(function (cs) { cs.forEach(function (c) { flat.push(c); }); });
      /* cloud:// → 签名 URL, 再按场次切回去 */
      return resolveCloudUrls(flat).then(function (urls) {
        var cursor = 0;
        var urlSets = coverLists.map(function (cs) {
          var arr = urls.slice(cursor, cursor + cs.length);
          cursor += cs.length;
          return arr;
        });
        return { list: list, urlSets: urlSets };
      });
    }).then(function (r) {
      var list = (r && r.list) || [];
      var urlSets = (r && r.urlSets) || [];
      pandaoGrid.innerHTML = "";
      if (!list.length) {
        pandaoGrid.innerHTML = '<div class="section-tip">暂无盘道活动</div>';
        return;
      }
      list.forEach(function (pd, i) {
        var price = pd.price;
        var priceHtml = price && Number(price) > 0 ? "¥" + Number(price).toFixed(0) : "免费";
        var cover = ((urlSets[i] || []).filter(Boolean))[0] || "";
        var isOffline = /线下/.test(String(pd.title || "") + String(pd.place || ""));
        var card = document.createElement("a");
        card.className = "schedule-card" + (isOffline ? " offline" : "");
        /* 直达同修汇对应盘道活动详情页 (H5 hash 路由) */
        card.href = "https://club.zhenhesheng.cn/#/pages-sub/pandao/detail?id=" + pd.id;
        card.target = "_blank";
        card.style.cursor = "pointer";
        card.innerHTML =
          (cover ? '<img class="sch-cover" src="' + esc(cover) + '" alt="' + esc(pd.title || "盘道活动") + '" loading="lazy" onerror="this.style.display=\'none\'">' : "") +
          '<div class="sch-body">' +
          '<span class="sch-day">' + esc(pd.day || "盘道") + "</span>" +
          '<div class="sch-title">' + esc(pd.title || "") + "</div>" +
          '<p class="sch-meta">' +
          (pd.start_date ? "🕐 " + esc(pd.start_date) + (pd.time ? " " + esc(pd.time) : "") + "<br>" : "") +
          (pd.place ? "📍 " + esc(pd.place) + "<br>" : "") +
          '<span class="tag">' + priceHtml + "</span>" +
          (pd.desc ? "<br><span>" + esc(pd.desc) + "</span>" : "") +
          "</p></div>";
        pandaoGrid.appendChild(card);
      });
    }).catch(function (e) {
      pandaoGrid.innerHTML = '<div class="section-tip">数据加载失败，请稍后刷新重试</div>';
    });
  }

  /* ---------------- 盘道: 动态轮播图 (同步同修汇盘道界面) ---------------- */
  var gallery = document.querySelector("[data-pandao-banners]");
  if (gallery) {
    gallery.hidden = true;
    call("app.payConfig", {}).then(function (cfg) {
      var banners = (cfg && cfg.pandao_banners) || [];
      if (!banners.length) return null;
      return resolveCloudUrls(banners).then(function (urls) {
        return urls.filter(Boolean);
      });
    }).then(function (urls) {
      if (!urls || !urls.length) return;
      gallery.hidden = false;
      renderGallery(gallery, urls);
    }).catch(function () { gallery.hidden = true; });
  }

  function renderGallery(host, urls) {
    var track = host.querySelector(".pd-gallery-track");
    var dots = host.querySelector(".pd-gallery-dots");
    if (!track || !dots) return;
    track.innerHTML = "";
    dots.innerHTML = "";

    urls.forEach(function (u, i) {
      var img = document.createElement("img");
      img.className = "pd-gallery-img" + (i === 0 ? " on" : "");
      img.src = u;
      img.alt = "盘道活动";
      img.loading = i === 0 ? "eager" : "lazy";
      track.appendChild(img);

      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "pd-gallery-dot" + (i === 0 ? " on" : "");
      dot.setAttribute("aria-label", "第 " + (i + 1) + " 张");
      dot.addEventListener("click", function () { go(i); play(); });
      dots.appendChild(dot);
    });

    var cur = 0;
    var timer = null;

    function go(i) {
      var imgs = track.querySelectorAll(".pd-gallery-img");
      var ds = dots.querySelectorAll(".pd-gallery-dot");
      cur = (i + urls.length) % urls.length;
      for (var k = 0; k < imgs.length; k++) imgs[k].classList.toggle("on", k === cur);
      for (var j = 0; j < ds.length; j++) ds[j].classList.toggle("on", j === cur);
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () { go(cur + 1); }, 4000);
    }

    host.addEventListener("mouseenter", function () { clearInterval(timer); });
    host.addEventListener("mouseleave", play);
    play();
  }
})();
