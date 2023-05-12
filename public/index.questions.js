const existingQuestions = document.querySelector("#existingQuestions");
const deleteQuestion = document.querySelector("#delExisstingQuestions");
const addQuestionInput = document.getElementById("addQuestion");
const submitBtn = document.getElementById("submit");
const backToGameBtn = document.querySelector("#backToGame");
const answerInput = document.querySelectorAll(".addAnswers");
const radio = document.querySelectorAll(".radio");

backToGameBtn.addEventListener("click", (event) => {
  console.log("ok");
  window.location.href = `http://localhost:3000/game`;
});

function getQuestions() {
  addQuestionInput.value = "";
  existingQuestions.innerHTML = "";
  fetch("/api/questions")
    .then((response) => response.json())
    .then((respons) => {
      respons.forEach((question) => {
        existingQuestions.innerHTML += `<div id="${question.id}" class="questions">${question.question}<button id='${question.id}' class='delBtn'><img src='/static/delete-button-svgrepo-com.svg'DELETE</button></div><hr noshade>`;
      });
      const delBtn = document.querySelectorAll(".delBtn");
      delBtn.forEach((button) => {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          fetch(`/api/questions/${event.target.id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((res) => {
              if (res.ok) {
                getQuestions();
                console.log("Deleted succesfully");
              } else {
                console.log("Delete was unsuccesfull");
              }
            })
            .catch((error) => console.log(error));
        });
      });
    });
}
getQuestions();

submitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  answerInput[0].value = "";
  answerInput[1].value = "";
  answerInput[2].value = "";
  answerInput[3].value = "";
  let inputDataQuestions = {
    question: addQuestionInput.value,
    answers: [
      {
        answer: answerInput[0].value,
        is_correct: radio[0].checked,
      },
      {
        answer: answerInput[1].value,
        is_correct: radio[1].checked,
      },
      {
        answer: answerInput[2].value,
        is_correct: radio[2].checked,
      },
      {
        answer: answerInput[3].value,
        is_correct: radio[3].checked,
      },
    ],
  };

  fetch("/api/questions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(inputDataQuestions),
  }).then((response) => {
    if (response.ok) {
      return;
    } else {
      throw new Error("Submit not successfull");
    }
  });
  getQuestions();
});
