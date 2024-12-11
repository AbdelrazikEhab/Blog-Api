const { appErr, AppErr } = require("../utils/appError");

const generateTokenFromHeader = (req) => {
  const headerObj = req.headers;
  if (
    headerObj.authorization &&
    headerObj.authorization.startsWith("Bearer ")
  ) {
    const token = headerObj["authorization"].split(" ")[1];
    return token;
  } else {
    return new AppErr("Token not found in the authorization header", 404);
  }
};

module.exports = generateTokenFromHeader;
