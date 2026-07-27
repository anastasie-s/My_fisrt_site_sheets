// ========================================
// СОСТОЯНИЕ ИВЕНТА
// меняется вручную перед каждым этапом
// ========================================

const EVENT_STATE = "date-tba";

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

const EVENT_DATES = {

  day1: new Date("2030-10-15T18:00:00"),

  day2: new Date("2030-10-16T18:00:00"),

  day3: new Date("2030-10-17T18:00:00")

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

function formatEventDate(date) {
  return date.toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function setTime(days, hours, minutes) {
  $("days").textContent = pad(days);
  $("hours").textContent = pad(hours);
  $("minutes").textContent = pad(minutes);
}

function setPlaceButton(text, link = "https://www.twitch.tv/krusheri") {
  const button = document.querySelector(".place-button");

  if (!button) return;

  button.textContent = text;
  button.href = link;
}


function showWaiting(title, note, status, targetDate) {

  $("countdownTitle").textContent = title;

  $("countdownNote").textContent = note;

  $("countdownStatus").innerHTML = `
    <span class="status-dot"></span>
    ${status}
  `;


  if (targetDate) {

    const now = new Date();
    const difference = targetDate - now;


    const days = Math.max(
      0,
      Math.floor(difference / 86400000)
    );

    const hours = Math.max(
      0,
      Math.floor((difference / 3600000) % 24)
    );

    const minutes = Math.max(
      0,
      Math.floor((difference / 60000) % 60)
    );


    setTime(days, hours, minutes);

  }
}

function showCountdown(targetDate, title, note, status) {
  const now = new Date();
  const difference = targetDate - now;

  const days = Math.floor(difference / 86400000);
  const hours = Math.floor((difference / 3600000) % 24);
  const minutes = Math.floor((difference / 60000) % 60);

  setTime(days, hours, minutes);

  $("countdownTitle").textContent = title;
  $("countdownNote").textContent = note;

  $("countdownStatus").innerHTML = `
    <span class="status-dot"></span>
    ${status}
  `;
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

function updateCountdown() {


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
        formatEventDate(EVENT_DATES.day1),
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
        formatEventDate(EVENT_DATES.day2),
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
        formatEventDate(EVENT_DATES.day3),
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

updateCountdown();

setInterval(updateCountdown, 1000);
