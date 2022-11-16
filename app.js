require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();

// db imports
const db = require("./db/connect");

// error handler imports
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// router imports
const authRouter = require("./routes/auth");
const jobsRouter = require("./routes/jobs");
const authUser = require("./middleware/authentication");

// middlewares
app.use(express.json());

// routes
app.get("/", (req, res) => {
  res.send(
    "<a href='http://localhost:3000/api/v1/jobs/'>jobs api</a><br><a href='http://localhost:3000/api/v1/auth/'>auth api</a>"
  );
});

// api routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authUser, jobsRouter);

// end middlewares
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await db(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
