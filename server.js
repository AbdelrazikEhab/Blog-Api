const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
require("./config/DBconfig");
const userRouter = require("./routes/users/usersRoute");
const postRoute = require("./routes/posts/postRoute.js");
const commentRoute = require("./routes/comments/commentRoute.js");
const categoryRoute = require("./routes/category/categoryRoute.js");
const ErrorHandeller = require("./middlewares/ErrorHandeler.js");
const app = express();

//middlewares
app.use(express.json());

// user route
app.use("/api/v1/users", userRouter);

// post route
app.use("/api/v1/posts", postRoute);

// comment route
app.use("/api/v1/comments", commentRoute);

// category route
app.use("/api/v1/categories", categoryRoute);

app.use(ErrorHandeller);

app.use("*", (req, res) => {
  res.status(404).json({
    message: `${req.originalUrl} Route Not Found`,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log("server running...."));
