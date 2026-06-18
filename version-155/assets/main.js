(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "" +
      "<article class=\"movie-card default\" data-title=\"" + escapeHtml(item.title) + "\" data-year=\"" + escapeHtml(item.year) + "\" data-type=\"" + escapeHtml(item.type) + "\" data-region=\"" + escapeHtml(item.region) + "\" data-tags=\"" + escapeHtml((item.tags || []).join(" ")) + "\">" +
        "<a class=\"poster\" href=\"" + escapeHtml(item.url) + "\" aria-label=\"观看" + escapeHtml(item.title) + "\">" +
          "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
          "<span class=\"poster-play\">▶</span>" +
        "</a>" +
        "<div class=\"card-body\">" +
          "<div class=\"card-meta\">" +
            "<a href=\"" + escapeHtml(item.categoryUrl) + "\">" + escapeHtml(item.categoryName) + "</a>" +
            "<span>" + escapeHtml(item.year) + "</span>" +
            "<span>" + escapeHtml(item.type) + "</span>" +
          "</div>" +
          "<h3><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h3>" +
          "<p>" + escapeHtml(item.oneLine) + "</p>" +
          "<div class=\"tag-row\">" + tags + "</div>" +
        "</div>" +
      "</article>";
  }

  function initMobileNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });
  }

  function initCardFilters() {
    var panel = document.querySelector("[data-card-filter]");
    var list = document.querySelector("[data-filter-list]");
    if (!panel || !list) {
      return;
    }
    var keyword = panel.querySelector("[data-filter-keyword]");
    var type = panel.querySelector("[data-filter-type]");
    var year = panel.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    function apply() {
      var q = normalize(keyword && keyword.value);
      var t = normalize(type && type.value);
      var y = normalize(year && year.value);
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-tags")
        ].join(" "));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matched = (!q || haystack.indexOf(q) !== -1) && (!t || cardType === t) && (!y || cardYear === y);
        card.style.display = matched ? "" : "none";
      });
    }
    [keyword, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function initSearchPage() {
    var target = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    if (!target || !window.searchIndex) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var input = document.querySelector(".big-search input[name='q']");
    if (input) {
      input.value = query;
    }
    var q = normalize(query);
    if (!q) {
      if (title) {
        title.textContent = "输入关键词后展示匹配内容";
      }
      target.innerHTML = window.searchIndex.slice(0, 24).map(cardTemplate).join("");
      return;
    }
    var results = window.searchIndex.filter(function (item) {
      var haystack = normalize([
        item.title,
        item.year,
        item.region,
        item.type,
        item.genre,
        item.categoryName,
        (item.tags || []).join(" ")
      ].join(" "));
      return haystack.indexOf(q) !== -1;
    });
    if (title) {
      title.textContent = "与“" + query + "”相关的内容";
    }
    target.innerHTML = results.length ? results.map(cardTemplate).join("") : "<div class=\"search-page-box\">没有找到匹配内容</div>";
  }

  ready(function () {
    initMobileNav();
    initSearchForms();
    initCardFilters();
    initSearchPage();
  });
})();
