const express = require("express");
const postRouter = express.Router();
const storage = require("../../config/Cloudinary");

const {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  fetchPosts,
  togglelikesPosts,
  toggleDislikesPosts,
  postdetails,
} = require("../../controllers/post/postCtrl");
const isLogin = require("../../middlewares/isLogin");
const multer = require("multer");
const upload = multer({ storage });

postRouter.post("/", isLogin, upload.single("image"), createPost);
postRouter.get("/", getPosts);
postRouter.get("/fetch", isLogin, fetchPosts);
postRouter.get("/likes/:id", isLogin, togglelikesPosts);
postRouter.get("/dislikes/:id", isLogin, toggleDislikesPosts);
postRouter.get("/:id", isLogin, postdetails);
postRouter.get("/:id", getPost);
postRouter.delete("/delete/:id", isLogin, deletePost);
postRouter.put("/update/:id", isLogin, updatePost);

module.exports = postRouter;
