const express = require("express");
const mysql = require("mysql");
const path = require("path");
const app = express();
const port = 3000;

const conn = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "yourpassword",
  database: "quiz",
  debug: false,
});

conn.connect((err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("Connection established");
});

app.use(express.json());

app.use("/static", express.static(path.join(__dirname, "public")));

app.get("/game", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "game.html"));
});

app.get("/questions", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "questions.html"));
});

app.get("/api/game", (req, res) => {
  const questionQuerry = `SELECT * FROM questions ORDER BY RAND() LIMIT 1;`;
  conn.query(questionQuerry, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: "Database Error" });
      return;
    }
    const questionId = result[0].id;
    const answerQuerry = `SELECT * FROM questions INNER JOIN answers on questions.id = answers.question_id where answers.question_id = ${questionId} `;
    conn.query(answerQuerry, (answerError, answers) => {
      if (answerError) {
        console.log(answerError);
        res.status(500).send({ message: "Database Error" });
        return;
      }
      console.log(answers);
      res.status(200).send({
        id: questionId,
        question: result[0].question,
        answers: answers,
      });
    });
  });
});

// app.get("/api/questions", (req, res) => {
//   const questionQuerry = `SELECT * FROM questions;`;
//   conn.query(questionQuerry, (err, rows) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send({ message: "Database Error" });
//       return;
//     }
//     res.send(rows);
//   });
// });

let questionsData = null;

app.get("/api/questions", (req, res) => {
  // If data has been fetched already, send the cached data
  if (questionsData) {
    res.send(questionsData);
    return;
  }

  // Check if question data has already been fetched
  if (questionsData !== null) {
    res.status(200).send({ message: "Questions already fetched" });
    return;
  }

  const questionQuery = `SELECT * FROM questions;`;
  conn.query(questionQuery, (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: "Database Error" });
      return;
    }

    // Cache the fetched data
    questionsData = rows;

    res.send(questionsData);
  });
});

function validateQuestion(data) {
  if (!data.question) {
    throw new Error('Missing question');
  }

  if (!Array.isArray(data.answers)) {
    throw new Error('Missing answers');
  }

  if (data.answers.length < 2) {
    throw new Error('Not enough answers');
  }

  if (data.answers.length > 4) {
    throw new Error('Too many answers');
  }

  let correctCount = 0;

  data.answers.forEach((answer) => {
    if (!answer.answer)  {
      throw new Error('Missing answer');
    }

    if (answer.is_correct) {
      correctCount++;
    }
  });

  if (correctCount !== 1) {
    throw new Error('One correct answer is needed');
  }
}

app.post("/api/questions", (req, res) => {

  try {
    validateQuestion(req.body);
  } catch (error) {
    res.status(400).send({ message: error.message });
    return;
  }

  const insertQuestionQuery = `INSERT INTO questions(question) VALUES (?)`;
  const params = req.body.question;
  const ansParams = req.body.answers;

  conn.query(insertQuestionQuery, params, (err, result) => {
    console.log(params[0].length);
    if (err) {
      res.status(500).send({ message: "Database Error" });
      return;
    }

    for (let i = 0; i < ansParams.length; i++) {
      const insertAnswerQuery = `INSERT INTO answers(question_id, answer, is_correct) VALUES (?, ?, ?)`;
      const answerParams = [
        result.insertId,
        ansParams[i].answer,
        ansParams[i].is_correct,
      ];
      conn.query(insertAnswerQuery, answerParams, (err, result) => {
        if (err) {
          res.status(500).send({ message: "Database Error" });
          return;
        }
      });

      if (err) {
        res.status(500).send({ message: "Database Error" });
        return;
      }
    }
  });
  res.status(201).send();
});

app.delete("/api/questions/:id", (req, res) => {
  const selectQuery = `SELECT * FROM questions WHERE id = ?`;
  const params = [req.params.id];
  const deleteQuery = `DELETE FROM questions WHERE id = ?`;
  const deleteAnswersQuery = `DELETE FROM answers WHERE question_id = ?`

  conn.query(selectQuery, params, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: "Database Error" });
      return;
    }
    conn.query(deleteQuery, params, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send({ message: "Database Error" });
        return;
      }

      conn.query(deleteAnswersQuery, params, (err) => {
        if (err) {
          console.error(err);
          res.status(500).send({ message: "Database Error" });
          return;
        }
      })
      res.status(200).send({ message: "Post successfully deleted" });
    });
  });
});

app.listen(port, () => {
  console.log("Server running on port " + port);
});
