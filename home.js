// ========================================
// СОСТОЯНИЕ ИВЕНТА
// меняется вручную перед каждым этапом
// ========================================

const EVENT_STATE = "before-day-1";

/*
Варианты:

date-tba
before-day-1
day-1-live
before-day-2
day-2-live
before-day-3
day-3-live
finished

*/


// ========================================
// ДАТЫ ЭТАПОВ
// ========================================

// Время этапов указано по Москве (UTC+3).
const EVENT_DATES = {

  day1: new Date("2026-11-27T18:00:00+03:00"),

  day2: new Date("2026-11-28T18:00:00+03:00"),

  day3: new Date("2026-11-29T18:00:00+03:00")

};


// Сколько часов длится стрим
const STAGE_DURATION_HOURS = 6;

const $ = (id) => document.getElementById(id);

function pad(value) {

  if (value === "--") {
    return "--";
  }
  return String(value).padStart(2, "0");
}

const countdownFields = ["days", "hours", "minutes"].map($);

function setTime(days, hours, minutes) {
  [days, hours, minutes].forEach((value, index) => {
    const field = countdownFields[index];
    const next = pad(value);
    if (field.textContent !== next) field.textContent = next;
  });
}

function setPlaceButton(text, link = "https://www.twitch.tv/krusheri") {
  const button = document.querySelector(".place-button");

  if (!button) return;

  button.textContent = text;
  button.href = link;
}


function showWaiting(title, status, targetDate) {

  $("countdownTitle").textContent = title;

  $("countdownNote").textContent = "";

  $("countdownStatus").innerHTML = `
    <span class="status-dot"></span>
    ${status}
  `;


  startCountdown(targetDate);
}

function startCountdown(targetDate) {
  const minuteMs = 60_000;

  function tick() {
    const remaining = targetDate - Date.now();
    const totalMinutes = Math.max(0, Math.ceil(remaining / minuteMs));
    setTime(
      Math.floor(totalMinutes / 1440),
      Math.floor(totalMinutes / 60) % 24,
      totalMinutes % 60
    );

    if (remaining > 0) setTimeout(tick, remaining % minuteMs || minuteMs);
  }

  tick();
}

function showActiveStage(stage) {
  setTime(stage.day, EVENT_DAYS.length, 0);

  $("countdownTitle").textContent =
    `ДЕНЬ ${pad(stage.day)} / ${pad(EVENT_DAYS.length)}`;

  $("countdownNote").textContent = stage.title;

  $("countdownStatus").innerHTML = `
    <span class="status-dot"></span>
    ЭТАП ${pad(stage.day)} АКТИВЕН
  `;
}

function showFinished() {
  setTime(0, 0, 0);

  $("countdownTitle").textContent = "ЭКСПЕРИМЕНТ ЗАВЕРШЁН";

  $("countdownNote").textContent =
    "Финальный протокол сформирован";

  $("countdownStatus").innerHTML = `
    <span class="status-dot"></span>
    ОБРАБОТКА РЕЗУЛЬТАТОВ ЗАВЕРШЕНА
  `;
}

function initializeCountdown() {


  switch(EVENT_STATE) {

    case "date-tba":
  
      setTime("--", "--", "--");
    
      $("countdownTitle").textContent =
        "ДАТА НЕ ОПРЕДЕЛЕНА";
    
    
      $("countdownNote").textContent =
        "Следите за обновлениями";
    
    
      $("countdownStatus").innerHTML = `
        <span class="status-dot"></span>
        ДАТА ЭКСПЕРИМЕНТА УТОЧНЯЕТСЯ
      `;
    
    
      setPlaceButton(
        "ПЕРЕЙТИ НА КАНАЛ →"
      );
    
    
      break;
      
    case "before-day-1":

      showWaiting(
        "ДО НАЧАЛА ЭКСПЕРИМЕНТА",
        "СИСТЕМА В РЕЖИМЕ ОЖИДАНИЯ",
        EVENT_DATES.day1
      );

      setPlaceButton(
        "ПЕРЕЙТИ НА КАНАЛ →"
      );

      break;



    case "day-1-live":

      setTime(0,0,0);

      $("countdownTitle").textContent =
        "ПЕРВЫЙ ЭТАП / LIVE";


      $("countdownNote").textContent =
        "Эксперимент начался";


      $("countdownStatus").innerHTML = `
        <span class="status-dot"></span>
        ЭТАП 01 ИДЁТ
      `;


      setPlaceButton(
        "СМОТРЕТЬ СТРИМ →"
      );

      break;



    case "before-day-2":

      showWaiting(
        "ДО ВТОРОГО ЭТАПА",
        "ОЖИДАНИЕ СЛЕДУЮЩЕГО ЭТАПА",
        EVENT_DATES.day2
      );

      setPlaceButton(
        "ПЕРЕЙТИ НА КАНАЛ →"
      );

      break;



    case "day-2-live":

      setTime(0,0,0);

      $("countdownTitle").textContent =
        "ВТОРОЙ ЭТАП / LIVE";


      $("countdownNote").textContent =
        "Новое испытание началось";


      $("countdownStatus").innerHTML = `
        <span class="status-dot"></span>
        ЭТАП 02 ИДЁТ
      `;

      setPlaceButton(
        "СМОТРЕТЬ СТРИМ →"
      );

      break;



    case "before-day-3":

      showWaiting(
        "ДО ФИНАЛЬНОГО ЭТАПА",
        "ОЖИДАНИЕ ФИНАЛА",
        EVENT_DATES.day3
      );

      setPlaceButton(
        "ПЕРЕЙТИ НА КАНАЛ →"
      );

      break;



    case "day-3-live":

      setTime(0,0,0);

      $("countdownTitle").textContent =
        "ФИНАЛ / LIVE";


      $("countdownNote").textContent =
        "Последний этап эксперимента";


      $("countdownStatus").innerHTML = `
        <span class="status-dot"></span>
        ФИНАЛЬНЫЙ ЭТАП ИДЁТ
      `;


      setPlaceButton(
        "СМОТРЕТЬ ФИНАЛ →"
      );

      break;



    case "finished":

      setTime(0,0,0);


      $("countdownTitle").textContent =
        "ЭКСПЕРИМЕНТ ЗАВЕРШЁН";


      $("countdownNote").textContent =
        "Финальный протокол сформирован";


      $("countdownStatus").innerHTML = `
        <span class="status-dot"></span>
        РЕЗУЛЬТАТЫ ОПУБЛИКОВАНЫ
      `;


      setPlaceButton(
        "ПОСМОТРЕТЬ РЕЗУЛЬТАТЫ →",
        "results.html"
      );

      break;

  }

}

initializeCountdown();
