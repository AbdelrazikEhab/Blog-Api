const User = require("../../model/User/User");
const Comment = require("../../model/Comment/Comment");

const { appErr, AppErr } = require("../../utils/appError");
const Post = require("../../model/Post/Post");

const createComment = async (req, res, next) => {
  const { description } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    const user = await User.findById(req.userAuth);
    const commentCreate = await Comment.create({
      post: post._id,
      description,
      user: req.userAuth,
    });
    post.comments.push(commentCreate._id);
    user.comments.push(commentCreate._id);
    post.save();
    user.save();

    res.json({
      status: "success",
      data: commentCreate,
    });
  } catch (error) {
    return next(new AppErr(error.message));
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (comment.user.toString() !== req.userAuth.toString()) {
      return next(appErr("You not allowed to update this comment", 403));
    }
    await Comment.findByIdAndDelete(req.params.id);
    res.json({
      status: "success",
      data: "comment deleted",
    });
  } catch (error) {
    return next(new AppErr(error.message));
  }
};
const updateComment = async (req, res, next) => {
  const { description } = req.body;
  try {
    const comment = await Comment.findById(req.params.id);
    if (comment.user.toString() !== req.userAuth.toString()) {
      return next(appErr("You not allowed to update this comment", 403));
    }
    const commentUpdated = await Comment.findByIdAndUpdate(
      req.params.id,
      { description },
      { new: true, runValidators: tru }
    );
    res.json({
      status: "success",
      data: commentUpdated,
    });
  } catch (error) {
    return next(new AppErr(error.message));
  }
};

module.exports = {
  createComment,

  deleteComment,
  updateComment,
};
