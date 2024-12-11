const express = require("express");
const userRouter = express.Router();
const storage = require("../../config/Cloudinary");
const isLogin = require("../../middlewares/isLogin");
const isAdmin = require("../../middlewares/isAdmin");
const multer = require("multer");
const {
  register,
  login,
  getProfile,
  getAllusers,
  deleteUser,
  updateUser,
  updatePasswordUser,
  profilePhotoUploadCtrl,
  whoViewedMyProfile,
  followingCtr,
  unfollowing,
  BlockUser,
  unBlockUser,
  adminBlock,
  adminUnBlock,
} = require("../../controllers/user/userCtrl");
const upload = multer({ storage });
userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/profile", isLogin, getProfile);
userRouter.get("/", getAllusers);
userRouter.delete("/delete-account", isLogin, deleteUser);
userRouter.put("/", isLogin, updateUser);
userRouter.post(
  "/profile-photo-upload",
  isLogin,
  upload.single("profile"),
  profilePhotoUploadCtrl
);
userRouter.get("/profile-view/:id", isLogin, whoViewedMyProfile);
userRouter.get("/following/:id", isLogin, followingCtr);
userRouter.get("/unfollow/:id", isLogin, unfollowing);
userRouter.get("/block/:id", isLogin, BlockUser);
userRouter.get("/unblock/:id", isLogin, unBlockUser);
userRouter.put("/admin-block/:id", isLogin, isAdmin, adminBlock);
userRouter.put("/admin-unblock/:id", isLogin, isAdmin, adminUnBlock);
userRouter.put("/update-password", isLogin, updatePasswordUser);

module.exports = userRouter;
