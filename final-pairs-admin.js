// ========================================
// ФИНАЛЬНОЕ РАСПРЕДЕЛЕНИЕ ПАР
// IDEAL BRO
// ========================================


// ===============================
// НАСТРОЙКИ
// ===============================

const ADMIN_PASSWORD = "CORN99";


const FINAL_PAIRS = [

  {
    pair: 1,
    players: [
      "УЧАСТНИК 01",
      "УЧАСТНИК 04"
    ]
  },

  {
    pair: 2,
    players: [
      "УЧАСТНИК 02",
      "УЧАСТНИК 06"
    ]
  },

  {
    pair: 3,
    players: [
      "УЧАСТНИК 03",
      "УЧАСТНИК 05"
    ]
  }

];


// ===============================
// ЭЛЕМЕНТЫ
// ===============================

const $ = id =>
  document.getElementById(id);


let running = false;



// ===============================
// ВХОД
// ===============================

$("unlock").addEventListener(
  "click",
  () => {

    if (
      $("password").value === ADMIN_PASSWORD
    ) {

      $("lock").classList.add("hidden");

      $("panel").classList.remove("hidden");

    }

    else {

      $("error").classList.remove("hidden");

    }

  }
);

$("password").addEventListener(
  "keydown",
  (event) => {

    if (event.key === "Enter") {
      $("unlock").click();
    }

  }
);



// ===============================
// СТАРТ
// ===============================

$("startBtn").addEventListener(
  "click",
  startReveal
);


async function startReveal() {

  if (running) return;

  running = true;


  $("startBtn").disabled = true;


  clearResult();


  await loading(
    "ПОДКЛЮЧЕНИЕ К ПРОТОКОЛУ..."
  );


  await loading(
    "АНАЛИЗ РЕЗУЛЬТАТОВ ПРЕДЫДУЩИХ ЭТАПОВ..."
  );


  await loading(
    "ПОИСК ОПТИМАЛЬНЫХ СОЧЕТАНИЙ..."
  );


  await loading(
    "ФОРМИРОВАНИЕ ФИНАЛЬНЫХ ПАР..."
  );


  $("loader")
    .classList
    .add("hidden");


  await revealPairs();


  finalAnimation();


}



// ===============================
// ЗАГРУЗКА
// ===============================

function loading(text) {

  return new Promise(resolve => {

    $("loader")
      .classList
      .remove("hidden");


    $("loaderText")
      .textContent = text;


    setTimeout(
      resolve,
      1800
    );

  });

}



// ===============================
// ПОКАЗ ПАР
// ===============================

async function revealPairs() {


  const box =
    $("pairsBox");


  for (
    const pair of FINAL_PAIRS
  ) {


    const card =
      document.createElement(
        "article"
      );


    card.className =
      "final-pair-card";


    card.innerHTML = `

      <div class="final-pair-number">
        ПАРА ${String(pair.pair).padStart(2,"0")}
      </div>


      <div class="final-player">
        ${pair.players[0]}
      </div>


      <div class="final-plus">
        +
      </div>


      <div class="final-player">
        ${pair.players[1]}
      </div>

    `;


    box.appendChild(card);


    await wait(1500);

  }


  const done =
    document.createElement(
      "div"
    );


  done.className =
    "final-complete";


  done.innerHTML = `

    <span>
      ◈
    </span>

    <h2>
      ФИНАЛЬНЫЕ ПАРЫ СФОРМИРОВАНЫ
    </h2>

    <p>
      Протокол распределения завершён
    </p>

  `;


  box.appendChild(done);

}



// ===============================
// БЫСТРЫЙ ПОКАЗ
// ===============================

$("showBtn")?.addEventListener(
  "click",
  () => {

    clearResult();

    FINAL_PAIRS.forEach(pair => {

      const card =
        document.createElement(
          "article"
        );

      card.className =
        "final-pair-card";


      card.innerHTML = `

        <div class="final-pair-number">
          ПАРА ${pair.pair}
        </div>

        <div class="final-player">
          ${pair.players[0]}
        </div>

        <div class="final-plus">
          +
        </div>

        <div class="final-player">
          ${pair.players[1]}
        </div>

      `;


      $("pairsBox")
        .appendChild(card);

    });

  }
);



// ===============================
// RESET
// ===============================

$("resetBtn").addEventListener(
  "click",
  () => {

    running = false;

    clearResult();

    $("startBtn")
      .disabled = false;

  }
);



function clearResult() {

  $("pairsBox")
    .innerHTML = "";

}



// ===============================
// САЛЮТ
// ===============================

function finalAnimation() {


  const sparks =
    document.createElement(
      "div"
    );


  sparks.className =
    "gold-sparks";


  document.body
    .appendChild(sparks);



  for (
    let i = 0;
    i < 180;
    i++
  ) {

    const spark =
      document.createElement(
        "span"
      );


    spark.className =
      "gold-spark";


    spark.style.left =
      "50%";


    spark.style.top =
      "45%";


    spark.style.setProperty(
      "--x",
      `${Math.random()*900-450}px`
    );


    spark.style.setProperty(
      "--y",
      `${Math.random()*600-300}px`
    );


    sparks.appendChild(
      spark
    );

  }


  setTimeout(
    () => sparks.remove(),
    1500
  );

}



// ===============================
// HELPERS
// ===============================

function wait(ms) {

  return new Promise(
    resolve =>
      setTimeout(resolve, ms)
  );

}
