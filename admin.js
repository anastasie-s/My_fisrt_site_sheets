const SHEETS_URL = "https://script.google.com/macros/s/AKfycbybdZ7saSVOPyAm5TdZP0qz1eFQg_wJO_-eAV3J8PnKfqecP8PCktjeUNWUMP7wWkc/exec";

const REQUIRED_PLAYERS = 6;

let currentSource = "real";
let state = {
  players: [],
  groups: [],
  pairs: []
};

const $ = (id) => document.getElementById(id);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function jsonp(action, params = {}) {
  return new Promise((resolve, reject) => {
    const callbackName =
      "idealbroAdmin_" + Date.now() + "_" + Math.floor(Math.random() * 100000);

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
    script.src = SHEETS_URL + "?" + searchParams.toString();
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

function setStage(title, text) {
  $("stageTitle").textContent = title;
  $("stageText").textContent = text;
}

function setOutput(html) {
  $("output").innerHTML = html;
}

function clearOutput() {
  $("output").innerHTML = "";
}

async function runLoader(lines, minDelay = 900) {
  $("loader").classList.remove("hidden");

  for (const line of lines) {
    $("loaderText").textContent = line;
    await sleep(minDelay);
  }

  $("loader").classList.add("hidden");
}

function renderPlayers(players) {
  return `
    <div class="admin-result-block">
      <h2>Участники</h2>
      <div class="admin-mini-grid">
        ${players.map((p, i) => `
          <div class="admin-chip">
            <span>${i + 1}</span>
            <b>${p.name}</b>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderGroups(groups) {
  const groupA = groups.filter(g => g.group === "A");
  const groupB = groups.filter(g => g.group === "B");

  return `
    <div class="admin-result-block">
      <h2>Группы</h2>
      <div class="admin-two-cols">
        <div class="group-box">
          <h3>Group A</h3>
          ${groupA.map(p => `<div class="admin-chip"><b>${p.name}</b></div>`).join("")}
        </div>

        <div class="group-box">
          <h3>Group B</h3>
          ${groupB.map(p => `<div class="admin-chip"><b>${p.name}</b></div>`).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderPairs(game, pairs) {
  return `
    <div class="admin-result-block">
      <h2>Пары · Игра ${game}</h2>
      <div class="pairs-show-list">
        ${pairs.map((pair, i) => `
          <div class="pair-show-card">
            <span>Пара ${i + 1}</span>
            <b>${pair.player1}</b>
            <em>+</em>
            <b>${pair.player2}</b>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderState() {
  let html = "";

  if (state.players.length) {
    html += renderPlayers(state.players);
  }

  if (state.groups.length) {
    html += renderGroups(state.groups);
  }

  const games = [1, 2, 3];

  games.forEach(game => {
    const gamePairs = state.pairs.filter(p => Number(p.game) === game);
    if (gamePairs.length) {
      html += renderPairs(game, gamePairs);
    }
  });

  setOutput(html);
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

async function loadAdminState() {
  clearOutput();

  await runLoader([
    "Подключаемся к таблице...",
    "Считываем результаты теста...",
    "Проверяем участников...",
    "Восстанавливаем сохранённый протокол..."
  ], 800);

  const response = await jsonp("getAdminState", {
    source: currentSource
  });

  if (!response.ok) {
    setStage("Ошибка протокола", response.error || "Не удалось загрузить данные.");
    return;
  }

  state.players = response.players || [];
  state.groups = response.groups || [];
  state.pairs = response.pairs || [];

  const validationError = validatePlayers(state.players);

  if (validationError) {
    setStage("Проверка не пройдена", validationError);
    renderState();
    return;
  }

  if (!state.groups.length) {
    setStage("Результаты загружены", "Участники найдены. Теперь можно разделить их на две группы.");
  } else {
    setStage("Протокол восстановлен", "Группы и сохранённые пары загружены из таблицы.");
  }

  renderState();

  if (!state.groups.length) {
    $("output").innerHTML += `
      <button class="btn primary admin-next-btn" id="createGroupsBtn">
        Разделить на две группы →
      </button>
    `;

    $("createGroupsBtn").onclick = createGroups;
  }
}

async function createGroups() {
  await runLoader([
    "Запускаем модуль группировки...",
    "Проверяем уникальность имён...",
    "Сверяем количество участников...",
    "Формируем две экспериментальные группы...",
    "Сохраняем группы в протокол..."
  ], 900);

  const response = await jsonp("createGroups", {
    source: currentSource
  });

  if (!response.ok) {
    setStage("Группы не созданы", response.error || "Ошибка при создании групп.");
    return;
  }

  state.groups = response.groups || [];

  setStage("Группы сформированы", "Теперь можно выбирать пары для игр 1, 2 и 3.");
  renderState();
}

async function generatePairs(game) {
  await runLoader([
    `Запускаем протокол игры ${game}...`,
    "Считываем сохранённые группы...",
    "Проверяем историю предыдущих пар...",
    "Исключаем повторы...",
    "Анализируем совместимость...",
    "Формируем финальный список пар...",
    "Сохраняем протокол в таблицу..."
  ], 900);

  const response = await jsonp("generatePairs", {
    source: currentSource,
    game
  });

  if (!response.ok) {
    setStage(`Пары для игры ${game} не созданы`, response.error || "Ошибка генерации.");
    renderState();
    return;
  }

  state.groups = response.groups || state.groups;
  state.pairs = response.pairs || [];

  setStage(`Пары для игры ${game} готовы`, "Протокол сохранён. Можно продолжать.");
  renderState();
}

async function seedSandbox() {
  await runLoader([
    "Открываем sandbox-таблицу...",
    "Удаляем старые тестовые данные...",
    "Генерируем 6 фиктивных участников...",
    "Заполняем случайные ответы...",
    "Сохраняем sandbox-протокол..."
  ], 850);

  const response = await jsonp("seedSandbox");

  if (!response.ok) {
    setStage("Sandbox не заполнен", response.error || "Ошибка заполнения.");
    return;
  }

  setStage("Sandbox заполнен", "Переключись на «Запуск теста» и загрузи результаты.");
}

async function resetCurrentSource() {
  await runLoader([
    "Сбрасываем сохранённые группы...",
    "Удаляем историю пар для текущего режима...",
    "Возвращаем протокол в начальное состояние..."
  ], 750);

  const response = await jsonp("resetAdminState", {
    source: currentSource
  });

  if (!response.ok) {
    setStage("Сброс не выполнен", response.error || "Ошибка сброса.");
    return;
  }

  state = {
    players: [],
    groups: [],
    pairs: []
  };

  clearOutput();
  setStage("Протокол сброшен", "Можно заново загрузить результаты.");
}

async function checkAdminPassword(password) {
  const response = await jsonp("checkAdminPassword", {
    password
  });

  return response.ok === true;
}

$("adminUnlockBtn").onclick = async () => {
  $("adminErrorText").classList.add("hidden");
  $("adminUnlockBtn").textContent = "Проверяем...";
  $("adminUnlockBtn").disabled = true;

  const ok = await checkAdminPassword($("adminCodeInput").value);

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
  button.onclick = () => {
    document.querySelectorAll(".source-btn").forEach(b => b.classList.remove("active"));
    button.classList.add("active");

    currentSource = button.dataset.source;

    state = {
      players: [],
      groups: [],
      pairs: []
    };

    clearOutput();

    setStage(
      currentSource === "real" ? "Боевой режим" : "Запуск теста",
      currentSource === "real"
        ? "Будут использоваться реальные результаты участников."
        : "Будут использоваться sandbox-данные."
    );
  };
});

document.querySelectorAll(".game-tab").forEach(button => {
  button.onclick = () => generatePairs(button.dataset.game);
});

$("loadBtn").onclick = loadAdminState;
$("seedBtn").onclick = seedSandbox;
$("resetBtn").onclick = resetCurrentSource;
