const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  const secret = process.env.JWT_KEY || "1234567";

  return jwt.sign({ id }, secret, { expiresIn: "7d" });
};

module.exports = { generateToken };
