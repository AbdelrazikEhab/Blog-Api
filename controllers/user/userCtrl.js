const User = require("../../model/User/User");
const { generateToken } = require("../../utils/genereateToken");
const { appErr, AppErr } = require("../../utils/appError");
const bcrypt = require("bcrypt");
const Post = require("../../model/Post/Post");
const Comment = require("../../model/Comment/Comment");
const Category = require("../../model/Category/Category");

const userCtr = async (req, res, next) => {
  try {
    res.json({
      status: "success",
      message: "done",
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

const register = async (req, res, next) => {
  const { firstname, lastname, email, password } = req.body;
  try {
    const userFound = await User.findOne({ email });
    if (userFound) {
      return next(appErr("User Exsist", 404));
    }
    const user = await User.create({
      firstname,
      lastname,
      email,
      password,
    });

    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const userFound = await User.findOne({ email });
    if (!userFound) {
      return next(appErr("Use not exsisit!", 404));
    }
    const userPasswordMatch = await userFound.isValidPassword(password);
    if (!userPasswordMatch) {
      return next(AppErr("Password is wrong try again!", 404));
    }
    res.json({
      status: "success",
      msg: `${userFound.firstname} ${userFound.lastname} login`,
      data: {
        firstname: userFound.firstname,
        lastname: userFound.lastname,
        email: userFound.email,
        isAdmin: userFound.isAdmin,
        token: generateToken(userFound._id),
      },
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userAuth);
    if (!user) {
      return new AppErr("User not Found!", 404);
    }
    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

const getAllusers = async (req, res, next) => {
  try {
    const users = await User.find();
    if (!users) {
      return new AppErr("User not Found!", 404);
    }
    res.json({
      status: "success",
      data: users,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userAuth);
    await Post.deleteMany({ user: req.userAuth });
    await Comment.deleteMany({ user: req.userAuth });
    await Category.deleteMany({ user: req.userAuth });
    await user.deleteOne();
    res.json({
      status: "success",
      data: "delete account",
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

const updateUser = async (req, res, next) => {
  const { email, lastname, firstname } = req.body;
  try {
    if (email) {
      const emailToken = await User.findOne({ email });
      if (emailToken) {
        return next(appErr("Email is taken", 400));
      }
    }
    const user = await User.findByIdAndUpdate(
      req.userAuth,
      {
        firstname,
        lastname,
        email,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};
const updatePasswordUser = async (req, res, next) => {
  const { password } = req.body;
  try {
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashpassword = await bcrypt.hash(password, salt);
      const user = await User.findByIdAndUpdate(
        req.userAuth,
        { password: hashpassword },
        {
          new: true,
          runValidators: true,
        }
      );
      res.json({
        status: "success",
        data: user,
      });
    } else {
      return next(appErr("password is invalid "));
    }
  } catch (error) {
    return next(appErr(error.message));
  }
};

const profilePhotoUploadCtrl = async (req, res, next) => {
  console.log(req.userAuth);
  const user = await User.findById(req.userAuth);
  if (!user) {
    return next(appErr("user not found", 404));
  }
  if (user.isBlocked) {
    return next(appErr("user is blocked", 404));
  }
  if (req.file) {
    await User.findByIdAndUpdate(
      req.userAuth,
      {
        $set: { profilephoto: req.file.path },
      },
      { new: true }
    );
  }
  try {
    res.json({
      status: "success",
      data: "successfully updated profile photo",
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

const whoViewedMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    const userWhoViewed = await User.findById(req.userAuth);
    if (user && userWhoViewed) {
      const isUserAlreadyViewed = user.viewers.includes(
        userWhoViewed._id.toJSON()
      );
      if (isUserAlreadyViewed) {
        return next(new AppErr("you already viewed this profile"));
      } else {
        user.viewers.push(userWhoViewed._id);
        await user.save();
        res.json({
          status: "success",
          message: "you have successfully viewed this profile",
        });
      }
    }
  } catch (error) {
    return next(new AppErr(error.message));
  }
};

const followingCtr = async (req, res, next) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const userwhoFollowed = await User.findById(req.userAuth);

    if (userToFollow && userwhoFollowed) {
      const isFollowed = userToFollow.followers.find(
        (follower) => follower.toString() === userwhoFollowed._id.toString()
      );
      console.log(isFollowed);

      if (isFollowed) {
        return next(new AppErr("You already Followed"));
      } else {
        userwhoFollowed.following.push(userToFollow._id);
        userToFollow.followers.push(userwhoFollowed._id);
        await userwhoFollowed.save();
        await userToFollow.save();
        res.json({
          status: "success",
          message: `you start following ${userToFollow.fullname.toString()} `,
        });
      }
    }
  } catch (error) {
    return next(new AppErr(error.message));
  }
};

const unfollowing = async (req, res, next) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const userwhoFollowed = await User.findById(req.userAuth);

    if (userToFollow && userwhoFollowed) {
      const isFollowed = userToFollow.followers.find(
        (follower) => follower.toString() === userwhoFollowed._id.toString()
      );

      if (isFollowed) {
        userwhoFollowed.following.pop(userToFollow._id);
        userToFollow.followers.pop(userwhoFollowed._id);
        await userwhoFollowed.save();
        await userToFollow.save();
        res.json({
          status: "success",
          message: `you unfollow ${userToFollow.fullname.toString()} `,
        });
      } else {
        return next(new AppErr("you not Follow him already"));
      }
    }
  } catch (error) {
    return next(new AppErr(error.message));
  }
};

const BlockUser = async (req, res, next) => {
  try {
    const userToBlock = await User.findById(req.params.id);
    const userwhoBlocked = await User.findById(req.userAuth);

    if (userToBlock && userwhoBlocked) {
      const isBlocked = userwhoBlocked.blocked.includes(
        userToBlock._id.toString()
      );

      if (isBlocked) {
        return next(new AppErr("you Blocked him already"));
      } else {
        userwhoBlocked.blocked.push(userToBlock._id);
        await userwhoBlocked.save();
        res.json({
          status: "success",
          message: `you Blocked ${userToBlock.fullname.toString()}  `,
        });
      }
    }
  } catch (error) {
    return next(new AppErr(error.message));
  }
};

const unBlockUser = async (req, res, next) => {
  try {
    const userToBlock = await User.findById(req.params.id);
    const userwhoBlocked = await User.findById(req.userAuth);

    if (userToBlock && userwhoBlocked) {
      const isBlocked = userwhoBlocked.blocked.includes(
        userToBlock._id.toString()
      );

      if (isBlocked) {
        userwhoBlocked.blocked.pop(userToBlock._id);
        await userwhoBlocked.save();
        res.json({
          status: "success",
          message: `you UnBlocked ${userToBlock.fullname.toString()}  `,
        });
      } else {
        return next(new AppErr("you UnBlocked him already"));
      }
    }
  } catch (error) {
    return next(new AppErr(error.message));
  }
};

const adminBlock = async (req, res, next) => {
  try {
    const UserToBeBlocked = await User.findById(req.params.id);
    if (!UserToBeBlocked) {
      return next(new AppErr("User not Found"));
    } else if (UserToBeBlocked.isBlocked === true) {
      return next(new AppErr("you Blocked him already"));
    } else {
      UserToBeBlocked.isBlocked = true;
      await UserToBeBlocked.save();
      res.json({
        status: "success",
        message: "admin blocked this page",
      });
    }
  } catch (error) {
    return next(new AppErr(error.message));
  }
};
const adminUnBlock = async (req, res, next) => {
  try {
    const UserToBeBlocked = await User.findById(req.params.id);
    if (!UserToBeBlocked) {
      return next(new AppErr("User not Found"));
    } else if (UserToBeBlocked.isBlocked === false) {
      return next(new AppErr("you unBlocked him already"));
    } else {
      UserToBeBlocked.isBlocked = false;
      await UserToBeBlocked.save();
      res.json({
        status: "success",
        message: "admin UnBlocked this page",
      });
    }
  } catch (error) {
    return next(new AppErr(error.message));
  }
};

module.exports = {
  register,
  login,
  getProfile,
  getAllusers,
  deleteUser,
  updateUser,
  profilePhotoUploadCtrl,
  whoViewedMyProfile,
  followingCtr,
  unfollowing,
  BlockUser,
  unBlockUser,
  adminBlock,
  adminUnBlock,
  updatePasswordUser,
};
