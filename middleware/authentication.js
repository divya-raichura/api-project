const { verify } = require("jsonwebtoken");
const { UnauthenticatedError } = require("../errors/index");

const verifyUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthenticatedError("auth invalid");
  }

  const token = authHeader.split(" ")[1];

  try {
    const verification = verify(token, process.env.SECRET_TOKEN);
    req.user = { userId: verification.userId, name: verification.name };
    next();
  } catch (error) {
    throw new UnauthenticatedError("authentication invalid");
  }
};

module.exports = verifyUser;
