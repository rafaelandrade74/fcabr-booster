import { initializeStoredValues } from "../utils";
import { DEFAULT_SETTINGS, MIN_RANKING_INTERVAL_MS } from "../utils/settings";

const DEFAULT_ACCORDION_GROUP = "patents";
const ACCORDION_STORAGE_KEY = "activeAccordionGroup";

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

function initAccordion(activeGroup) {
  const items = document.querySelectorAll(".accordion-item");

  items.forEach((item) => {
    const group = item.dataset.group;
    const trigger = item.querySelector(".accordion-trigger");

    if (group === activeGroup) {
      item.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
    }

    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      items.forEach((i) => {
        i.classList.remove("is-open");
        i.querySelector(".accordion-trigger").setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        chrome.storage.local.set({ [ACCORDION_STORAGE_KEY]: group });
      } else {
        chrome.storage.local.set({ [ACCORDION_STORAGE_KEY]: null });
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const popupContent = document.querySelector("[data-app]");
  const restrictedMessage = document.querySelector("[data-restricted]");
  const showNextPatentToggle = document.querySelector("#show-next-patent");
  const toggleLabel = document.querySelector("[data-switch-label]");
  const showExperienceRankingToggle = document.querySelector("#show-experience-ranking");
  const rankingToggleLabel = document.querySelector("[data-ranking-switch-label]");
  const rankingIntervalSelect = document.querySelector("#ranking-interval");
  const showFireteamClanRankToggle = document.querySelector("#show-fireteam-clan-rank");
  const fireteamClanLabel = document.querySelector("[data-fireteam-clan-label]");
  const showFireteamPlayerRankToggle = document.querySelector("#show-fireteam-player-rank");
  const fireteamPlayerLabel = document.querySelector("[data-fireteam-player-label]");
  const showFireteamPointsToggle = document.querySelector("#show-fireteam-points");
  const fireteamPointsLabel = document.querySelector("[data-fireteam-points-label]");
  const showFireteamPlayerPointsToggle = document.querySelector("#show-fireteam-player-points");
  const fireteamPlayerPointsLabel = document.querySelector("[data-fireteam-player-points-label]");
  const showFireteamPlayerXpToggle = document.querySelector("#show-fireteam-player-xp");
  const fireteamXpLabel = document.querySelector("[data-fireteam-xp-label]");
  const saveButton = document.querySelector("#save-settings");

  const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentPageUrl = activeTabs[0]?.url || "";
  const isAllowedPage = isAllowedHost(currentPageUrl);

  setElementVisibility(popupContent, !isAllowedPage);
  setElementVisibility(restrictedMessage, isAllowedPage);

  if (!isAllowedPage) {
    return;
  }

  const [storedSettings, accordionStorage] = await Promise.all([
    initializeStoredValues(DEFAULT_SETTINGS),
    chrome.storage.local.get(ACCORDION_STORAGE_KEY),
  ]);

  const activeGroup = accordionStorage[ACCORDION_STORAGE_KEY] ?? DEFAULT_ACCORDION_GROUP;
  initAccordion(activeGroup);

  renderToggleState(showNextPatentToggle, toggleLabel, Boolean(storedSettings.showNextPatent));
  renderToggleState(showExperienceRankingToggle, rankingToggleLabel, Boolean(storedSettings.showExperienceRanking));
  renderToggleState(showFireteamClanRankToggle, fireteamClanLabel, Boolean(storedSettings.showFireteamClanRank));
  renderToggleState(showFireteamPlayerRankToggle, fireteamPlayerLabel, Boolean(storedSettings.showFireteamPlayerRank));
  renderToggleState(showFireteamPointsToggle, fireteamPointsLabel, Boolean(storedSettings.showFireteamPoints));
  renderToggleState(showFireteamPlayerPointsToggle, fireteamPlayerPointsLabel, Boolean(storedSettings.showFireteamPlayerPoints));
  renderToggleState(showFireteamPlayerXpToggle, fireteamXpLabel, Boolean(storedSettings.showFireteamPlayerXp));

  if (rankingIntervalSelect) {
    const storedInterval = Number(storedSettings.rankingInterval);
    const safeInterval = Math.max(MIN_RANKING_INTERVAL_MS, storedInterval);
    rankingIntervalSelect.value = String(safeInterval);
    if (rankingIntervalSelect.value !== String(safeInterval)) {
      rankingIntervalSelect.value = String(MIN_RANKING_INTERVAL_MS);
    }
    if (safeInterval !== storedInterval) {
      await chrome.storage.local.set({ rankingInterval: safeInterval });
    }
  }

  showNextPatentToggle?.addEventListener("change", (event) => {
    renderToggleState(showNextPatentToggle, toggleLabel, event.target.checked);
  });

  showExperienceRankingToggle?.addEventListener("change", (event) => {
    renderToggleState(showExperienceRankingToggle, rankingToggleLabel, event.target.checked);
  });

  showFireteamClanRankToggle?.addEventListener("change", (event) => {
    renderToggleState(showFireteamClanRankToggle, fireteamClanLabel, event.target.checked);
  });

  showFireteamPlayerRankToggle?.addEventListener("change", (event) => {
    renderToggleState(showFireteamPlayerRankToggle, fireteamPlayerLabel, event.target.checked);
  });

  showFireteamPointsToggle?.addEventListener("change", (event) => {
    renderToggleState(showFireteamPointsToggle, fireteamPointsLabel, event.target.checked);
  });

  showFireteamPlayerPointsToggle?.addEventListener("change", (event) => {
    renderToggleState(showFireteamPlayerPointsToggle, fireteamPlayerPointsLabel, event.target.checked);
  });

  showFireteamPlayerXpToggle?.addEventListener("change", (event) => {
    renderToggleState(showFireteamPlayerXpToggle, fireteamXpLabel, event.target.checked);
  });

  saveButton?.addEventListener("click", async () => {
    await chrome.storage.local.set({
      showNextPatent: showNextPatentToggle?.checked ?? false,
      showExperienceRanking: showExperienceRankingToggle?.checked ?? false,
      showFireteamClanRank: showFireteamClanRankToggle?.checked ?? false,
      showFireteamPlayerRank: showFireteamPlayerRankToggle?.checked ?? false,
      showFireteamPoints: showFireteamPointsToggle?.checked ?? false,
      showFireteamPlayerPoints: showFireteamPlayerPointsToggle?.checked ?? false,
      showFireteamPlayerXp: showFireteamPlayerXpToggle?.checked ?? false,
      rankingInterval: Number(rankingIntervalSelect?.value ?? 600000),
    });

    const activeTab = activeTabs[0];

    if (activeTab?.id) {
      await chrome.tabs.reload(activeTab.id);
    }

    window.close();
  });
});
