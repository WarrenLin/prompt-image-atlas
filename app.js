(function () {
  const meta = window.PROMPT_ATLAS_META || {};
  const sourceCases = window.PROMPT_ATLAS_CASES || [];

  const CATEGORY_ORDER = ["poster", "ui", "character", "comparison", "portrait"];
  const CATEGORY_LABELS = {
    all: "全部",
    poster: "海報與插畫",
    ui: "UI 與社群截圖",
    character: "角色設計",
    comparison: "模型比較與社群",
    portrait: "人像與攝影"
  };

  const EFFECT_DEFS = [
    { id: "film", label: "底片 / 35mm", re: /35mm|film photography|film grain|analog|ccd|fujifilm|kodak|膠片|底片|閃光燈/i },
    { id: "cinematic", label: "電影感光影", re: /cinematic|movie|film still|dramatic|rim light|backlight|silhouette|bokeh|電影|史詩|大片|剪影/i },
    { id: "poster", label: "海報排版", re: /poster|typography|layout|cover|magazine|advertisement|flyer|海報|封面|字體|排版|廣告/i },
    { id: "ui", label: "UI / 截圖", re: /\bui\b|ux|app|dashboard|interface|website|screenshot|prototype|landing page|home page|界面|截圖|主頁|產品原型|儀表板/i },
    { id: "infographic", label: "圖鑑 / 資訊圖", re: /infographic|diagram|chart|encyclopedia|knowledge card|map|圖鑑|百科|信息圖|資訊圖|流程圖|關係圖|地圖/i },
    { id: "product", label: "產品攝影", re: /product photography|product|commercial|packaging|brand|studio quality|產品|商品|包裝|品牌|棚拍/i },
    { id: "anime", label: "動漫 / 角色", re: /anime|manga|cosplay|character|cartoon|3d character|persona|角色|動漫|漫畫|卡通|二次元/i },
    { id: "watercolor", label: "水彩 / 東方", re: /watercolor|ink|paper cut|woodblock|etching|botanical|水彩|水墨|剪紙|版畫|蝕刻|東方|國風|新中式/i },
    { id: "game", label: "遊戲截圖", re: /game|minecraft|terraria|among us|pixel|rpg|browser game|遊戲|像素|截圖混搭/i },
    { id: "comparison", label: "比較測試", re: /comparison|compare|a\/b|\bvs\b|test|before and after|對比|比較|測試|細節展示/i },
    { id: "surreal", label: "超現實 / 奇幻", re: /surreal|dream|fantasy|nebula|cyberpunk|sci-fi|myth|超現實|夢幻|奇幻|科幻|賽博|神話/i },
    { id: "photo", label: "寫實攝影", re: /photorealistic|ultra-realistic|dslr|street photography|portrait|realistic|documentary|寫實|人像|攝影|紀實/i }
  ];

  const STYLE_PATTERNS = [
    { label: "35mm 底片顆粒", re: /35mm|film grain|analog|ccd|fujifilm|kodak/i },
    { label: "電影級寫實", re: /cinematic|movie|film still|dramatic/i },
    { label: "超寫實攝影", re: /photorealistic|ultra-realistic|realistic|dslr/i },
    { label: "海報與雜誌排版", re: /poster|typography|magazine|cover|flyer|海報|封面|排版/i },
    { label: "資訊圖 / 圖鑑", re: /infographic|diagram|encyclopedia|knowledge card|圖鑑|百科|信息圖|資訊圖/i },
    { label: "UI 原型截圖", re: /\bui\b|ux|dashboard|interface|website|screenshot|prototype|界面|截圖|主頁/i },
    { label: "動漫角色語彙", re: /anime|manga|cosplay|character|cartoon|persona|動漫|漫畫|角色/i },
    { label: "水彩與紙感", re: /watercolor|paper|botanical|水彩|紙|植物學/i },
    { label: "東方水墨 / 版畫", re: /ink|woodblock|etching|paper cut|水墨|剪紙|版畫|蝕刻|東方/i },
    { label: "遊戲畫面語境", re: /game|minecraft|terraria|among us|pixel|遊戲|像素/i },
    { label: "超現實奇幻", re: /surreal|fantasy|nebula|sci-fi|cyberpunk|超現實|奇幻|科幻|賽博/i }
  ];

  const LIGHT_PATTERNS = [
    { label: "霓虹混光", re: /neon|pink and blue|cyberpunk|霓虹/i },
    { label: "柔和窗光", re: /window light|natural light|soft diffused|柔和|自然光|窗光/i },
    { label: "直接閃光", re: /flash|on-camera flash|harsh direct|閃光/i },
    { label: "逆光 / 輪廓光", re: /backlight|rim light|silhouette|輪廓光|逆光|剪影/i },
    { label: "高對比陰影", re: /high contrast|deep shadow|dramatic shadow|強烈陰影|高對比/i },
    { label: "暖色環境光", re: /warm|lantern|ambient|golden hour|暖|燈籠|黃昏/i },
    { label: "棚拍控光", re: /studio|softbox|professional lighting|棚拍|攝影棚/i }
  ];

  const COMPOSITION_PATTERNS = [
    { label: "3x3 九宮格", re: /3x3|nine frames|grid collage|九宮格/i },
    { label: "直式社群構圖", re: /9\s*:\s*16|vertical|portrait orientation|直式|豎版/i },
    { label: "對稱中心構圖", re: /symmetrical|centered|front-facing|對稱|置中/i },
    { label: "特寫 / 半身", re: /close-up|medium shot|portrait shot|特寫|半身/i },
    { label: "全身 / 場景式", re: /full-body|wide shot|environment|全身|場景/i },
    { label: "等距 / 俯視", re: /isometric|top-down|bird.?s eye|俯視|等距/i },
    { label: "資訊分區版面", re: /module|section|panel|layout|分區|模塊|卡片/i }
  ];

  const CONSTRAINT_PATTERNS = [
    { label: "無浮水印", re: /no watermark|無浮水印/i },
    { label: "無多餘文字", re: /no text|without text|無文字/i },
    { label: "避免手部或肢體錯誤", re: /no extra limbs|deformed hands|extra fingers|肢體|手部/i },
    { label: "保留皮膚 / 材質細節", re: /skin texture|pores|fabric texture|material detail|皮膚紋理|材質/i },
    { label: "避免塑膠感 / 過度銳化", re: /no plastic|no digital over-sharpening|no airbrushing|塑膠|過度銳化/i }
  ];

  const state = {
    category: "poster",
    effect: "all",
    aspect: "all",
    query: "",
    sort: "source",
    selectedId: null
  };

  const dom = {
    searchInput: document.getElementById("searchInput"),
    caseCount: document.getElementById("caseCount"),
    sourceLink: document.getElementById("sourceLink"),
    sourceMeta: document.getElementById("sourceMeta"),
    categoryFilters: document.getElementById("categoryFilters"),
    effectFilters: document.getElementById("effectFilters"),
    aspectFilters: document.getElementById("aspectFilters"),
    resetFilters: document.getElementById("resetFilters"),
    sortSelect: document.getElementById("sortSelect"),
    resultTitle: document.getElementById("resultTitle"),
    activeSummary: document.getElementById("activeSummary"),
    gallery: document.getElementById("gallery"),
    emptyState: document.getElementById("emptyState"),
    detailPanel: document.getElementById("detailPanel"),
    toast: document.getElementById("toast")
  };

  const enrichedCases = sourceCases.map((item, index) => enrichCase(item, index));

  init();

  function init() {
    dom.caseCount.textContent = `${meta.caseCount || enrichedCases.length} 個案例`;
    dom.sourceLink.href = meta.sourceRepo || dom.sourceLink.href;
    dom.sourceMeta.textContent = `EvoLinkAI/awesome-gpt-image-2-prompts，${meta.license || "CC BY 4.0"}，commit ${meta.commitShort || "unknown"}，資料日期 ${meta.commitDate || "unknown"}。圖片以 GitHub raw URL 載入。`;

    renderFilters();
    bindEvents();
    const firstPoster = enrichedCases.find((item) => item.category === state.category);
    state.selectedId = firstPoster ? firstPoster.id : enrichedCases[0] && enrichedCases[0].id;
    render();
  }

  function bindEvents() {
    dom.searchInput.addEventListener("input", (event) => {
      state.query = event.target.value.trim();
      render();
    });

    dom.sortSelect.addEventListener("change", (event) => {
      state.sort = event.target.value;
      render();
    });

    dom.resetFilters.addEventListener("click", () => {
      state.category = "poster";
      state.effect = "all";
      state.aspect = "all";
      state.query = "";
      state.sort = "source";
      dom.searchInput.value = "";
      dom.sortSelect.value = "source";
      const firstPoster = enrichedCases.find((item) => item.category === state.category);
      state.selectedId = firstPoster ? firstPoster.id : enrichedCases[0] && enrichedCases[0].id;
      renderFilters();
      render();
    });

    dom.categoryFilters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      state.category = button.dataset.category;
      state.selectedId = null;
      renderFilters();
      render();
    });

    dom.effectFilters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-effect]");
      if (!button) return;
      state.effect = button.dataset.effect;
      state.selectedId = null;
      renderFilters();
      render();
    });

    dom.aspectFilters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-aspect]");
      if (!button) return;
      state.aspect = button.dataset.aspect;
      state.selectedId = null;
      renderFilters();
      render();
    });

    dom.gallery.addEventListener("click", (event) => {
      const button = event.target.closest("[data-case-id]");
      if (!button) return;
      state.selectedId = button.dataset.caseId;
      render();
    });

    dom.detailPanel.addEventListener("click", (event) => {
      const copyButton = event.target.closest("[data-copy-prompt]");
      if (!copyButton) return;
      const item = enrichedCases.find((entry) => entry.id === copyButton.dataset.copyPrompt);
      if (item) copyPrompt(item.prompt);
    });
  }

  function enrichCase(item, index) {
    const prompt = item.prompt || "";
    const haystack = `${item.title} ${item.categoryName} ${prompt}`;
    const effects = EFFECT_DEFS.filter((def) => def.re.test(haystack)).map((def) => def.id);
    const effectLabels = EFFECT_DEFS.filter((def) => effects.includes(def.id)).map((def) => def.label);
    const aspectTags = detectAspectTags(prompt, item.images.length);
    const formula = buildFormula(item, prompt);
    return {
      ...item,
      index,
      promptLength: prompt.length,
      imageCount: item.images.length,
      effects,
      effectLabels,
      aspectTags,
      formula,
      searchText: normalize(`${item.title} ${item.author} ${item.categoryName} ${prompt} ${effectLabels.join(" ")}`)
    };
  }

  function detectAspectTags(prompt, imageCount) {
    const tags = new Set();
    const matches = prompt.match(/(?:--ar|aspect ratio|aspect_ratio|ar)\s*[:=]?\s*["']?(\d+\s*:\s*\d+)/gi) || [];
    matches.forEach((match) => {
      const ratio = (match.match(/(\d+)\s*:\s*(\d+)/) || []).slice(1, 3).join(":");
      if (ratio) tags.add(ratio);
    });
    const looseRatios = prompt.match(/\b(?:9\s*:\s*16|16\s*:\s*9|1\s*:\s*1|4\s*:\s*3|3\s*:\s*4)\b/g) || [];
    looseRatios.forEach((ratio) => tags.add(ratio.replace(/\s+/g, "")));
    if (imageCount > 1 || /3x3|grid collage|nine frames|multi[-\s]?image|多圖|九宮格/i.test(prompt)) tags.add("多圖");
    if (!tags.size) tags.add("其他");
    return Array.from(tags);
  }

  function buildFormula(item, prompt) {
    const style = pickLabels(STYLE_PATTERNS, prompt, item.categoryName).slice(0, 2).join(" / ");
    const light = pickLabels(LIGHT_PATTERNS, prompt, "依 prompt 指定光影").slice(0, 2).join(" / ");
    const compositionParts = pickLabels(COMPOSITION_PATTERNS, prompt, "").slice(0, 2);
    const ratios = detectAspectTags(prompt, item.images.length).filter((tag) => tag !== "其他");
    const composition = [...ratios, ...compositionParts].slice(0, 3).join(" / ") || "依題材自動構圖";
    const constraints = pickLabels(CONSTRAINT_PATTERNS, prompt, "未特別標註").slice(0, 2).join(" / ");
    return [
      { key: "主體", value: item.title },
      { key: "風格", value: style },
      { key: "光影", value: light },
      { key: "構圖", value: composition },
      { key: "限制", value: constraints }
    ];
  }

  function pickLabels(patterns, text, fallback) {
    const labels = patterns.filter((item) => item.re.test(text)).map((item) => item.label);
    return labels.length ? labels : [fallback];
  }

  function renderFilters() {
    const categoryItems = [
      { id: "all", name: CATEGORY_LABELS.all, count: enrichedCases.length },
      ...CATEGORY_ORDER.map((id) => ({
        id,
        name: CATEGORY_LABELS[id],
        count: enrichedCases.filter((item) => item.category === id).length
      }))
    ];
    dom.categoryFilters.innerHTML = categoryItems.map((item) => `
      <button class="filter-button ${state.category === item.id ? "is-active" : ""}" type="button" data-category="${escapeAttr(item.id)}" aria-pressed="${state.category === item.id}">
        <span>${escapeHTML(item.name)}</span>
        <span class="count-pill">${item.count}</span>
      </button>
    `).join("");

    const effectItems = [{ id: "all", label: "全部" }, ...EFFECT_DEFS];
    dom.effectFilters.innerHTML = effectItems.map((item) => `
      <button class="chip-button ${state.effect === item.id ? "is-active" : ""}" type="button" data-effect="${escapeAttr(item.id)}" aria-pressed="${state.effect === item.id}">
        ${escapeHTML(item.label)}
      </button>
    `).join("");

    const aspectItems = ["all", "9:16", "16:9", "1:1", "4:3", "3:4", "多圖", "其他"];
    dom.aspectFilters.innerHTML = aspectItems.map((item) => `
      <button class="chip-button ${state.aspect === item ? "is-active" : ""}" type="button" data-aspect="${escapeAttr(item)}" aria-pressed="${state.aspect === item}">
        ${escapeHTML(item === "all" ? "全部" : item)}
      </button>
    `).join("");
  }

  function render() {
    const filtered = getFilteredCases();
    if (!filtered.some((item) => item.id === state.selectedId)) {
      state.selectedId = filtered[0] ? filtered[0].id : null;
    }

    dom.resultTitle.textContent = state.category === "all" ? "全部案例" : CATEGORY_LABELS[state.category];
    dom.activeSummary.innerHTML = buildSummary(filtered);
    dom.emptyState.hidden = filtered.length > 0;
    dom.gallery.innerHTML = filtered.map(renderCard).join("");
    renderDetail(filtered.find((item) => item.id === state.selectedId));
  }

  function getFilteredCases() {
    const query = normalize(state.query);
    let filtered = enrichedCases.filter((item) => {
      if (state.category !== "all" && item.category !== state.category) return false;
      if (state.effect !== "all" && !item.effects.includes(state.effect)) return false;
      if (state.aspect !== "all" && !item.aspectTags.includes(state.aspect)) return false;
      if (query && !item.searchText.includes(query)) return false;
      return true;
    });

    if (state.sort === "promptLength") {
      filtered = filtered.slice().sort((a, b) => b.promptLength - a.promptLength);
    } else if (state.sort === "imageCount") {
      filtered = filtered.slice().sort((a, b) => b.imageCount - a.imageCount || a.index - b.index);
    } else {
      filtered = filtered.slice().sort((a, b) => a.index - b.index);
    }
    return filtered;
  }

  function buildSummary(filtered) {
    const tokens = [
      `${filtered.length} 個符合案例`,
      state.category === "all" ? "全部分類" : CATEGORY_LABELS[state.category],
      state.effect === "all" ? "全部效果" : (EFFECT_DEFS.find((item) => item.id === state.effect) || {}).label,
      state.aspect === "all" ? "全部比例" : state.aspect
    ];
    if (state.query) tokens.push(`搜尋「${state.query}」`);
    return tokens.filter(Boolean).map((token) => `<span class="summary-token">${escapeHTML(token)}</span>`).join("");
  }

  function renderCard(item) {
    const formulaRows = item.formula.slice(1, 4).map((row) => `
      <div class="formula-row">
        <dt>${escapeHTML(row.key)}</dt>
        <dd>${escapeHTML(row.value)}</dd>
      </div>
    `).join("");
    const tags = item.effectLabels.slice(0, 3).join(" / ") || item.categoryName;
    const imageCount = item.imageCount > 1 ? `${item.imageCount} 張圖` : "單圖";
    return `
      <article class="case-card ${state.selectedId === item.id ? "is-selected" : ""}">
        <button class="card-button" type="button" data-case-id="${escapeAttr(item.id)}">
          <div class="thumb">
            <img src="${escapeAttr(item.images[0])}" alt="${escapeAttr(item.title)} output image" loading="lazy">
            <div class="thumb-meta">
              <span class="small-badge">${escapeHTML(item.aspectTags.slice(0, 2).join(" / "))}</span>
              <span class="small-badge">${escapeHTML(imageCount)}</span>
            </div>
          </div>
          <div class="card-body">
            <div class="case-meta">
              <span>${escapeHTML(item.categoryName)}</span>
              <span>@${escapeHTML(item.author)}</span>
            </div>
            <h3>${escapeHTML(item.title)}</h3>
            <p class="effect-line">${escapeHTML(tags)}</p>
            <dl class="formula-grid">${formulaRows}</dl>
          </div>
        </button>
      </article>
    `;
  }

  function renderDetail(item) {
    if (!item) {
      dom.detailPanel.innerHTML = `
        <div class="detail-empty">
          <p class="eyebrow">Prompt Lens</p>
          <h2>選一個案例看拆解</h2>
          <p>點選左側案例後，這裡會顯示輸出圖、prompt 公式、完整 prompt 與來源連結。</p>
        </div>
      `;
      return;
    }

    const formulaRows = item.formula.map((row) => `
      <div class="formula-row">
        <dt>${escapeHTML(row.key)}</dt>
        <dd>${escapeHTML(row.value)}</dd>
      </div>
    `).join("");
    const tags = [...item.effectLabels, ...item.aspectTags].slice(0, 8).map((tag) => `<span class="tag">${escapeHTML(tag)}</span>`).join("");
    const imageNote = item.imageCount > 1 ? `<span class="tag">共 ${item.imageCount} 張輸出圖</span>` : "";
    dom.detailPanel.innerHTML = `
      <div class="detail-hero">
        <img src="${escapeAttr(item.images[0])}" alt="${escapeAttr(item.title)} output image">
      </div>
      <div class="detail-content">
        <div class="detail-kicker">
          <span class="tag">${escapeHTML(item.categoryName)}</span>
          ${imageNote}
        </div>
        <h2 class="detail-title">${escapeHTML(item.title)}</h2>
        <p class="detail-meta">Case ${item.caseNumber} · @${escapeHTML(item.author)} · ${item.promptLength.toLocaleString()} chars</p>
        <div class="tag-list">${tags}</div>

        <section class="panel-block">
          <h3>Prompt 公式</h3>
          <dl class="formula-grid">${formulaRows}</dl>
        </section>

        <section class="panel-block">
          <h3>完整 Prompt</h3>
          <pre class="prompt-box">${escapeHTML(item.prompt)}</pre>
          <div class="detail-actions">
            <button class="action-button" type="button" data-copy-prompt="${escapeAttr(item.id)}">複製 Prompt</button>
            <a class="action-button secondary" href="${escapeAttr(item.sourceUrl)}" target="_blank" rel="noreferrer">開啟原始貼文</a>
            <a class="action-button secondary" href="${escapeAttr(item.images[0])}" target="_blank" rel="noreferrer">查看圖片</a>
          </div>
        </section>
      </div>
    `;
  }

  async function copyPrompt(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      showToast("Prompt 已複製");
    } catch (error) {
      showToast("無法自動複製，請手動選取 prompt");
    }
  }

  function showToast(message) {
    dom.toast.textContent = message;
    dom.toast.classList.add("is-visible");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => dom.toast.classList.remove("is-visible"), 1800);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().normalize("NFKC");
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(value) {
    return escapeHTML(value);
  }
})();
