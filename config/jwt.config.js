const jwt = require("jsonwebtoken");

function generateToken(user) {
  const { _id, email, role } = user;
  const signature = process.env.TOKEN_SIGN_SECRET;

  const experation = "10h";

  return jwt.sign({ _id, email, role }, signature, { expiresIn: experation });
}

module.exports = generateToken;
