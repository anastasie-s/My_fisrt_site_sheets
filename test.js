const SHEETS_URL = "https://script.google.com/macros/s/AKfycbybdZ7saSVOPyAm5TdZP0qz1eFQg_wJO_-eAV3J8PnKfqecP8PCktjeUNWUMP7wWkc/exec";
const TEST_RESULT_KEY = "idealbro-test-result";
const REQUEST_TIMEOUT = 15000;

const questions = [
  {
    text: "Какой ты хлеб сегодня?",
    sub: "Очень серьёзная хлебная самодиагностика.",
    options: [
      ["bread_baguette", "🥖", "Багет", "длинный, уверенный, немного драматичный"],
      ["bread_toast", "🍞", "Тост", "стабильный, понятный, надёжный"],
      ["bread_croissant", "🥐", "Круассан", "красивый, хаотичный, с внутренними слоями"],
      ["bread_pita", "🫓", "Пита", "социальный, всё держит внутри"],
      ["bread_pretzel", "🥨", "Крендель", "сложный, но обаятельный"],
      ["bread_cracker", "🧇", "Хлебец", "хрустит под давлением, но держится"]
    ]
  },
  {
    text: "В дискорде повисла неловкая тишина. Твои действия?",
    sub: "Проверяем аварийный протокол общения.",
    options: [
      ["silence_professional", "🤐", "Молчу профессионально", "тишина тоже контент"],
      ["silence_question", "❓", "Задаю максимально странный вопрос", "спасаю атмосферу ценой репутации"],
      ["silence_story", "📚", "Начинаю рассказывать историю", "у меня как раз была одна"],
      ["silence_wait", "👀", "Жду, пока кто-то другой спасёт ситуацию", "тактическое наблюдение"],
      ["silence_noise", "🔊", "Издаю непонятный звук", "не решение, но движение"],
      ["silence_didnt_notice", "🧘", "Я вообще не заметил тишину", "мне было нормально"]
    ]
  },
  {
    text: "Ты впервые запустил новую игру. Что происходит в первые 10 минут?",
    sub: "Без осуждения. Почти.",
    options: [
      ["newgame_mastered", "🎮", "Я уже примерно понял, как это работает", "можно начинать страдать эффективно"],
      ["newgame_tutorial", "📖", "Читаю подсказки", "они же зачем-то написаны"],
      ["newgame_buttons", "🧨", "Жму всё подряд", "экспериментальная методика"],
      ["newgame_ask", "📢", "Спрашиваю, что делать", "зачем страдать одному"],
      ["newgame_settings", "⚙️", "Ковыряю настройки", "сначала графика, потом жизнь"],
      ["newgame_wander", "🚶", "Уже ушёл куда-то не туда", "но зато уверенно"]
    ]
  },
  {
    text: "Тебе дали пульт с одной красной кнопкой.",
    sub: "Классическая проверка ответственности.",
    options: [
      ["button_press", "🔴", "Жму сразу", "иначе зачем она красная"],
      ["button_manual", "📘", "Читаю инструкцию", "я хочу жить в обществе"],
      ["button_friend", "🫴", "Даю другу", "делегирование рисков"],
      ["button_audience", "👥", "Собираю всех посмотреть", "важные решения должны быть публичными"],
      ["button_google", "🔍", "Гуглю модель пульта", "мало ли"],
      ["button_hide", "📦", "Убираю подальше", "нет кнопки — нет проблемы"]
    ]
  },
  {
    text: "Шесть человек выбирают, где заказать еду. Кто ты?",
    sub: "Самая сложная командная игра.",
    options: [
      ["food_link", "🔗", "Уже скинул ссылку", "решения должны происходить"],
      ["food_anything", "🤷", "Мне всё равно", "главное, чтобы принесли"],
      ["food_poll", "📊", "Создаю голосование", "демократия и соусы"],
      ["food_reject", "🚫", "Отвергаю каждый вариант", "я не сложный, я с критериями"],
      ["food_support", "🫶", "Поддерживаю самого голодного", "ему сейчас нужнее"],
      ["food_discuss", "💬", "Через час всё ещё обсуждаю", "процесс тоже важен"]
    ]
  },
  {
    text: "В игре есть обучение.",
    sub: "Твой честный путь.",
    options: [
      ["tutorial_skip", "⏭️", "Пропускаю", "разберёмся в бою"],
      ["tutorial_read", "📚", "Читаю", "я уважаю интерфейс"],
      ["tutorial_suffer", "🫠", "Пропускаю и потом страдаю", "традиция"],
      ["tutorial_friend", "🗣️", "Прошу друга объяснить", "живой туториал лучше"],
      ["tutorial_test", "🧪", "Проверяю всё сам", "научный метод"],
      ["tutorial_group_confusion", "🌀", "Мы всей командой не поняли управление", "зато вместе"]
    ]
  },
  {
    text: "Тебя попросили объяснить правила настолки.",
    sub: "Опасный социальный момент.",
    options: [
      ["rules_short", "⏱️", "Объясняю за 30 секунд", "дальше разберётесь"],
      ["rules_lore", "📜", "Начинаю с истории создания игры", "контекст важен"],
      ["rules_play", "🎲", "Давайте начнём, по ходу поймёте", "лучший учебник — боль"],
      ["rules_delegate", "👉", "Передаю слово другому", "я верю в команду"],
      ["rules_diagram", "✏️", "Рисую схему", "сейчас будет понятно"],
      ["rules_60", "😌", "Сам понимаю правила примерно на 60%", "но уверенно киваю"]
    ]
  },
  {
    text: "Кто-то сказал: «У меня есть идея». Твоя первая реакция?",
    sub: "Проверяем уровень доверия к человечеству.",
    options: [
      ["idea_no", "🛑", "Нет", "на всякий случай"],
      ["idea_listen", "👂", "Я слушаю", "но с подозрением"],
      ["idea_join", "🚀", "Я уже участвую", "не знаю где, но участвую"],
      ["idea_legal", "⚖️", "А она законная?", "важный уточняющий вопрос"],
      ["idea_improve", "🛠️", "Предлагаю улучшение", "сейчас оптимизируем хаос"],
      ["idea_call_everyone", "📣", "Зову остальных", "если падаем, то все вместе"]
    ]
  },
  {
    text: "Общий проект, дедлайн завтра. Что делаешь?",
    sub: "Никакой связи с реальностью. Наверное.",
    options: [
      ["deadline_done", "✅", "Я уже всё сделал", "страшный человек"],
      ["deadline_part", "🧩", "Делаю свою часть", "чётко, спокойно, по делу"],
      ["deadline_people", "📢", "Пишу всем, кто что делает", "иначе мы погибнем"],
      ["deadline_table", "📋", "Создаю табличку", "таблица лечит тревогу"],
      ["deadline_memes", "🐸", "Поддерживаю моральный дух мемами", "это тоже вклад"],
      ["deadline_surprise", "😳", "Узнаю о дедлайне из этого вопроса", "интересный поворот"]
    ]
  },
  {
    text: "Что делает бро идеальным?",
    sub: "Финальный вопрос отдела совместимости.",
    options: [
      ["bro_understands", "🧠", "Понимает с полуслова", "редкий вид магии"],
      ["bro_online", "📱", "Всегда на связи", "даже если просто прислал точку"],
      ["bro_not_annoying", "😌", "Не бесит даже через пять часов", "высшая форма близости"],
      ["bro_silence", "🌙", "С ним можно молчать", "и это не странно"],
      ["bro_chaos", "✨", "Поддержит любую странную идею", "опасно, но приятно"],
      ["bro_truth", "🪞", "Умеет сказать: мы делаем фигню", "и всё равно продолжить"]
    ]
  }
];
let state = {
  name: "",
  index: 0,
  answers: [],
};
const $ = (id) => document.getElementById(id);

