const manageBtn = document.querySelector("#manageQuestions");
const questionId = document.querySelector("#questionId");
const firstBtn = document.querySelector("#first_p");
const secondBtn = document.querySelector("#second_p");
const thirdBtn = document.querySelector("#third_p");
const fourthBtn = document.querySelector("#fourth_p");
const score = document.querySelector("#score");
const timer = document.querySelector("#time");
const start = document.querySelector("#start");
let scoreCount = 0;

manageBtn.addEventListener("click", (event) => {
  window.location.href = `http://localhost:3000/questions`;
});

start.addEventListener("click", () => {
  start.style.visibility = "hidden";
});

function startShowing() {
  function getGame() {
    timer.innerHTML = 10;
    const timeee = setInterval(() => {
      timer.innerHTML--;
      console.log(timer.innerHTML);
      if (timer.innerHTML == 0) {
        clearInterval(timeee);
        getGame();
      }
    }, 1000);

    score.innerHTML = scoreCount;
    fetch("/api/game")
      .then((response) => response.json())
      .then((response) => {
        questionId.innerHTML = response.question;
        firstBtn.innerHTML = response.answers[0].answer;
        secondBtn.innerHTML = response.answers[1].answer;
        thirdBtn.innerHTML = response.answers[2].answer;
        fourthBtn.innerHTML = response.answers[3].answer;
        firstBtn.style.color = "#ffbf01";
        secondBtn.style.color = "#ffbf01";
        thirdBtn.style.color = "#ffbf01";
        fourthBtn.style.color = "#ffbf01";

        function handler(event, index) {
          event.preventDefault();
          console.log(response.answers[index].is_correct);
          if (response.answers[index].is_correct == 0) {
            event.target.style.color = "red";
          } else if (response.answers[index].is_correct == 1) {
            event.target.style.color = "green";
            scoreCount++;
          }
          setTimeout(() => {
            getGame();
          }, 2000);
        }

        firstBtn.onclick = (event) => {
          clearInterval(timeee);
          handler(event, 0);
        };
        secondBtn.onclick = (event) => {
          clearInterval(timeee);
          handler(event, 1);
        };
        thirdBtn.onclick = (event) => {
          clearInterval(timeee);
          handler(event, 2);
        };
        fourthBtn.onclick = (event) => {
          clearInterval(timeee);
          handler(event, 3);
        };
      });
  }
  getGame();

  var elementToHide = document.getElementById("container");
  elementToHide.style.opacity = 0;
  var intervalId = setInterval(function () {
    if (elementToHide.style.opacity >= 1) {
      clearInterval(intervalId);
    } else {
      elementToHide.style.opacity =
        parseFloat(elementToHide.style.opacity) + 0.04;
    }
  }, 50);
}
