import { initializeStoredValues } from "../utils";

document.addEventListener("DOMContentLoaded", async () => {
  const allowedHosts = new Set(["fcabr.net"]);
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeUrl = tabs[0]?.url || "";
  const activeHost = activeUrl ? new URL(activeUrl).hostname : "";

  if (!allowedHosts.has(activeHost) && !activeHost.endsWith(".fcabr.net")) {
    document.body.innerHTML = `
      <main class="popup" aria-labelledby="popup-title">
        <section class="card">
          <p class="eyebrow">Uso restrito</p>
          <h1 id="popup-title">FCABR Booster</h1>
          <p class="description">
            Esta extensao so funciona no dominio fcabr.net.
          </p>
        </section>
      </main>
    `;
    return;
  }

  await initializeStoredValues({});

  const button = document.querySelector('[data-action="demo"]');

  if (button) {
    button.addEventListener("click", () => {
      button.textContent = "Pronto para evoluir";
      button.disabled = true;
    });
  }
});
