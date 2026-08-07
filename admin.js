const SHEETS_URL = "https://script.google.com/macros/s/AKfycbybdZ7saSVOPyAm5TdZP0qz1eFQg_wJO_-eAV3J8PnKfqecP8PCktjeUNWUMP7wWkc/exec";

const REQUIRED_PLAYERS = 6;
const ADMIN_CACHE_KEY = "idealbro-admin-day1-cache-v1";
const REQUEST_TIMEOUT = 15000;

let currentSource = "real";
let selectedGame = 1;

let state = {
  players: [],
  groups: [],
  pairs: []
};

const $ = (id) => document.getElementById(id);

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function jsonp(action, params = {}, timeoutMs = REQUEST_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const callbackName =
      "idealbroAdmin_" + Date.now() + "_" + Math.floor(Math.random() * 100000);

    const script = document.createElement("script");
    let settled = false;

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Apps Script не ответил вовремя."));
    }, timeoutMs);

    function cleanup() {
      if (settled) return;

      settled = true;
      clearTimeout(timer);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (response) => {
      cleanup();
      resolve(response);
    };

    const searchParams = new URLSearchParams({
      action,
      callback: callbackName,
      ...params
    });

    script.src = SHEETS_URL + "?" + searchParams.toString();
    script.onerror = () => {
      cleanup();
      reject(new Error("Не удалось подключиться к Apps Script."));
    };

    document.body.appendChild(script);
  });
}

async function requestAdmin(action, params = {}, attempts = 2) {
  let lastError;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const response = await jsonp(action, params);

      if (
        response &&
        response.ok === false &&
        response.error === "BUSY" &&
        attempt < attempts - 1
      ) {
        await sleep(700 + attempt * 500);
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;

      if (attempt < attempts - 1) {
        await sleep(700 + attempt * 500);
      }
    }
  }

  throw lastError || new Error("Apps Script недоступен.");
}

function normalizeState(data = {}) {
  return {
    players: Array.isArray(data.players) ? data.players : [],
    groups: Array.isArray(data.groups) ? data.groups : [],
    pairs: Array.isArray(data.pairs) ? data.pairs : []
  };
}

function saveAdminCache() {
  try {
    localStorage.setItem(
      ADMIN_CACHE_KEY,
      JSON.stringify({
        savedAt: new Date().toISOString(),
        source: currentSource,
        state: normalizeState(state)
      })
    );
  } catch (error) {
    console.warn("Не удалось сохранить локальную копию админки.", error);
  }
}

function clearAdminCache() {
  try {
    localStorage.removeItem(ADMIN_CACHE_KEY);
  } catch (error) {
    console.warn("Не удалось очистить локальную копию админки.", error);
  }
}

function getAdminCache() {
  try {
    const raw = localStorage.getItem(ADMIN_CACHE_KEY);
    if (!raw) return null;

    const cached = JSON.parse(raw);
    if (!cached || cached.source !== currentSource) return null;

    return {
      ...cached,
      state: normalizeState(cached.state)
    };
  } catch (error) {
    console.warn("Не удалось прочитать локальную копию админки.", error);
    return null;
  }
}

function formatCacheDate(value) {
  if (!value) return "неизвестное время";

  try {
    return new Date(value).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "неизвестное время";
  }
}

function restoreAdminCache(statusTargetId, actionName) {
  const cached = getAdminCache();
  if (!cached) return false;

  state = cached.state;
  renderAll();

  $(statusTargetId).textContent =
    `${actionName}: Apps Script не ответил. Показана локальная копия от ${formatCacheDate(cached.savedAt)}.`;

  return true;
}

function showAdminError(targetId, message, error) {
  console.error(error);
  $(targetId).textContent = message;
}

