const jwt = require("jsonwebtoken");

const verifyToken = (token) => {
  const secret = process.env.JWT_KEY || "1234567";

  return jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return false;
    } else {
      return decoded;
    }
  });
};

module.exports = verifyToken;
