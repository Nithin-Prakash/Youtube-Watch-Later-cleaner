const clearButton = document.getElementById("clearButton");
const stopButton = document.getElementById("stopButton");
const selectButton = document.getElementById("selectButton");
const removeSelectedButton = document.getElementById("removeSelectedButton");
const clearSelectionButton = document.getElementById("clearSelectionButton");
const statusNode = document.getElementById("status");
const selectedCountNode = document.getElementById("selectedCount");

function setStatus(message) {
  statusNode.textContent = message;
}

function renderState(state) {
  if (!state?.ok) {
    setStatus(state?.message || "Open the YouTube Watch Later playlist first.");
    return;
  }

  if (!state.isWatchLaterPage) {
    setStatus("Open the YouTube Watch Later playlist first.");
    selectedCountNode.textContent = `${state.selectedCount || 0} selected`;
    clearButton.disabled = true;
    selectButton.disabled = true;
    removeSelectedButton.disabled = true;
    clearSelectionButton.disabled = true;
    stopButton.disabled = true;
    return;
  }

  setStatus(state.message || "Ready.");
  selectedCountNode.textContent = `${state.selectedCount || 0} selected`;

  clearButton.disabled = state.isRunning;
  selectButton.disabled = state.isRunning;
  removeSelectedButton.disabled = state.isRunning || !state.selectedCount;
  clearSelectionButton.disabled = state.isRunning || !state.selectedCount;
  stopButton.disabled = !state.isRunning;
  selectButton.textContent = state.selectionMode ? "Done selecting" : "Select videos on page";
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function sendCommand(type, payload = {}) {
  const tab = await getActiveTab();

  if (!tab || !tab.id || !/^https:\/\/(www\.|m\.)?youtube\.com\//.test(tab.url || "")) {
    return { ok: false, message: "Open the YouTube Watch Later playlist first." };
  }

  return chrome.tabs.sendMessage(tab.id, { type, ...payload });
}

async function refreshStatus() {
  try {
    renderState(await sendCommand("watchLaterCleaner:getStatus"));
  } catch (_error) {
    renderState({ ok: false, message: "Reload the YouTube tab, then try again." });
  }
}

async function runCommand(type, pendingMessage, payload) {
  setStatus(pendingMessage);

  try {
    renderState(await sendCommand(type, payload));
  } catch (_error) {
    renderState({ ok: false, message: "Reload the YouTube tab, then try again." });
  }
}

clearButton.addEventListener("click", () => {
  runCommand("watchLaterCleaner:start", "Removal in progress...");
});

stopButton.addEventListener("click", () => {
  runCommand("watchLaterCleaner:stop", "Stopping...");
});

selectButton.addEventListener("click", () => {
  runCommand("watchLaterCleaner:selectMode", "Updating selection mode...");
});

removeSelectedButton.addEventListener("click", () => {
  runCommand("watchLaterCleaner:startSelected", "Removal in progress for selected videos...");
});

clearSelectionButton.addEventListener("click", () => {
  runCommand("watchLaterCleaner:clearSelection", "Clearing selection...");
});

refreshStatus();
setInterval(refreshStatus, 1000);
