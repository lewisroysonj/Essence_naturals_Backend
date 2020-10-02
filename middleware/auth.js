/** @format */
const jwt = require("jsonwebtoken");
module.exports = {
  authenticateToken: function authenticateToken(req, res, next) {
    try {
      console.log(req.headers.authorization);
      if (req.headers.authorization == "false") {
        req.user = null;
      } else {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
          if (err) {
            req.user = null;
          } else {
            req.user = user;
            next();
          }
        });
      }
    } catch (err) {
      console.error("token err:", err);
      req.user = null;
    }
  },

  emailToLowerCase: function emailToLowerCase(req, res, next) {
    req.body.email = req.body.email.toLowerCase();
    next();
  },
};
