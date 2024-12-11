const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Post = require("../Post/Post");

const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: [true, "first name required"] },
    lastname: { type: String, required: [true, "last name required"] },
    profilephoto: { type: String },
    email: { type: String, required: [true, "Email required"] },
    password: { type: String, required: [true, "password required"] },
    postcount: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["Admin", "Guest", "Editor"],
    },
    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
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
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    plan: {
      type: String,
      enum: ["Free", "Premium", "pro"],
      default: "Free",
    },

    userAward: {
      type: String,
      enum: ["Bronze", "Silver", "Gold"],
      default: "Bronze",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});
userSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

userSchema.pre("findOne", async function (next) {
  this.populate({ path: "posts" });

  const userId = this._conditions._id;
  const posts = await Post.find({ user: userId });
  const lastPost = posts[posts.length - 1];
  const lastPostDate = new Date(lastPost?.createdAt);
  const lastPostDateStr = lastPostDate.toDateString();
  userSchema.virtual("lastPostDate").get(function () {
    return lastPostDateStr;
  });

  //Active User
  const currentDate = new Date();
  const diff = currentDate - lastPostDate;
  const diffDays = diff / (1000 * 3600 * 24);
  if (diffDays < 30) {
    userSchema.virtual("isInactive").get(function () {
      return true;
    });
    await User.findByIdAndUpdate(userId, { isBlocked: true }, { new: true });
  } else {
    userSchema.virtual("isInactive").get(function () {
      return false;
    });
    await User.findByIdAndUpdate(userId, { isBlocked: false }, { new: true });
  }

  //last Active User
  const daysAgo = Math.floor(diffDays);
  userSchema.virtual("LastActive").get(function () {
    return daysAgo <= 0
      ? "Today"
      : daysAgo === 1
      ? "Yasterday"
      : `${daysAgo} days ago`;
  });
  //check or Upgrade user account
  const postsCount = posts.length;
  if (postsCount < 10) {
    await User.findByIdAndUpdate(
      userId,
      { userAward: "Bronze" },
      { new: true }
    );
  }
  if (postsCount > 10) {
    await User.findByIdAndUpdate(
      userId,
      { userAward: "Silver" },
      { new: true }
    );
  }
  if (postsCount > 20) {
    await User.findByIdAndUpdate(userId, { userAward: "Gold" }, { new: true });
  }

  next();
});
userSchema.virtual("fullname").get(function () {
  return `${this.firstname} ${this.lastname}`;
});
userSchema.virtual("initials").get(function () {
  return `${this.firstname[0].toLocaleUpperCase()}${this.lastname[0].toLocaleUpperCase()}`;
});
userSchema.virtual("followingCounts").get(function () {
  return this.following.length;
});
userSchema.virtual("followersCounts").get(function () {
  return this.followers.length;
});
userSchema.virtual("BlocksAcounts").get(function () {
  return this.blocked.length;
});
userSchema.virtual("ViwersCounts").get(function () {
  return this.viewers.length;
});

const User = mongoose.model("User", userSchema);
module.exports = User;
