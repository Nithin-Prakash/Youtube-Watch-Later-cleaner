(() => {
  const PANEL_ID = "watch-later-cleaner-panel";
  const ITEM_SELECTOR = "ytd-playlist-video-renderer, ytd-playlist-panel-video-renderer";
  const MENU_ITEM_SELECTOR = "ytd-menu-service-item-renderer, tp-yt-paper-item, yt-list-item-view-model";
  const SELECTOR_CLASS = "wlc-selector";
  const SELECTED_CLASS = "wlc-item-selected";
  const MAX_EMPTY_SCROLLS = 10;
  const MAX_REMOVALS = 10000;

  let isRunning = false;
  let stopRequested = false;
  let selectionMode = false;
  let selectedVideoIds = new Set();
  let currentStatus = "Ready to remove videos from Watch Later.";
  let currentMode = "idle";
  let panel;
  let statusNode;
  let selectedCountNode;
  let clearAllButton;
  let selectButton;
  let removeSelectedButton;
  let stopButton;

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function isVisible(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
  }

  function isWatchLaterPage() {
    const url = new URL(window.location.href);
    return /(^|\.)youtube\.com$/.test(url.hostname) && url.searchParams.get("list") === "WL";
  }

  function getVideoId(item) {
    const anchor = item.querySelector('a[href*="/watch"]');
    if (!anchor) return "";

    try {
      return new URL(anchor.href, window.location.href).searchParams.get("v") || "";
    } catch (_error) {
      return "";
    }
  }

  function getVisiblePlaylistItems() {
    return [...document.querySelectorAll(ITEM_SELECTOR)].filter(isVisible);
  }

  function setStatus(message) {
    currentStatus = message;
    ensurePanel();
    statusNode.textContent = message;
  }

  function getStatus() {
    return {
      ok: true,
      isRunning,
      isWatchLaterPage: isWatchLaterPage(),
      mode: currentMode,
      selectionMode,
      selectedCount: selectedVideoIds.size,
      message: currentStatus
    };
  }

  function updateSelectedCount() {
    ensurePanel();
    selectedCountNode.textContent = `${selectedVideoIds.size} selected`;
    removeSelectedButton.disabled = isRunning || selectedVideoIds.size === 0;
  }

  function setRunningState(running) {
    ensurePanel();
    clearAllButton.disabled = running;
    selectButton.disabled = running;
    removeSelectedButton.disabled = running || selectedVideoIds.size === 0;
    stopButton.disabled = !running;
  }

  function syncSelectionControls() {
    ensurePanel();
    panel.classList.toggle("wlc-selection-active", selectionMode);
    selectButton.textContent = selectionMode ? "Done selecting" : "Select videos";
    updateSelectedCount();
    renderSelectionControls();
  }

  function requestStop() {
    if (!isRunning) {
      setStatus("Cleaner is not running.");
      return getStatus();
    }

    stopRequested = true;
    setStatus("Stopping after the current video...");
    return getStatus();
  }

  function ensurePanel() {
    panel = document.getElementById(PANEL_ID);
    if (panel) {
      statusNode = panel.querySelector(".wlc-status");
      selectedCountNode = panel.querySelector(".wlc-selected-count");
      clearAllButton = panel.querySelector("[data-wlc-clear-all]");
      selectButton = panel.querySelector("[data-wlc-select]");
      removeSelectedButton = panel.querySelector("[data-wlc-remove-selected]");
      stopButton = panel.querySelector("[data-wlc-stop]");
      return panel;
    }

    panel = document.createElement("aside");
    panel.id = PANEL_ID;
    panel.hidden = !isWatchLaterPage();
    panel.innerHTML = [
      '<p class="wlc-title">Youtube Watch Later cleaner</p>',
      '<p class="wlc-status">Ready to remove videos from Watch Later.</p>',
      '<p class="wlc-selected-count">0 selected</p>',
      '<div class="wlc-actions">',
      '<button class="wlc-button wlc-button-primary" data-wlc-clear-all type="button">Clear all</button>',
      '<button class="wlc-button wlc-button-secondary" data-wlc-select type="button">Select videos</button>',
      '<button class="wlc-button wlc-button-primary" data-wlc-remove-selected type="button">Remove selected</button>',
      '<button class="wlc-button wlc-button-secondary" data-wlc-stop type="button">Stop</button>',
      "</div>"
    ].join("");

    document.body.appendChild(panel);
    statusNode = panel.querySelector(".wlc-status");
    selectedCountNode = panel.querySelector(".wlc-selected-count");
    clearAllButton = panel.querySelector("[data-wlc-clear-all]");
    selectButton = panel.querySelector("[data-wlc-select]");
    removeSelectedButton = panel.querySelector("[data-wlc-remove-selected]");
    stopButton = panel.querySelector("[data-wlc-stop]");

    clearAllButton.addEventListener("click", () => {
      startCleaning("all");
    });

    selectButton.addEventListener("click", () => {
      toggleSelectionMode();
    });

    removeSelectedButton.addEventListener("click", () => {
      startCleaning("selected");
    });

    stopButton.addEventListener("click", () => {
      requestStop();
    });

    syncSelectionControls();
    setRunningState(isRunning);
    return panel;
  }

  function updatePanelVisibility() {
    ensurePanel();
    panel.hidden = !isWatchLaterPage();
  }

  function renderSelectionControls() {
    for (const item of getVisiblePlaylistItems()) {
      const videoId = getVideoId(item);
      const existing = item.querySelector(`.${SELECTOR_CLASS}`);

      if (!selectionMode || !videoId) {
        existing?.remove();
        item.classList.remove(SELECTED_CLASS);
        continue;
      }

      item.classList.toggle(SELECTED_CLASS, selectedVideoIds.has(videoId));

      if (existing) {
        const input = existing.querySelector("input");
        input.checked = selectedVideoIds.has(videoId);
        continue;
      }

      const label = document.createElement("label");
      label.className = SELECTOR_CLASS;
      label.innerHTML = '<input type="checkbox"> <span class="wlc-check-mark"></span> <span>Select</span>';

      const input = label.querySelector("input");
      input.checked = selectedVideoIds.has(videoId);
      input.addEventListener("click", (event) => {
        event.stopPropagation();
      });
      input.addEventListener("change", () => {
        if (input.checked) {
          selectedVideoIds.add(videoId);
        } else {
          selectedVideoIds.delete(videoId);
        }

        item.classList.toggle(SELECTED_CLASS, input.checked);
        updateSelectedCount();
      });

      item.prepend(label);
    }
  }

  function toggleSelectionMode(forceValue) {
    if (isRunning) return getStatus();

    selectionMode = typeof forceValue === "boolean" ? forceValue : !selectionMode;

    if (selectionMode) {
      setStatus("Selection mode enabled. Pick videos, then remove selected.");
    } else {
      setStatus(`${selectedVideoIds.size} video${selectedVideoIds.size === 1 ? "" : "s"} selected.`);
    }

    syncSelectionControls();
    return getStatus();
  }

  function clearSelection() {
    selectedVideoIds = new Set();
    setStatus("Selection cleared.");
    syncSelectionControls();
    return getStatus();
  }

  function getMenuButton(item) {
    const candidates = [
      ...item.querySelectorAll("button, yt-icon-button, tp-yt-paper-icon-button")
    ];

    return candidates.find((candidate) => {
      const label = [
        candidate.getAttribute("aria-label"),
        candidate.getAttribute("title"),
        candidate.textContent
      ].filter(Boolean).join(" ");
      return /action menu|more actions|more/i.test(label);
    }) || item.querySelector("ytd-menu-renderer button");
  }

  function getOpenMenuItems() {
    return [...document.querySelectorAll(MENU_ITEM_SELECTOR)].filter(isVisible);
  }

  function findRemoveAction() {
    return getOpenMenuItems().find((item) => {
      const text = item.innerText || item.textContent || "";
      return /remove from watch later|remove from playlist/i.test(text);
    });
  }

  async function waitFor(predicate, timeout = 3000, interval = 100) {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      const value = predicate();
      if (value) return value;
      await delay(interval);
    }
    return null;
  }

  async function openVideoMenu(item) {
    item.scrollIntoView({ block: "center" });
    await delay(150);

    const menuButton = getMenuButton(item);
    if (!menuButton) return false;

    menuButton.click();
    return Boolean(await waitFor(findRemoveAction, 2500));
  }

  async function removeItem(item) {
    const opened = await openVideoMenu(item);
    if (!opened) return false;

    const removeAction = findRemoveAction();
    if (!removeAction) return false;

    removeAction.click();
    await waitFor(() => !document.body.contains(item) || !isVisible(item), 4000);
    await delay(350);
    return true;
  }

  async function scrollForMoreItems() {
    const before = getVisiblePlaylistItems().map(getVideoId).filter(Boolean).join(",");
    window.scrollBy({ top: Math.max(window.innerHeight * 0.8, 500), behavior: "auto" });
    await delay(900);
    renderSelectionControls();
    const after = getVisiblePlaylistItems().map(getVideoId).filter(Boolean).join(",");
    return before !== after;
  }

  function getNextItem(mode) {
    const items = getVisiblePlaylistItems();
    if (mode === "selected") {
      return items.find((item) => selectedVideoIds.has(getVideoId(item))) || null;
    }

    return items[0] || null;
  }

  async function startCleaning(mode = "all") {
    ensurePanel();

    if (isRunning) {
      setStatus("Removal in progress...");
      return getStatus();
    }

    if (!isWatchLaterPage()) {
      panel.hidden = false;
      setStatus("Open https://www.youtube.com/playlist?list=WL first.");
      return getStatus();
    }

    if (mode === "selected" && selectedVideoIds.size === 0) {
      setStatus("Select at least one video first.");
      toggleSelectionMode(true);
      return getStatus();
    }

    isRunning = true;
    stopRequested = false;
    currentMode = mode;
    selectionMode = false;
    setRunningState(true);
    syncSelectionControls();
    setStatus(mode === "selected" ? "Removal in progress for selected videos..." : "Removal in progress...");

    if (mode === "selected") {
      window.scrollTo({ top: 0, behavior: "auto" });
      await delay(700);
    }

    let removed = 0;
    let emptyScrolls = 0;

    try {
      while (!stopRequested && removed < MAX_REMOVALS) {
        const item = getNextItem(mode);

        if (!item) {
          const shouldStopSelected = mode === "selected" && selectedVideoIds.size === 0;
          if (shouldStopSelected) break;

          const foundMore = await scrollForMoreItems();
          emptyScrolls = foundMore ? 0 : emptyScrolls + 1;

          if (emptyScrolls >= MAX_EMPTY_SCROLLS) break;
          setStatus(mode === "selected" ? "Looking for selected videos..." : "Looking for more videos...");
          continue;
        }

        const videoId = getVideoId(item);
        setStatus(`Removal in progress. Removing video ${removed + 1}...`);

        const didRemove = await removeItem(item);
        if (didRemove) {
          removed += 1;
          emptyScrolls = 0;
          if (videoId) selectedVideoIds.delete(videoId);
          updateSelectedCount();
          setStatus(`Removal in progress. Removed ${removed} video${removed === 1 ? "" : "s"}...`);
        } else {
          item.scrollIntoView({ block: "end" });
          await delay(300);
          window.scrollBy({ top: 240, behavior: "auto" });
          emptyScrolls += 1;
        }
      }

      if (stopRequested) {
        setStatus(`Stopped. Removed ${removed} video${removed === 1 ? "" : "s"}.`);
      } else if (mode === "selected" && selectedVideoIds.size > 0) {
        setStatus(`Done. Removed ${removed} video${removed === 1 ? "" : "s"}. ${selectedVideoIds.size} selected video${selectedVideoIds.size === 1 ? "" : "s"} could not be found.`);
      } else {
        setStatus(`Done. Removed ${removed} video${removed === 1 ? "" : "s"}.`);
      }
    } finally {
      isRunning = false;
      currentMode = "idle";
      setRunningState(false);
      syncSelectionControls();
    }

    return getStatus();
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "watchLaterCleaner:getStatus") {
      sendResponse(getStatus());
      return false;
    }

    if (message?.type === "watchLaterCleaner:stop") {
      sendResponse(requestStop());
      return false;
    }

    if (message?.type === "watchLaterCleaner:selectMode") {
      sendResponse(toggleSelectionMode(message.enabled));
      return false;
    }

    if (message?.type === "watchLaterCleaner:clearSelection") {
      sendResponse(clearSelection());
      return false;
    }

    if (message?.type === "watchLaterCleaner:startSelected") {
      startCleaning("selected");
      sendResponse(getStatus());
      return false;
    }

    if (message?.type === "watchLaterCleaner:start") {
      startCleaning("all");
      sendResponse(getStatus());
      return false;
    }

    return false;
  });

  ensurePanel();
  updatePanelVisibility();

  let lastUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      updatePanelVisibility();
    }

    if (selectionMode) renderSelectionControls();
  }, 700);
})();