async function runLoader(
  targetId,
  requestPromise,
  lines,
  minDuration = 5000
) {
  const target = $(targetId);

  target.innerHTML = `
    <div class="inline-loader">
      <div class="loader-ring"></div>
      <p class="inline-loader-text">${lines[0]}</p>
      <div class="loader-progress">
        <div class="loader-progress-bar"></div>
      </div>
    </div>
  `;

  const text = target.querySelector(".inline-loader-text");
  const bar = target.querySelector(".loader-progress-bar");

  const startedAt = Date.now();
  const stepDuration = minDuration / lines.length;

  const animationPromise = (async () => {
    for (let i = 0; i < lines.length; i++) {
      text.textContent = lines[i];

      bar.style.width =
        `${Math.round(((i + 1) / lines.length) * 100)}%`;

      await sleep(stepDuration);
    }
  })();

  let response;
  let requestError;

  try {
    response = await requestPromise;
  } catch (error) {
    requestError = error;
  }

  const elapsed = Date.now() - startedAt;
  const remaining = Math.max(0, minDuration - elapsed);

  await Promise.all([
    animationPromise,
    sleep(remaining)
  ]);

  target.innerHTML = "";

  if (requestError) throw requestError;

  return response;
}

function showSparks(targetId) {
  const target = $(targetId);
  const sparks = document.createElement("div");
  sparks.className = "gold-sparks";

  for (let i = 0; i < 18; i++) {
    const spark = document.createElement("span");
    spark.className = "gold-spark";

    spark.style.left = `${45 + Math.random() * 10}%`;
    spark.style.top = `${45 + Math.random() * 10}%`;
    spark.style.setProperty("--x", `${-90 + Math.random() * 180}px`);
    spark.style.setProperty("--y", `${-70 + Math.random() * 140}px`);
    spark.style.animationDelay = `${Math.random() * .15}s`;

    sparks.appendChild(spark);
  }

  target.appendChild(sparks);

  setTimeout(() => sparks.remove(), 900);
}

function validatePlayers(players) {
  if (players.length !== REQUIRED_PLAYERS) {
    return `Нужно ровно ${REQUIRED_PLAYERS} участников. Сейчас найдено: ${players.length}.`;
  }

  const names = players.map(p => p.name.trim().toLowerCase());
  const duplicates = names.filter((name, index) => names.indexOf(name) !== index);

  if (duplicates.length > 0) {
    return "Есть повторяющиеся имена. Проверь таблицу.";
  }

  return null;
}

function normalizeName(name = "") {
  return String(name).trim().toLowerCase();
}

function hasManualPlayers() {
  return state.players.some(player => player.manual === true);
}

function getManualPlayers(players = state.players) {
  return players.filter(player => player.manual === true);
}

function mergeManualPlayers(baseState, manualPlayers = getManualPlayers()) {
  if (!manualPlayers.length) return baseState;

  const players = [...baseState.players];

  manualPlayers.forEach(manualPlayer => {
    const existingIndex = players.findIndex(
      player => normalizeName(player.name) === normalizeName(manualPlayer.name)
    );

    if (existingIndex >= 0) {
      players[existingIndex] = {
        ...players[existingIndex],
        ...manualPlayer,
        manual: true
      };
    } else {
      players.push(manualPlayer);
    }
  });

  return {
    ...baseState,
    players,
    groups: [],
    pairs: []
  };
}

function parseManualResult(raw) {
  const payload = JSON.parse(raw.trim());
  const result = payload.result || payload;
  const name = String(result.player || result.name || "").trim();

  if (!name) {
    throw new Error("В JSON не найдено имя участника.");
  }

  if (!Array.isArray(result.answers) || !result.answers.length) {
    throw new Error("В JSON не найден список ответов.");
  }

  return {
    name,
    player: name,
    date: result.date || new Date().toISOString(),
    answers: result.answers.map((answer, index) => ({
      question: String(answer.question || `Вопрос ${index + 1}`),
      value: String(answer.value || ""),
      title: String(answer.title || ""),
      note: String(answer.note || "")
    })),
    manual: true
  };
}

function importManualResult() {
  const input = $("manualResultInput");
  const status = $("manualImportStatus");

  try {
    const result = parseManualResult(input.value);
    const existingIndex = state.players.findIndex(
      player => normalizeName(player.name) === normalizeName(result.name)
    );
    const record = {
      name: result.name,
      manual: true,
      date: result.date,
      answers: result.answers
    };

    if (existingIndex >= 0) {
      state.players[existingIndex] = {
        ...state.players[existingIndex],
        ...record
      };
    } else {
      state.players.push(record);
    }

    state.groups = [];
    state.pairs = [];
    saveAdminCache();
    renderAll();

    input.value = "";
    status.textContent = existingIndex >= 0
      ? `Ответ ${result.name} обновлён. Группы и пары нужно создать заново.`
      : `Ответ ${result.name} добавлен. Сейчас участников: ${state.players.length}.`;
    $("leftStatus").textContent = status.textContent;
  } catch (error) {
    console.error(error);
    status.textContent =
      "Не получилось прочитать JSON. Проверь, что участник скопировал весь блок целиком.";
  }
}

