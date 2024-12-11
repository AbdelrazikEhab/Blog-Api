const User = require("../../model/User/User");
const Post = require("../../model/Post/Post");
const { appErr, AppErr } = require("../../utils/appError");
const Category = require("../../model/Category/Category");

const postdetails = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    const isViewed = post.numViews.includes(req.userAuth);
    if (isViewed) {
      res.json({
        status: "success",
        data: post,
      });
    } else {
      post.numViews.push(req.userAuth);
      await post.save();
      res.json({
        status: "success",
        data: post,
      });
    }
  } catch (error) {
    next(appErr(error.message));
  }
};

const createPost = async (req, res, next) => {
  const { title, description } = req.body;
  try {
    const auther = await User.findById(req.userAuth);
    if (auther.isBlocked) {
      return next(appErr("Access Denied,Account Blocked", 403));
    }
    const postCreate = await Post.create({
      title,
      description,
      user: auther._id,
      photo: req?.file?.path,
    });

    auther.posts.push(postCreate._id);
    auther.save();
    res.json({
      status: "success",
      data: postCreate,
    });
  } catch (error) {
    return next(new AppErr(error.message, 404));
  }
};

const fetchPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({})
      .populate("user")
      .populate("category", "title");

    const filteredPosts = posts.filter((post) => {
      const blockeUser = post.user.blocked;
      const isBlocked = blockeUser.includes(req.userAuth);
      return isBlocked ? null : post;
    });
    res.json({
      status: "success",
      data: filteredPosts,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

const togglelikesPosts = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    const isLiked = post.likes.includes(req.userAuth);
    if (isLiked) {
      post.likes = post.likes.filter(
        (like) => like.toString() !== req.userAuth.toString()
      );
      await post.save();
    } else {
      post.likes.push(req.userAuth);
      await post.save();
    }
    res.json({
      status: "success",
      data: "Liked this Post",
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

const toggleDislikesPosts = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    const isDisLiked = post.dislikes.includes(req.userAuth);
    if (isDisLiked) {
      post.dislikes = post.dislikes.filter(
        (dislike) => dislike.toString() !== req.userAuth.toString()
      );
      await post.save();
    } else {
      post.dislikes.push(req.userAuth);
      await post.save();
    }
    res.json({
      status: "success",
      data: "DisLiked this Post",
    });
  } catch (error) {
    next(appErr(error.message));
  }
};
const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({});
    res.json({
      status: "success",
      data: posts,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

const getPost = async (req, res, next) => {
  try {
    res.json({
      status: "success",
      data: "get post",
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.user.toString() !== req.userAuth) {
      return next(appErr("You not allowed to delete this post", 403));
    } else {
      await Post.findOneAndDelete(req.params.id);
      await Category.findByIdAndDelete(post.comments._id);
      res.json({
        status: "success",
        data: "posts deleted",
      });
    }
  } catch (error) {
    next(appErr(error.message));
  }
};

const updatePost = async (req, res, next) => {
  const { title, description, categoty } = req.body || req.text;
  try {
    const post = await Post.findById(req.params.id);
    if (post.user.toString() !== req.userAuth.toString()) {
      return next(appErr("You not allowed to update this post", 403));
    } else {
      await Post.findByIdAndUpdate(
        req.params.id,
        {
          title,
          description,
          categoty,
          photo: req?.file?.path,
        },
        { new: true }
      );
      res.json({
        status: "success",
        data: post,
      });
    }
  } catch (error) {
    next(appErr(error.message));
  }
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  fetchPosts,
  togglelikesPosts,
  toggleDislikesPosts,
  postdetails,
};
