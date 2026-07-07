// Когда узнаем дату ивента, просто впиши её сюда.
// Пример:
// const EVENT_DATE = new Date("2026-08-15T18:00:00");
const EVENT_DATE = new Date("2026-10-15T18:00:00");
// const EVENT_DATE = null;

const $ = (id) => document.getElementById(id);

function pad(value){
  return String(value).padStart(2, "0");
}

function updateCountdown(){
  if (!EVENT_DATE) return;

  const now = new Date();
  const difference = EVENT_DATE - now;

  if (difference <= 0){
    $("days").textContent = "00";
    $("hours").textContent = "00";
    $("minutes").textContent = "00";

    $("countdownNote").textContent = "Эксперимент начался";
    return;
  }

  const days = Math.floor(difference / 86400000);
  const hours = Math.floor((difference / 3600000) % 24);
  const minutes = Math.floor((difference / 60000) % 60);

  $("days").textContent = pad(days);
  $("hours").textContent = pad(hours);
  $("minutes").textContent = pad(minutes);

  $("countdownNote").textContent =
    EVENT_DATE.toLocaleString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
}

updateCountdown();
setInterval(updateCountdown, 1000);
