const express = require("express");
const commentRouter = express.Router();
const {
  createComment,
  deleteComment,
  updateComment,
} = require("../../controllers/comment/commentCtrl");
const isLogin = require("../../middlewares/isLogin");

commentRouter.post("/:id", isLogin, createComment);
commentRouter.delete("/delete/:id", isLogin, deleteComment);
commentRouter.put("/update/:id", isLogin, updateComment);
module.exports = commentRouter;
