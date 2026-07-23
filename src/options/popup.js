import { initializeStoredValues } from "../utils";
import { DEFAULT_SETTINGS, MIN_RANKING_INTERVAL_MS, MIN_FIRETEAM_INTERVAL_MS } from "../utils/settings";

function isAllowedHost(url) {
  if (!url) {
    return false;
  }

  try {
    const hostname = new URL(url).hostname;
    return hostname === "fcabr.net" || hostname.endsWith(".fcabr.net");
  } catch {
    return false;
  }
}

function setElementVisibility(element, isHidden) {
  if (element) {
    element.hidden = isHidden;
  }
}

function renderToggleState(toggleElement, labelElement, isEnabled) {
  if (toggleElement) {
    toggleElement.checked = isEnabled;
  }

  if (labelElement) {
    labelElement.textContent = isEnabled ? "Ativado" : "Desativado";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const popupContent = document.querySelector("[data-app]");
  const restrictedMessage = document.querySelector("[data-restricted]");
  const showNextPatentToggle = document.querySelector("#show-next-patent");
  const toggleLabel = document.querySelector("[data-switch-label]");
  const showExperienceRankingToggle = document.querySelector("#show-experience-ranking");
  const rankingToggleLabel = document.querySelector("[data-ranking-switch-label]");
  const rankingIntervalSelect = document.querySelector("#ranking-interval");
  const showFireteamRankingToggle = document.querySelector("#show-fireteam-ranking");
  const fireteamToggleLabel = document.querySelector("[data-fireteam-switch-label]");
  const fireteamRankingIntervalSelect = document.querySelector("#fireteam-ranking-interval");
  const saveButton = document.querySelector("#save-settings");

  const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentPageUrl = activeTabs[0]?.url || "";
  const isAllowedPage = isAllowedHost(currentPageUrl);

  setElementVisibility(popupContent, !isAllowedPage);
  setElementVisibility(restrictedMessage, isAllowedPage);

  if (!isAllowedPage) {
    return;
  }

  const storedSettings = await initializeStoredValues(DEFAULT_SETTINGS);

  renderToggleState(showNextPatentToggle, toggleLabel, Boolean(storedSettings.showNextPatent));
  renderToggleState(showExperienceRankingToggle, rankingToggleLabel, Boolean(storedSettings.showExperienceRanking));
  renderToggleState(showFireteamRankingToggle, fireteamToggleLabel, Boolean(storedSettings.showFireteamRanking));

  if (rankingIntervalSelect) {
    const storedInterval = Number(storedSettings.experienceRankingInterval);
    const safeInterval = Math.max(MIN_RANKING_INTERVAL_MS, storedInterval);
    rankingIntervalSelect.value = String(safeInterval);
    if (rankingIntervalSelect.value !== String(safeInterval)) {
      rankingIntervalSelect.value = String(MIN_RANKING_INTERVAL_MS);
    }
    if (safeInterval !== storedInterval) {
      await chrome.storage.local.set({ experienceRankingInterval: safeInterval });
    }
  }

  if (fireteamRankingIntervalSelect) {
    const storedInterval = Number(storedSettings.fireteamRankingInterval);
    const safeInterval = Math.max(MIN_FIRETEAM_INTERVAL_MS, storedInterval);
    fireteamRankingIntervalSelect.value = String(safeInterval);
    if (fireteamRankingIntervalSelect.value !== String(safeInterval)) {
      fireteamRankingIntervalSelect.value = String(MIN_FIRETEAM_INTERVAL_MS);
    }
    if (safeInterval !== storedInterval) {
      await chrome.storage.local.set({ fireteamRankingInterval: safeInterval });
    }
  }

  showNextPatentToggle?.addEventListener("change", (event) => {
    renderToggleState(showNextPatentToggle, toggleLabel, event.target.checked);
  });

  showExperienceRankingToggle?.addEventListener("change", (event) => {
    renderToggleState(showExperienceRankingToggle, rankingToggleLabel, event.target.checked);
  });

  showFireteamRankingToggle?.addEventListener("change", (event) => {
    renderToggleState(showFireteamRankingToggle, fireteamToggleLabel, event.target.checked);
  });

  saveButton?.addEventListener("click", async () => {
    await chrome.storage.local.set({
      showNextPatent: showNextPatentToggle?.checked ?? false,
      showExperienceRanking: showExperienceRankingToggle?.checked ?? false,
      experienceRankingInterval: Number(rankingIntervalSelect?.value ?? 600000),
      showFireteamRanking: showFireteamRankingToggle?.checked ?? false,
      fireteamRankingInterval: Number(fireteamRankingIntervalSelect?.value ?? 600000),
    });

    const activeTab = activeTabs[0];

    if (activeTab?.id) {
      await chrome.tabs.reload(activeTab.id);
    }

    window.close();
  });
});
