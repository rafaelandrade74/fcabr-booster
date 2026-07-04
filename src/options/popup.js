import { initializeStoredValues } from "../utils";
import { DEFAULT_SETTINGS } from "../utils/settings";

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
  const isShowNextPatentEnabled = Boolean(storedSettings.showNextPatent);

  renderToggleState(showNextPatentToggle, toggleLabel, isShowNextPatentEnabled);

  showNextPatentToggle?.addEventListener("change", (event) => {
    const isEnabled = event.target.checked;
    renderToggleState(showNextPatentToggle, toggleLabel, isEnabled);
  });

  saveButton?.addEventListener("click", async () => {
    const isEnabled = showNextPatentToggle?.checked ?? false;

    await chrome.storage.local.set({
      showNextPatent: isEnabled,
    });

    const activeTab = activeTabs[0];

    if (activeTab?.id) {
      await chrome.tabs.reload(activeTab.id);
    }

    window.close();
  });
});
