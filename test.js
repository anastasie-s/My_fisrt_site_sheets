const SHEETS_URL = "https://script.google.com/macros/s/AKfycbybdZ7saSVOPyAm5TdZP0qz1eFQg_wJO_-eAV3J8PnKfqecP8PCktjeUNWUMP7wWkc/exec";
const TEST_RESULT_KEY = "idealbro-test-result";
const REQUEST_TIMEOUT = 15000;

const questions = [
  {
    text: "Какой ты хлеб сегодня?",
    sub: "Очень серьёзная хлебная самодиагностика.",
    options: [
      ["bread_baguette","🥖","Багет","длинный, уверенный, ведёт всех к столу"],
      ["bread_toast","🍞","Тост","стабильный, понятный, на нём всё держится"],
      ["bread_cracker","🧇","Хлебец","хрустит под давлением, но не ломается"],
      ["bread_pita","🥙","Пита","обнимает всех, кого в неё положили"],
      ["bread_bagel","🥯","Бублик","вечно в компании чая и разговоров"],
      ["bread_croissant","🥐","Круассан","красивый, хаотичный, с внутренними слоями"]
    ]
  },
  {
    text: "В Discord повисла неловкая тишина. Твои действия?",
    sub: "Проверяем аварийный протокол общения.",
    options: [
      ["silence_plan","📋","Объявляю, что делаем дальше","тишина - это пауза между приказами"],
      ["silence_switch","🔄","Предлагаю сменить игру","раз молчим, значит, эта надоела"],
      ["silence_focus","🎮","Я вообще не заметил тишину","был занят делом"],
      ["silence_question","❓","Задаю максимально странный вопрос","спасаю атмосферу ценой репутации"],
      ["silence_story","📚","Начинаю рассказывать историю","у меня как раз была одна, минут на сорок"],
      ["silence_noise","🔊","Издаю непонятный звук","не решение, но движение"]
    ]
  },
  {
    text: "Вы вчетвером впервые запустили новую игру.",
    sub: "Никто не знает управление. Даже игра.",
    options: [
      ["ng_roles","📌","Сразу распределяю роли","ты - разведка, ты - лут, я - думаю"],
      ["ng_explain","🎓","Объясняю всем, как играть","сам ещё не понял, но голос уверенный"],
      ["ng_read","📖","Читаю подсказки вслух для всех","живая озвучка туториала"],
      ["ng_lost","🔦","Проверяю, не потерялся ли кто-то в меню","Вася, ты где? Вася в настройках звука"],
      ["ng_comment","🎙️","Комментирую каждую смерть","и вот он падает… КРАСИВО"],
      ["ng_follow","🐾","Иду за самым уверенным","у него был убедительный голос"]
    ]
  },
  {
    text: "Тебе дали пульт с одной красной кнопкой.",
    sub: "Никто не сказал, что она делает.",
    options: [
      ["button_guard","🧷","Забираю пульт, чтобы никто не нажал","теперь я ответственный за кнопку"],
      ["button_press","🔴","Жму сразу","иначе зачем она красная"],
      ["button_manual","📘","Ищу инструкцию","я хочу жить в обществе"],
      ["button_audience","👥","Собираю всех посмотреть","важные решения должны быть публичными"],
      ["button_together","🤝","Жмём вместе на счёт три","если взорвёмся, то дружно"],
      ["button_friend","🎁","Отдаю другу","ему сегодня нужнее"]
    ]
  },
  {
    text: "Шесть человек выбирают, где заказать еду. Кто ты?",
    sub: "Самая сложная командная игра.",
    options: [
      ["food_link","🔗","Уже скинул ссылку и корзину","решения должны происходить"],
      ["food_poll","📊","Создаю голосование с дедлайном","демократия, но до 20:00"],
      ["food_veto","🚫","Отвергаю каждый вариант","я не сложный, я с критериями"],
      ["food_hungry","🍔","Поддерживаю самого голодного","ему сейчас нужнее"],
      ["food_anything","🤷","Мне всё равно, лишь бы вместе","главное, чтобы принесли"],
      ["food_discuss","💬","Через час всё ещё обсуждаю","процесс тоже важен"]
    ]
  },
  {
    text: "Нужно выбрать одного человека, который примет финальное решение.",
    sub: "Демократия временно приостановлена.",
    options: [
      ["decision_self","👑","Беру на себя","но потом без жалоб"],
      ["decision_expert","🧠","Назначаю самого опытного","и слежу, чтобы он не струсил"],
      ["decision_calm","🧘","Предлагаю самого спокойного","паника уже представлена в полном составе"],
      ["decision_vote","🗳️","Голосуем, кто будет решать","дополнительный уровень демократии"],
      ["decision_random","🎲","Тянем жребий","судьба не ошибается, она импровизирует"],
      ["decision_avoid","🙈","Только не я","моя позиция сформулирована чётко"]
    ]
  },
  {
    text: "Напарник уверенно ведёт вас не туда.",
    sub: "Он пока об этом не знает.",
    options: [
      ["wrong_tell","🧭","Сразу говорю, что мы заблудились","правда сэкономит нам километры"],
      ["wrong_takeover","👉","Перехватываю руководство","спасибо, капитан, дальше я"],
      ["wrong_check","🗺️","Молча сверяюсь с картой","вдруг это я заблудился концептуально"],
      ["wrong_hint","💡","Осторожно намекаю","а мы точно всегда тут жили?"],
      ["wrong_follow","🚶","Иду за ним дальше","не хочу ломать ему момент"],
      ["wrong_fun","🌲","Ничего не говорю","это уже не ошибка, а дополнительный контент"]
    ]
  },
  {
    text: "Кто-то говорит: «Просто доверьтесь мне».",
    sub: "Последние слова перед великим открытием.",
    options: [
      ["trust_backup","🪂","Соглашаюсь, но готовлю запасной план","доверяй, но держи парашют"],
      ["trust_no","🛑","Нет. Слушаем меня","формулировка уже подозрительная"],
      ["trust_why","❓","Спрашиваю, что он задумал","доверие любит техзадание"],
      ["trust_yes","🤝","Доверяюсь полностью","либо победим, либо будет история"],
      ["trust_cheer","📣","Кричу «ДАВАЙ!» и зову остальных","свидетели повышают безопасность"],
      ["trust_with","👫","Иду первым вместе с ним","если что - упадём вдвоём"]
    ]
  },
  {
    text: "Идеальный план внезапно начал разваливаться.",
    sub: "Идеальность продержалась достойно.",
    options: [
      ["plan_adapt","🔧","На ходу собираю новый план","это всё ещё план, просто живой"],
      ["plan_orders","📢","Раздаю короткие команды","ты - туда, ты - держи, я - думаю"],
      ["plan_restore","📐","Пытаюсь вернуть всё как было","структура не должна проиграть себе"],
      ["plan_calm","🤗","Успокаиваю тех, кто паникует","сначала люди, потом план"],
      ["plan_follow","🐾","Подстраиваюсь под остальных","главное - не развалиться отдельно"],
      ["plan_enjoy","🍿","Наблюдаю, во что это превратится","иногда катастрофе нужен зритель"]
    ]
  },
  {
    text: "Общий проект, дедлайн завтра. Что делаешь?",
    sub: "Никакой связи с реальностью. Наверное.",
    options: [
      ["deadline_split","🗂️","Делю задачи между всеми","погибнем, но хотя бы по списку"],
      ["deadline_table","📋","Создаю табличку","таблица лечит тревогу"],
      ["deadline_done","✅","Уже сделал свою часть и чужую","страшный человек"],
      ["deadline_memes","🐸","Поддерживаю моральный дух мемами","это тоже вклад"],
      ["deadline_coffee","☕","Приношу всем кофе и спрашиваю, как дела","дедлайн дедлайном, а люди устали"],
      ["deadline_surprise","😳","Узнаю о дедлайне из этого вопроса","интересный поворот"]
    ]
  },
  {
    text: "Тебя назначили шерифом маленького городка. Первый указ?",
    sub: "Город на тебя рассчитывает. Зря.",
    options: [
      ["sheriff_patrol","🐴","Назначаю помощников и патрули","шериф не должен скакать один"],
      ["sheriff_list","📜","Составляю список подозрительных лиц","я в нём третий"],
      ["sheriff_curfew","🌵","Комендантский час для перекати-поля","порядок начинается с мелочей"],
      ["sheriff_lemonade","🍋","Бесплатный лимонад в салуне","популярность важнее закона"],
      ["sheriff_meet","👋","Знакомлюсь с каждым жителем","шериф должен знать, у кого день рождения"],
      ["sheriff_party","🎉","Праздник в честь назначения","указ номер один: празднуем"]
    ]
  },
  {
    text: "Ваша банда грабит поезд. Какая у тебя роль?",
    sub: "Чисто гипотетически. Поезд игрушечный.",
    options: [
      ["train_plan","🗺️","Придумал план и рисую схему на песке","остальные пока просто фигурки"],
      ["train_roof","🚂","Командую с крыши вагона","ветер в лицо, голос в рупор"],
      ["train_count","💰","Считаю добычу и делю поровну","честность - фундамент банды"],
      ["train_talk","🎩","Отвлекаю машиниста разговором","он уже рассказал мне про свою собаку"],
      ["train_friends","🤠","Подружился с пассажирами","теперь они тоже в банде"],
      ["train_horses","🐎","Держу лошадей и подбадриваю всех","без меня никто не уедет"]
    ]
  },
  {
    text: "Тебя внезапно попросили сказать тост на свадьбе малознакомых людей.",
    sub: "У тебя 30 секунд и стакан компота.",
    options: [
      ["toast_contest","🎤","Объявляю конкурс, ведущий - я","свадьба теперь под моим управлением"],
      ["toast_stand","🙌","Поднимаю весь зал на ноги","встали все, даже бабушка"],
      ["toast_short","🎯","Коротко и по делу","за молодых, садимся"],
      ["toast_story","💬","Рассказываю, как познакомился с ними пять минут назад","это уже семейная легенда"],
      ["toast_cry","😭","Говорю так трогательно, что плачет официант","я сам не ожидал"],
      ["toast_aunt","👵","Передаю слово тёте, она явно готовилась","у неё листок на три страницы"]
    ]
  },
  {
    text: "Вы проиграли. В голосовом пауза. Что ты скажешь первым?",
    sub: "Именно это зрители и запомнят.",
    options: [
      ["lost_review","🔍","Так, разбираем, что пошло не так","у меня есть таймкоды"],
      ["lost_again","🔁","Ещё раз. Сейчас. Тот же план","план был хороший, исполнение - нет"],
      ["lost_onme","🙋","Это на мне, исправлю","беру удар на себя"],
      ["lost_beauty","🎬","Зато как красиво проиграли","это надо в нарезку"],
      ["lost_fall","🤣","Кто видел, как я упал? Это было лучшее","я горжусь этим моментом"],
      ["lost_tea","☕","Иду за чаем. Кому принести?","поражение лечится чаем"]
    ]
  },
  {
    text: "Вы идёте в горы. Что кладёшь в общий рюкзак?",
    sub: "Место есть только для одной вещи.",
    options: [
      ["pack_map","🧭","Карту и компас","дорогу знаю я, остальные знают меня"],
      ["pack_radio","📻","Рацию - и раздаю позывные","Орёл-1, это Орёл-2, приём"],
      ["pack_firstaid","🩹","Аптечку на всех","кто-то точно упадёт, и это будешь ты"],
      ["pack_guitar","🎸","Гитару","у костра без неё не то"],
      ["pack_snacks","🍫","Лишние вкусняшки","кто-нибудь точно забудет свои"],
      ["pack_fireworks","🎆","Фейерверк","для сигнала. И для души"]
    ]
  },
  {
    text: "Последний вопрос. После игры тебе приятнее всего услышать…",
    sub: "Отвечай честно. Шериф смотрит.",
    options: [
      ["final_plan","🏆","«Хорошо, что сделали по-твоему»","признание стратегического гения"],
      ["final_carry","💪","«Ты нас вытащил»","ну кто-то же должен был"],
      ["final_saw","👁️","«Как ты это заметил?»","я всё вижу. Почти"],
      ["final_fun","😂","«Я давно так не смеялся»","лучшая награда"],
      ["final_again","🔁","«Давай завтра ещё»","позвали снова - значит, всё не зря"],
      ["final_calm","🌙","«С тобой спокойно»","высшая форма бро-признания"]
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