function jsonp(action, params = {}, timeoutMs = REQUEST_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const callbackName =
      "idealbroTest_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
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

async function requestTest(action, params = {}, attempts = 2) {
  let lastError;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await jsonp(action, params);
    } catch (error) {
      lastError = error;

      if (attempt < attempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 700 + attempt * 500));
      }
    }
  }

  throw lastError || new Error("Apps Script недоступен.");
}

async function checkPasswordViaJsonp(password) {
  const response = await requestTest("checkPassword", { password });
  return response.ok === true;
}

function createResultPayload() {
  return {
    type: "idealbro-day1-test-result",
    version: 1,
    player: state.name,
    date: new Date().toISOString(),
    answers: state.answers
  };
}

function saveResultBackup(result) {
  localStorage.setItem(TEST_RESULT_KEY, JSON.stringify(result));
}

function renderResultBackup(result, message) {
  if (!$("resultBackup")) return;

  $("resultBackup").classList.remove("hidden");
  $("resultBackupText").textContent = message;
  $("resultJson").value = JSON.stringify(result, null, 2);
}

async function copyResultBackup() {
  const textarea = $("resultJson");
  textarea.focus();
  textarea.select();

  try {
    await navigator.clipboard.writeText(textarea.value);
  } catch (error) {
    document.execCommand("copy");
  }

  $("copyResultBtn").textContent = "Скопировано";
  setTimeout(() => {
    $("copyResultBtn").textContent = "Скопировать JSON";
  }, 1800);
}

