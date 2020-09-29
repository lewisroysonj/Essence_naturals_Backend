/** @format */
const jwt = require("jsonwebtoken");
module.exports = {
  authenticateToken: function authenticateToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (req.headers.authorization === null) {
        req.user = null;
        next();
      } else {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
          if (err) return (req.user = null);
          req.user = user;
          next();
        });
      }
    } catch (err) {
      console.error("token err:", err);
      res.sendStatus(401);
    }
  },

  emailToLowerCase: function emailToLowerCase(req, res, next) {
    req.body.email = req.body.email.toLowerCase();
    next();
  },
};
