require("dotenv").config();
const mysql = require("mysql2");
const express = require("express");
const cors = require("cors");
const app = express();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.use(cors()); // Allows the HTML file to talk to this server
app.use(express.json()); // Allows the server to read JSON data

app.post("/login", (req, res) => {
  const { email } = req.body;

  const getUserQuery = "SELECT * FROM users WHERE email = ?";
  connection.query(getUserQuery, [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({
        message: "User not found. Please check your email or sign up.",
      });
    }
    res.status(200).json({ message: "User found", userId: results[0].user_id });
  });
});

app.get("/getUserDetails/:id", (req, res) => {
  const userId = req.params.id;
  console.log("Fetching details for user ID:", userId);

  const getUserDetailsQuery = "SELECT * FROM users WHERE user_id = ?";
  connection.query(getUserDetailsQuery, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(results[0]);
  });
});

app.post("/addUser", (req, res) => {
  const { name, email, age, phone, gender, questionnaireCompleted } = req.body;

  const addUserQuery =
    "INSERT INTO users (email, name, age, phone_number, gender) VALUES (?, ?, ?, ?, ?)";
  connection.query(
    addUserQuery,
    [name, email, age, phone, gender],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }
      res
        .status(200)
        .json({ message: "User added successfully!", userId: result.insertId });
    }
  );
});

app.post("/updateUser", (req, res) => {
  const { userId, name, email, phone, age, gender, questionnaireCompleted } =
    req.body;

  const updateUserQuery =
    "UPDATE users SET name=?, email=?, age=?, gender=? WHERE user_id=?";
  connection.query(
    updateUserQuery,
    [name, email, age, gender, userId],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }
      res.status(200).json({
        message: "User updated successfully!",
        userId,
      });
    }
  );
});

app.post("/updateQuestionnaire", (req, res) => {
  /**
   * request data body
    {
        id: '28',
        questionnaireCompleted: true,
        questionnaireAnswers: {
        q1: 'isolation',
        q2: 'rarely',
        q3: 'critical',
        q4: 'not_important',
        q5: 'never',
        q6: 'understanding',
        q7: 'guided',
        q8: 'time',
        q9: 'very_low',
        q10: '1',
        q11: 'very_uncomfortable',
        q12: 'rarely_never',
        q13: 'never',
        q14: 'almost_never',
        q15: 'not_important'
    }
     */
  console.log(req.body);
  // const { name, email, phone, age, gender, questionnaireCompleted } = req.body;

  // const addUserQuery =
  //   "INSERT INTO users (email, name, age, gender) VALUES (?, ?, ?, ?)";
  // connection.query(addUserQuery, [name, email, age, gender], (err, result) => {
  //   if (err) {
  //     console.error(err);
  //     return res.status(500).json({ message: "Database error" });
  //   }
  //   res.status(200).json({ message: "User added successfully!" });
  // });
});

app.post("/addJournalEntry", (req, res) => {
  const { userId, date, text } = req.body;

  const addJournalEntryQuery =
    "INSERT INTO journal_entries (user_id, entry_date, content) VALUES (?, ?, ?)";
  connection.query(
    addJournalEntryQuery,
    [userId, date, text],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }
      res
        .status(200)
        .json({ message: "Journal Entry added successfully!", userId });
    }
  );
});

app.get("/getUserMoods/:id", (req, res) => {
  const userId = req.params.id;
  const logDate = new Date().toISOString().split("T")[0];

  console.log("Fetching details for user ID:", userId);

  const getUserMoodsQuery =
    "SELECT * FROM mood_logs WHERE user_id = ? and log_date = ?";
  connection.query(getUserMoodsQuery, [userId, logDate], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "No mood logs" });
    }
    res.status(200).json(results);
  });
});

app.post("/addMood", (req, res) => {
  const { userId, logDate, logHour, mood } = req.body;

  const getExistingMoodQuery =
    "SELECT * FROM mood_logs WHERE user_id = ? AND log_date = ? AND log_hour = ?";
  connection.query(
    getExistingMoodQuery,
    [userId, logDate, logHour],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }
      if (results.length === 0) {
        const addNewMoodQuery =
          "INSERT INTO mood_logs (user_id, log_date, log_hour, mood_type) VALUES (?, ?, ?, ?)";
        connection.query(
          addNewMoodQuery,
          [userId, logDate, logHour, mood],
          (err, result) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: "Database error" });
            }
            res
              .status(200)
              .json({ message: "Mood added successfully!", userId });
          }
        );
      } else {
        const updateMoodQuery =
          "UPDATE mood_logs SET mood_type = ? WHERE user_id = ? AND log_date = ? AND log_hour = ?";
        connection.query(
          updateMoodQuery,
          [mood, userId, logDate, logHour],
          (err, result) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: "Database error" });
            }
            res
              .status(200)
              .json({ message: "Mood updated successfully!", userId });
          }
        );
      }
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
});
