const express = require("express");
const categoryRouter = express.Router();

const {
  createCategory,
  fetchCategory,
  fetchCategories,
  deleteCategory,
  updateCategory,
} = require("../../controllers/category/categoryCtrl");
const isLogin = require("../../middlewares/isLogin");
categoryRouter.post("/", isLogin, createCategory);
categoryRouter.get("/", isLogin, fetchCategories);
categoryRouter.get("/:id", isLogin, fetchCategory);
categoryRouter.delete("/delete/:id", isLogin, deleteCategory);
categoryRouter.put("/update/:id", isLogin, updateCategory);
module.exports = categoryRouter;
