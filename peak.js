const PEAK_URL = "https://script.google.com/macros/s/AKfycbyxw5MeRedkRkW7EKLGYMrTF2S2RfyG7OPSHTjjvi45zW_XTb3ast0ecfLFPuydgqGH/exec";

const $ = (id) => document.getElementById(id);

let missions = [];

function normalize(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/Ё/g, "Е")
    .replace(/\s+/g, "");
}

function jsonp(action, params = {}, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const callbackName =
      "idealbroPeak_" +
      Date.now() +
      "_" +
      Math.floor(Math.random() * 100000);

    const script = document.createElement("script");

    const timer = setTimeout(() => {
      delete window[callbackName];
      script.remove();
      reject(new Error("Request timeout"));
    }, timeout);

    window[callbackName] = (response) => {
      clearTimeout(timer);
      delete window[callbackName];
      script.remove();
      resolve(response);
    };

    const searchParams = new URLSearchParams({
      action,
      callback: callbackName,
      ...params
    });

    script.src = PEAK_URL + "?" + searchParams.toString();

    script.onerror = () => {
      clearTimeout(timer);
      delete window[callbackName];
      script.remove();
      reject(new Error("Request failed"));
    };

    document.body.appendChild(script);
  });
}

async function jsonpWithRetry(action, params = {}) {
  try {
    return await jsonp(action, params, 8000);
  } catch (error) {
    console.warn("Первый запрос не удался. Повторяем...", error);
    return await jsonp(action, params, 8000);
  }
}

async function loadProtocol() {
  const accessCode = $("accessInput").value.trim();

  $("accessErrorText").classList.add("hidden");
  $("accessBtn").textContent = "Загружаем...";
  $("accessBtn").disabled = true;

  try {
    const cached = sessionStorage.getItem("idealbro-peak-missions");

    if (cached) {
      missions = JSON.parse(cached);

      $("accessCard").classList.add("hidden");
      $("lockCard").classList.remove("hidden");
      $("codeInput").focus();

      return;
    }

    const response = await jsonpWithRetry("loadMissions", { accessCode });

    if (!response.ok) {
      $("accessErrorText").textContent = "Код доступа неверный.";
      $("accessErrorText").classList.remove("hidden");
      return;
    }

    missions = response.missions || [];

    sessionStorage.setItem(
      "idealbro-peak-missions",
      JSON.stringify(missions)
    );

    $("accessCard").classList.add("hidden");
    $("lockCard").classList.remove("hidden");
    $("codeInput").focus();

  } catch (e) {
    console.error(e);

    $("accessErrorText").textContent =
      "Не удалось загрузить протокол. Попробуй ещё раз.";

    $("accessErrorText").classList.remove("hidden");

  } finally {
    $("accessBtn").textContent = "Загрузить протокол →";
    $("accessBtn").disabled = false;
  }
}

function unlock() {
  const code = normalize($("codeInput").value);

  $("errorText").classList.add("hidden");

  const mission = missions.find(item => normalize(item.code) === code);

  if (!mission) {
    $("errorText").textContent = "Код задания не найден.";
    $("errorText").classList.remove("hidden");
    return;
  }

  $("missionName").textContent = mission.name || "Secret Mission";
  $("missionText").textContent = mission.mission;

  if ($("missionBiome")) {
    $("missionBiome").textContent = mission.biome
      ? `Биом: ${mission.biome}`
      : "";
  }

  $("lockCard").classList.add("hidden");
  $("missionCard").classList.remove("hidden");

  sessionStorage.setItem("idealbro-peak-unlocked", "yes");
  sessionStorage.setItem("idealbro-peak-code", code);
}

function newCode() {
  $("missionCard").classList.add("hidden");
  $("lockCard").classList.remove("hidden");

  $("codeInput").value = "";
  $("errorText").classList.add("hidden");

  $("codeInput").focus();
}

$("accessBtn").addEventListener("click", loadProtocol);
$("unlockBtn").addEventListener("click", unlock);
$("newCodeBtn").addEventListener("click", newCode);

$("accessInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") loadProtocol();
});

$("codeInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") unlock();
});

const cached = sessionStorage.getItem("idealbro-peak-missions");

if (cached) {
  missions = JSON.parse(cached);
  $("accessCard").classList.add("hidden");
  $("lockCard").classList.remove("hidden");
}
