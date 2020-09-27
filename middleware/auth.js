/** @format */
const jwt = require("jsonwebtoken");
module.exports = {
  authenticateToken: function authenticateToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.split(" ")[1];

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
          if (err) return console.error("Token Verify Err :", err);
          req.user = user;
          next();
        });
      } else if (!authHeader) {
        const err = "User not Authorized";
        throw err;
      }
    } catch (err) {
      res.sendStatus(401);
      console.error("token err:", err);
    }
  },

  emailToLowerCase: function emailToLowerCase(req, res, next) {
    req.body.email = req.body.email.toLowerCase();
    next();
  },
};