function openManualImportModal() {
  const modal = $("manualImportModal");
  if (!modal) return;

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  $("manualImportStatus").textContent = "";
  $("manualResultInput").focus();
}

function closeManualImportModal() {
  const modal = $("manualImportModal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function answerValues(player) {
  return Array.isArray(player.answers)
    ? player.answers.map(answer => String(answer.value || ""))
    : [];
}

function pairSimilarity(playerA, playerB) {
  const first = answerValues(playerA);
  const second = answerValues(playerB);
  const length = Math.min(first.length, second.length);
  let score = 0;

  for (let i = 0; i < length; i++) {
    if (first[i] && first[i] === second[i]) score++;
  }

  return score;
}

function groupSimilarity(players) {
  let score = 0;

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      score += pairSimilarity(players[i], players[j]);
    }
  }

  return score;
}

function getGroupCombinations(players, size, start = 0, current = [], result = []) {
  if (current.length === size) {
    result.push([...current]);
    return result;
  }

  for (let i = start; i < players.length; i++) {
    current.push(players[i]);
    getGroupCombinations(players, size, i + 1, current, result);
    current.pop();
  }

  return result;
}

function createLocalGroups() {
  const validationError = validatePlayers(state.players);

  if (validationError) {
    throw new Error(validationError);
  }

  const combinations = getGroupCombinations(state.players, REQUIRED_PLAYERS / 2)
    .filter(group => group.includes(state.players[0]));
  let bestSplit = null;
  let bestScore = Infinity;

  combinations.forEach(groupA => {
    const groupB = state.players.filter(player => !groupA.includes(player));
    const score = Math.abs(groupSimilarity(groupA) - groupSimilarity(groupB));

    if (score < bestScore) {
      bestScore = score;
      bestSplit = { groupA, groupB };
    }
  });

  if (!bestSplit) {
    throw new Error("Не получилось создать локальные группы.");
  }

  state.groups = [
    ...bestSplit.groupA.map(player => ({ ...player, group: "A" })),
    ...bestSplit.groupB.map(player => ({ ...player, group: "B" }))
  ];
  state.pairs = [];
}

function createLocalPairs(game) {
  const groupA = state.groups.filter(player => player.group === "A");
  const groupB = state.groups.filter(player => player.group === "B");

  if (groupA.length !== 3 || groupB.length !== 3) {
    throw new Error("Для локальной генерации нужны две группы по 3 участника.");
  }

  const shift = Number(game) - 1;
  const pairs = groupA.map((player, index) => ({
    game: Number(game),
    pair: index + 1,
    player1: player.name,
    player2: groupB[(index + shift) % groupB.length].name,
    manual: true
  }));

  state.pairs = [
    ...state.pairs.filter(pair => Number(pair.game) !== Number(game)),
    ...pairs
  ];
}

function getPairsForGame(game) {
  return state.pairs.filter(p => Number(p.game) === Number(game));
}

function hasGame(game) {
  return getPairsForGame(game).length > 0;
}

function canGenerateGame(game) {
  if (!state.groups.length) return false;
  if (hasGame(game)) return false;
  if (game === 1) return true;
  if (game === 2) return hasGame(1);
  if (game === 3) return hasGame(1) && hasGame(2);
  return false;
}

