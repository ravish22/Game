  function debounce(func, wait) {
    let timeout;

    return function() {
      clearTimeout(timeout);
      timeout = setTimeout(func, wait);
    };
  }

  function showEl(el) { el.classList.remove("hide"); }

  function hideEl(el) { el.classList.add("hide"); }

  function readTopScore() {
    if (window.localStorage) {
      try {
        const score = JSON.parse(window.localStorage.getItem("SCROLL_RUN_SCORE"));
        return score || {};
      } catch(e) {
        return {};
      }
    }
  }

  function saveTopScore(score) {
    if (window.localStorage) {
      window.localStorage.setItem("SCROLL_RUN_SCORE", JSON.stringify(score));
    }
  }

  function randInt(max) { return ~~(Math.random() * max); }

  function formatTime(ms) { return `${ms / 1000}s`; }

  document.addEventListener("DOMContentLoaded", function() {
    const topScore = readTopScore();

    // DOM
    const trackEl = document.querySelector(".track");
    const bubbleEl = document.querySelector(".bubble");
    const scoreBoardEl = document.querySelector(".scoreboard");
    const scoreEl = document.querySelector(".score");
    const body = document.body;
    let startEl = null;
    let titleEl = null;

    // dom helpers
    function lockScroll() {
      body.style.overflow = "hidden";
    }

    function unlockScroll() {
      body.style.overflow = "";
    }

    // render functions

    function renderMenu() {
      trackEl.innerHTML = `
        <div class="segment">
          <span class="title chalk">SCROLLER</span>
        </div>
        <button class="segment d10" data-start="1000">
          <span class="label chalk">1k</span>
        </button>
        <button class="segment d10" data-start="5000">
          <span class="label chalk">5k</span>
        </button>
        <button class="segment d10" data-start="10000">
          <span class="label chalk">10k</span>
        </button>
        <button class="segment d10" data-start="21097">
          <span class="label chalk">21k</span>
        </button>
        <button class="segment d10" data-start="42195">
          <span class="label chalk">42k</span>
        </button>
      `;
    }

    function renderRun(distance) {
      let track = `
        <div class="segment start d10">
          <span class="title chalk">START</span>
        </div>
      `;

      for (i = 0; i < distance / 100; i++) {
        let segmentDistance = (i + 1) * 100;

        if (segmentDistance > distance) {
          segmentDistance = distance;
        }

        track += `
          <div class="segment d100">
            <span class="label chalk">${segmentDistance}</span>
          </div>
        `;
      }

      trackEl.innerHTML = track;
      startEl = trackEl.querySelector(".start");
      titleEl = trackEl.querySelector(".title");
    }

    // game state

    let count; // countdown counter
    let startTime; // start of the run
    let time; // current time
    let timeInterval; // time counting setTnterval ref to clear
    let checkpoint; // reached the scroll checkpoint ?
    let distance; // distance of current run
    let finished; // has run finished
    let silenceOnScroll; // should scroll silence the comment?
    let silenceTimeout; // comment silence setTimeout reference to clear
    let commentTimeout; // comment setTimeout ref to clear

    function initMenu() {
      hideEl(scoreBoardEl);
      renderMenu();
      say("Choose your distance");
      finished = false;
    }

    function initRun(dist) {
      distance = dist;
      checkpoint = false;
      time = 0;
      window.scrollTo(0, 1);

      lockScroll();
      renderRun(distance);
      initCountdown();
    }

    function initCountdown() {
      count = 5;

      function countdown() {
        if (count) {
          say(`Start in: ${count}...`);
          count -= 1;
          setTimeout(countdown, 1000);
        } else {
          startRun();
        }
      }

      countdown();
    }

    // comment bubble

    function say(something) {
      clearTimeout(silenceTimeout);
      bubbleEl.classList.remove("silent");
      bubbleEl.innerHTML = something;
    }

    function silence(delay) {
      silenceOnScroll = false;
      clearTimeout(silenceTimeout);

      if (!delay) {
        bubbleEl.classList.add("silent");
      } else {
        silenceTimeout = setTimeout(function(){
          bubbleEl.classList.add("silent");
        }, delay);
      }
    }

    const comments = [
      "Run, Forrest, Run!",
      "Run like you stole something!",
      "There will be cake!",
      "Almost there!",
      "If only real running was that easy!",
      "Faster!",
      "Go! Go! Go!",
      "You can do it!",
      "Am I distracting you?",
      "Lorem ipsum!" // aaa, I need to sumbit it soon and I'm out of ideas ;)
    ];

    function initComments() {
      function comment() {
        say(comments[randInt(comments.length)]);
        silence(2000 + randInt(3000));

        commentTimeout = setTimeout(comment, 6000 + randInt(5000));
      }
      commentTimeout = setTimeout(comment, 7000 + randInt(5000));
    }

    function startRun() {
      unlockScroll();
      showEl(scoreBoardEl);
      say("Scroll!");
      silence(5000);
      silenceOnScroll = true;

      startTime = Date.now();
      timeInterval = setInterval(timeTick, 1);

      window.addEventListener("scroll", debouncedScroll);
      initComments();
    }

    function finishRun() {
      clearInterval(timeInterval);
      clearTimeout(commentTimeout);

      if (!topScore[distance] || time < topScore[distance]) {
        say(`Finished in ${formatTime(time)}!<br/>New record!`);
        topScore[distance] = time;
        saveTopScore(topScore);
      } else {
        const diff = time - topScore[distance];
        say(`Finished in ${formatTime(time)}!<br/>${formatTime(diff)} to beat the record.`);
      }

      window.removeEventListener("scroll", debouncedScroll);
      finished = true;
    }

    function timeTick() {
      const now = Date.now();
      time = now - startTime;
      scoreEl.innerHTML = formatTime(time);
    }

    function checkpointReached() {
      clearTimeout(commentTimeout);
      say("Scroll back!");
      silence(5000);
      silenceOnScroll = true;
      initComments();

      checkpoint = true;
      startEl.classList.add("finish");
      titleEl.innerHTML = "FINISH";
    }

    window.addEventListener("click", function(event) {
      if (finished) {
        initMenu();
        return;
      }

      const target = event.target.closest("[data-start]");

      if (target) {
        if (target.dataset["start"]) {
          initRun(+target.dataset["start"]);
        }
      }
    });

    function scrollHandler() {
      if (silenceOnScroll) {
        silence();
        silenceOnScroll = false;
      }

      if (
        window.innerHeight + window.pageYOffset >=
        document.body.offsetHeight
      ) {
        checkpointReached();
      }
      if (window.pageYOffset <= 0 && checkpoint) {
        finishRun();
      }
    }

    const debouncedScroll = debounce(scrollHandler, 200);

    initMenu();
  });