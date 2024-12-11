const generateTokenFromHeader = require("../middlewares/generateTokenHandler");
const verifyToken = require("../middlewares/verifyToken");
const { appErr, AppErr } = require("../utils/appError");

const isLogin = (req, res, next) => {
  try {
    const token = generateTokenFromHeader(req);

    const decodedUser = verifyToken(token);

    req.userAuth = decodedUser.id; // Access the id safely

    // Check if the token was valid
    if (!decodedUser) {
      return next(
        new AppErr("Invalid/expired login. Please log in again.", 404)
      );
    } else {
      next();
      // Here, decodedUser is guaranteed to be non-null
    }
  } catch (error) {
    return appErr(error.message, 404);
  }
};

module.exports = isLogin;