function renderPlayers() {
  if (!state.players.length) {
    $("playersBox").innerHTML = "";
    return;
  }

  $("playersBox").innerHTML = `
    <div class="compact-block">
      <h3>Участники</h3>
      <div class="compact-list">
        ${state.players.map((p, i) => `
          <div class="compact-chip reveal-card" style="animation-delay:${i * 80}ms">
            <span>${i + 1}</span>
            <b>${escapeHtml(p.name)}</b>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderGroups() {
  if (!state.groups.length) {
    $("groupsBox").innerHTML = "";
    return;
  }

  const groupA = state.groups.filter(p => p.group === "A");
  const groupB = state.groups.filter(p => p.group === "B");

  $("groupsBox").innerHTML = `
    <div class="compact-block">
      <h3>Группы</h3>
      <div class="compact-groups">
        <div>
          <h4>Group A</h4>
          ${groupA.map((p, i) => `
            <div class="compact-chip reveal-card" style="animation-delay:${i * 90}ms">
              <b>${escapeHtml(p.name)}</b>
            </div>
          `).join("")}
        </div>
        <div>
          <h4>Group B</h4>
          ${groupB.map((p, i) => `
            <div class="compact-chip reveal-card" style="animation-delay:${(i + 3) * 90}ms">
              <b>${escapeHtml(p.name)}</b>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderPairs() {
  const pairs = getPairsForGame(selectedGame);

  if (!pairs.length) {
    $("pairsBox").innerHTML = "";
    return;
  }

  $("pairsBox").innerHTML = `
    <div class="pairs-compact-list">
      ${pairs.map((pair, i) => `
       <div class="pair-compact-card reveal-card" style="animation-delay:${i * 650}ms">
          <span>Пара ${i + 1}</span>
          <b>${escapeHtml(pair.player1)}</b>
          <em>+</em>
          <b>${escapeHtml(pair.player2)}</b>
        </div>
      `).join("")}
    </div>
  `;
}

function renderGamePanel() {
  $("gameNumber").textContent = `0${selectedGame + 1}`;
  $("gameTitle").textContent = `Пары · Игра ${selectedGame}`;
  $("generatePairsBtn").textContent = `Сформировать пары для игры ${selectedGame} →`;

  const pairs = getPairsForGame(selectedGame);

  if (!state.groups.length) {
    $("gameStatus").textContent = "Сначала загрузи результаты и создай группы.";
    $("generatePairsBtn").disabled = true;
  } else if (pairs.length) {
    $("gameStatus").textContent = `Пары для игры ${selectedGame} уже сохранены.`;
    $("generatePairsBtn").disabled = true;
  } else if (selectedGame === 2 && !hasGame(1)) {
    $("gameStatus").textContent = "Сначала нужно сформировать пары для игры 1.";
    $("generatePairsBtn").disabled = true;
  } else if (selectedGame === 3 && !hasGame(2)) {
    $("gameStatus").textContent = "Сначала нужно сформировать пары для игры 2.";
    $("generatePairsBtn").disabled = true;
  } else {
    $("gameStatus").textContent = "Готово к запуску протокола формирования пар.";
    $("generatePairsBtn").disabled = false;
  }

  renderPairs();
}

function renderAll() {
  const validationError = validatePlayers(state.players);

  if (!state.players.length) {
    $("leftStatus").textContent = "Результаты ещё не загружены.";
  } else if (validationError) {
    $("leftStatus").textContent = validationError;
  } else if (!state.groups.length) {
    $("leftStatus").textContent = "Участники загружены. Можно создать группы.";
  } else {
    $("leftStatus").textContent = "Группы сохранены. Можно формировать пары.";
  }

  renderPlayers();
  renderGroups();

  $("createGroupsBtn").classList.toggle(
    "hidden",
    !state.players.length || Boolean(validationError) || Boolean(state.groups.length)
  );

  renderGamePanel();
}

async function loadAdminState() {
  try {
    const response = await runLoader(
      "playersBox",
      requestAdmin("getAdminState", { source: currentSource }),
      [
        "Подключаемся к таблице...",
        "Считываем результаты...",
        "Проверяем 6 участников...",
        "Восстанавливаем группы и пары..."
      ],
      3000
    );

    if (!response.ok) {
      $("leftStatus").textContent = response.error || "Не удалось загрузить данные.";
      return;
    }

    state = mergeManualPlayers(normalizeState(response));
    saveAdminCache();
    renderAll();
  } catch (error) {
    if (restoreAdminCache("leftStatus", "Загрузка")) return;

    showAdminError(
      "leftStatus",
      "Apps Script не ответил. Локальной копии пока нет: проверь публикацию Apps Script или попробуй ещё раз.",
      error
    );
  }
}

async function createGroups() {
  if (hasManualPlayers()) {
    try {
      await runLoader(
        "groupsBox",
        (async () => {
          createLocalGroups();
          return { ok: true };
        })(),
        [
          "Считываем результаты тестирования...",
          "Ищем закономерности...",
          "Анализируем совместимость...",
          "Балансируем состав...",
          "Формируем экспериментальные группы..."
        ],
        6000
      );

      saveAdminCache();
      renderAll();
      $("leftStatus").textContent =
        "Группы созданы локально с учётом ручных ответов. Apps Script не использовался.";
      showSparks("groupsBox");
    } catch (error) {
      showAdminError("leftStatus", error.message, error);
    }

    return;
  }

  try {
    const response = await runLoader(
      "groupsBox",
      requestAdmin("createGroups", { source: currentSource }),
      [
        "Считываем результаты тестирования...",
        "Ищем закономерности...",
        "Анализируем совместимость...",
        "Балансируем состав...",
        "Формируем экспериментальные группы..."
      ],
      6000
    );

    if (!response.ok) {
      $("leftStatus").textContent = response.error || "Ошибка создания групп.";
      return;
    }

    state.groups = response.groups || [];
    saveAdminCache();
    renderAll();
    showSparks("groupsBox");
  } catch (error) {
    try {
      createLocalGroups();
      saveAdminCache();
      renderAll();
      $("leftStatus").textContent =
        "Apps Script не ответил, поэтому группы созданы локально. Проверь состав перед игрой.";
      showSparks("groupsBox");
      return;
    } catch (localError) {
      console.warn(localError);
    }

    if (restoreAdminCache("leftStatus", "Создание групп")) return;

    showAdminError(
      "leftStatus",
      "Apps Script не ответил, поэтому группы сейчас нельзя создать. Последней локальной копии для этого набора данных нет.",
      error
    );
  }
}

async function generatePairs() {
  if (!canGenerateGame(selectedGame)) {
    renderGamePanel();
    return;
  }

  if (hasManualPlayers()) {
    try {
      await runLoader(
        "pairsBox",
        (async () => {
          createLocalPairs(selectedGame);
          return { ok: true };
        })(),
        [
          "Проверяем предыдущие встречи...",
          "Исключаем повторения...",
          "Ищем оптимальные сочетания...",
          "Анализируем совместимость...",
          "Проводим финальную проверку...",
          "Утверждаем протокол..."
        ],
        7000
      );

      saveAdminCache();
      renderGamePanel();
      $("gameStatus").textContent =
        `Пары для игры ${selectedGame} созданы локально с учётом ручных ответов.`;
      showSparks("pairsBox");
    } catch (error) {
      showAdminError("gameStatus", error.message, error);
    }

    return;
  }

  try {
    const response = await runLoader(
      "pairsBox",
      requestAdmin("generatePairs", {
        source: currentSource,
        game: selectedGame
      }),
      [
        "Проверяем предыдущие встречи...",
        "Исключаем повторения...",
        "Ищем оптимальные сочетания...",
        "Анализируем совместимость...",
        "Проводим финальную проверку...",
        "Утверждаем протокол..."
      ],
      7000
    );

    if (!response.ok) {
      $("gameStatus").textContent = response.error || "Ошибка генерации.";
      return;
    }

    state.groups = response.groups || state.groups;
    state.pairs = response.pairs || [];
    saveAdminCache();
    renderGamePanel();
    showSparks("pairsBox");
  } catch (error) {
    try {
      createLocalPairs(selectedGame);
      saveAdminCache();
      renderGamePanel();
      $("gameStatus").textContent =
        `Apps Script не ответил, поэтому пары для игры ${selectedGame} созданы локально.`;
      showSparks("pairsBox");
      return;
    } catch (localError) {
      console.warn(localError);
    }

    if (restoreAdminCache("gameStatus", "Генерация пар")) return;

    showAdminError(
      "gameStatus",
      "Apps Script не ответил, поэтому новые пары сейчас нельзя создать. Показать нечего: локальной копии пока нет.",
      error
    );
  }
}

async function seedSandbox() {
  try {
    const response = await runLoader(
      "playersBox",
      requestAdmin("seedSandbox"),
      [
        "Открываем sandbox...",
        "Очищаем старые тестовые данные...",
        "Генерируем 6 фиктивных участников...",
        "Заполняем случайные ответы...",
        "Сохраняем sandbox-протокол..."
      ],
      4000
    );

    if (!response.ok) {
      $("leftStatus").textContent = response.error || "Sandbox не заполнен.";
      return;
    }

    currentSource = "sandbox";
    document.querySelectorAll(".source-btn").forEach(b => b.classList.remove("active"));
    const sandboxButton = document.querySelector('[data-source="sandbox"]');
    if (sandboxButton) sandboxButton.classList.add("active");

    await loadAdminState();
  } catch (error) {
    showAdminError(
      "leftStatus",
      "Apps Script не ответил, поэтому sandbox сейчас нельзя заполнить.",
      error
    );
  }
}

async function resetCurrentSource() {
  try {
    const response = await runLoader(
      "playersBox",
      requestAdmin("resetAdminState", {
        source: currentSource
      }),
      [
        "Сбрасываем группы...",
        "Удаляем историю пар...",
        "Возвращаем протокол в начальное состояние..."
      ],
      3000
    );

    if (!response.ok) {
      $("leftStatus").textContent = response.error || "Ошибка сброса.";
      return;
    }

    state = {
      players: [],
      groups: [],
      pairs: []
    };

    clearAdminCache();
    renderAll();
  } catch (error) {
    if (restoreAdminCache("leftStatus", "Сброс")) return;

    showAdminError(
      "leftStatus",
      "Apps Script не ответил, поэтому сброс не выполнен.",
      error
    );
  }
}

async function checkAdminPassword(password) {
  const response = await requestAdmin("checkAdminPassword", { password });
  return response.ok === true;
}

$("adminUnlockBtn").onclick = async () => {
  $("adminErrorText").classList.add("hidden");
  $("adminErrorText").textContent = "Неверный пароль.";
  $("adminUnlockBtn").textContent = "Проверяем...";
  $("adminUnlockBtn").disabled = true;

  let ok = false;

  try {
    ok = await checkAdminPassword($("adminCodeInput").value);
  } catch (error) {
    console.error(error);
    $("adminErrorText").textContent =
      "Apps Script не ответил. Вход сейчас нельзя проверить, попробуй ещё раз чуть позже.";
    $("adminErrorText").classList.remove("hidden");
  }

  $("adminUnlockBtn").textContent = "Открыть админ-панель →";
  $("adminUnlockBtn").disabled = false;

  if (!ok) {
    $("adminErrorText").classList.remove("hidden");
    return;
  }

  sessionStorage.setItem("idealbro-admin-unlocked", "yes");
  $("adminLockScreen").classList.add("hidden");
  $("adminPanel").classList.remove("hidden");
};

$("adminCodeInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") $("adminUnlockBtn").click();
});