async function submitResult(result) {
  const request = fetch(SHEETS_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain"
    },
    body: JSON.stringify(result)
  }).then(() => "accepted");

  const timeout = new Promise(resolve => {
    setTimeout(() => resolve("pending"), REQUEST_TIMEOUT);
  });

  const status = await Promise.race([request, timeout]);

  if (status === "pending") {
    request.catch(error => {
      console.warn("Поздняя ошибка отправки результата.", error);
    });
  }

  return status;
}

$("testUnlockBtn").onclick = async () => {
  const password = $("testCodeInput").value.trim();

  $("testErrorText").classList.add("hidden");
  $("testErrorText").textContent = "Код неверный.";
  $("testUnlockBtn").textContent = "Проверяем...";
  $("testUnlockBtn").disabled = true;

  let ok = false;

  try {
    ok = await checkPasswordViaJsonp(password);
  } catch (error) {
    console.error(error);
    $("testErrorText").textContent =
      "Apps Script не ответил. Попробуй ещё раз чуть позже.";
    $("testErrorText").classList.remove("hidden");
  }

  $("testUnlockBtn").textContent = "Открыть тест →";
  $("testUnlockBtn").disabled = false;

  if (!ok) {
    $("testErrorText").classList.remove("hidden");
    return;
  }

  sessionStorage.setItem("idealbro-test-unlocked", "yes");
  $("testLockScreen").classList.add("hidden");
  $("startScreen").classList.remove("hidden");
};

$("testCodeInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") $("testUnlockBtn").click();
});

if (sessionStorage.getItem("idealbro-test-unlocked") === "yes") {
  $("testLockScreen").classList.add("hidden");
  $("startScreen").classList.remove("hidden");
}
$("startBtn").onclick = () => {
  const name = $("playerName").value.trim();
  if (!name) {
    $("playerName").focus();
    return;
  }
  state.name = name;
  $("startScreen").classList.add("hidden");
  $("questionScreen").classList.remove("hidden");
  renderQuestion();
};
function renderQuestion() {
  const q = questions[state.index];
  $("counter").textContent =
    `Вопрос ${String(state.index + 1).padStart(2, "0")} / ${questions.length}`;
  $("progressBar").style.width =
    `${((state.index + 1) / questions.length) * 100}%`;
  $("questionText").textContent = q.text;
  $("questionSub").textContent = q.sub;
  $("options").innerHTML = "";
  q.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className =
      "option" +
      (state.answers[state.index]?.value === opt[0] ? " selected" : "");
    btn.innerHTML = `<div class="emoji">${opt[1]}</div><strong>${opt[2]}</strong><span>${opt[3]}</span>`;
    btn.onclick = () => {
      state.answers[state.index] = {
        question: q.text,
        value: opt[0],
        title: opt[2],
        note: opt[3],
      };
      renderQuestion();
    };
    $("options").appendChild(btn);
  });
  $("backBtn").style.visibility = state.index === 0 ? "hidden" : "visible";
  $("nextBtn").textContent =
    state.index === questions.length - 1 ? "Завершить →" : "Далее →";
}
$("backBtn").onclick = () => {
  if (state.index > 0) {
    state.index--;
    renderQuestion();
  }
};
$("nextBtn").onclick = () => {
  if (!state.answers[state.index]) return;
  if (state.index < questions.length - 1) {
    state.index++;
    renderQuestion();
  } else showResult();
};
async function showResult(){
  $("questionScreen").classList.add("hidden");
  $("resultScreen").classList.remove("hidden");

  const result = createResultPayload();

  saveResultBackup(result);
  renderResultBackup(
    result,
    "Если хост попросит, скопируй JSON отсюда."
  );

  $("resultTitle").textContent = "Отправляем протокол...";
  $("resultText").textContent = "Секунду, бро.";

  try {
    const submitStatus = await submitResult(result);

    if (submitStatus === "pending") {
      $("resultTitle").textContent = "Протокол отправлен, но не закрывай пока страницу";
      $("resultText").textContent =
        ``;
    } else {
      $("resultTitle").textContent = "Протокол отправлен, но не закрывай пока страницу";
      $("resultText").textContent =
        ``;
    }

  } catch (error) {
    console.error(error);
    $("resultTitle").textContent = "Что-то пошло не так";
    $("resultText").textContent =
      "Ответы сохранены на этом устройстве. Скопируй JSON ниже и отправь хосту.";
    renderResultBackup(
      result,
      "Отправка не прошла. Скопируй этот JSON и отправь хосту."
    );
  }
}
$("copyResultBtn").onclick = copyResultBackup;
$("restartBtn").onclick = () => {
  state = {
    name: "",
    index: 0,
    answers: [],
  };
  $("playerName").value = "";
  $("resultScreen").classList.add("hidden");
  $("startScreen").classList.remove("hidden");
};
