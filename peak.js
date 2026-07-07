const PEAK_URL = "https://script.google.com/macros/s/AKfycbyxw5MeRedkRkW7EKLGYMrTF2S2RfyG7OPSHTjjvi45zW_XTb3ast0ecfLFPuydgqGH/exec";

const $ = (id) => document.getElementById(id);

function jsonp(action, params = {}) {
  return new Promise((resolve, reject) => {
    const callbackName =
      "idealbroPeak_" + Date.now() + "_" + Math.floor(Math.random() * 100000);

    window[callbackName] = (response) => {
      delete window[callbackName];
      script.remove();
      resolve(response);
    };

    const searchParams = new URLSearchParams({
      action,
      callback: callbackName,
      ...params
    });

    const script = document.createElement("script");
    script.src = PEAK_URL + "?" + searchParams.toString();
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

async function unlock() {
  const code = $("codeInput").value.trim();

  $("errorText").classList.add("hidden");
  $("unlockBtn").textContent = "Проверяем...";
  $("unlockBtn").disabled = true;

  const response = await jsonp("getMission", { code });

  $("unlockBtn").textContent = "Открыть задание →";
  $("unlockBtn").disabled = false;

  if (!response.ok) {
    $("errorText").classList.remove("hidden");
    return;
  }

  $("missionName").textContent = response.name || "Secret Mission";
  $("missionText").textContent = response.mission;

  if ($("missionBiome")) {
    $("missionBiome").textContent = response.biome
      ? `Биом: ${response.biome}`
      : "";
  }

  $("lockCard").classList.add("hidden");
  $("missionCard").classList.remove("hidden");

  sessionStorage.setItem("idealbro-peak-unlocked", "yes");
  sessionStorage.setItem("idealbro-peak-code", code);
}

$("unlockBtn").addEventListener("click", unlock);

$("codeInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") unlock();
});