if (sessionStorage.getItem("idealbro-admin-unlocked") === "yes") {
  $("adminLockScreen").classList.add("hidden");
  $("adminPanel").classList.remove("hidden");
}

document.querySelectorAll(".source-btn").forEach(button => {
  button.onclick = async () => {
    document.querySelectorAll(".source-btn").forEach(b => b.classList.remove("active"));
    button.classList.add("active");

    currentSource = button.dataset.source;
    selectedGame = 1;

    document.querySelectorAll(".game-tab").forEach(b => b.classList.remove("active"));
    document.querySelector('[data-game="1"]').classList.add("active");

    state = {
      players: [],
      groups: [],
      pairs: []
    };

    renderAll();
  };
});

document.querySelectorAll(".game-tab").forEach(button => {
  button.onclick = () => {
    document.querySelectorAll(".game-tab").forEach(b => b.classList.remove("active"));
    button.classList.add("active");

    selectedGame = Number(button.dataset.game);
    renderGamePanel();
  };
});

$("loadBtn").onclick = loadAdminState;
if ($("seedBtn")) $("seedBtn").onclick = seedSandbox;
$("resetBtn").onclick = resetCurrentSource;
$("createGroupsBtn").onclick = createGroups;
$("generatePairsBtn").onclick = generatePairs;
if ($("openManualImportBtn")) $("openManualImportBtn").onclick = openManualImportModal;
if ($("closeManualImportBtn")) $("closeManualImportBtn").onclick = closeManualImportModal;
if ($("importResultBtn")) $("importResultBtn").onclick = importManualResult;
if ($("clearManualInputBtn")) {
  $("clearManualInputBtn").onclick = () => {
    $("manualResultInput").value = "";
    $("manualImportStatus").textContent = "";
  };
}
if ($("manualImportModal")) {
  $("manualImportModal").addEventListener("click", (event) => {
    if (event.target === $("manualImportModal")) {
      closeManualImportModal();
    }
  });
}
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeManualImportModal();
  }
});

renderAll();
