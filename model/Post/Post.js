const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "title required"], trim: true },
    description: { type: String, required: [true, "description required"] },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      //required: [true, "Category required"],
    },
    numViews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: [true, "Please Auther is required"],
    },
    photo: { type: String },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);
postSchema.pre(/^find/, function (next) {
  postSchema.virtual("ViewsCounts").get(function () {
    const post = this;
    return post.numViews.length;
  });
  postSchema.virtual("likesCounts").get(function () {
    const post = this;
    return post.likes.length;
  });
  postSchema.virtual("dislikesCounts").get(function () {
    const post = this;
    return post.dislikes.length;
  });
  postSchema.virtual("likesPercentage").get(function () {
    const post = this;
    const total = +post.likes.length + +post.dislikes.length;
    const precentage = (post.likes.length / total) * 100;
    return `${precentage}%`;
  });
  postSchema.virtual("dislikesPercentage").get(function () {
    const post = this;
    const total = +post.likes.length + +post.dislikes.length;
    const precentage = (post.dislikes.length / total) * 100;
    return `${precentage}%`;
  });
  postSchema.virtual("daysAgo").get(function () {
    const post = this;
    const date = new Date(this.createdAt);
    const daysAgo = Math.floor((Date.now() - date) / 84600000);
    return daysAgo === 0
      ? "Today"
      : daysAgo === 1
      ? "Yasterday"
      : `${daysAgo} days ago`;
  });
  next();
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
