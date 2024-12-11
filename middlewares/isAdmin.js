const generateTokenFromHeader = require("./generateTokenHandler");
const verifyToken = require("./verifyToken");
const { appErr, AppErr } = require("../utils/appError");
const User = require("../model/User/User");

const isAdmin = async (req, res, next) => {
  const token = generateTokenFromHeader(req);

  const decodedUser = verifyToken(token);

  req.userAuth = decodedUser.id; // Access the id safely
  const user = await User.findById(decodedUser.id);
  console.log(user);
  if (user.isAdmin) {
    return next();
  } else {
    return next(appErr("This mission for Admins only", 403));
  }
};

module.exports = isAdmin;
