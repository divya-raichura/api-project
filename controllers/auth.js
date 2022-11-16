const User = require("../models/User");
const { asyncWrapper } = require("../middleware/async-wrapper");
const { BadRequestError, UnauthenticatedError } = require("../errors/index");

const register = asyncWrapper(async (req, res) => {
  // if we put validators of 'please provide email pass' by manually
  // checking in controller using if-else then we can send what error we want
  // but if we leave it to mongoose, it will work but it will give server
  // 500 error when we use async wrapper, or the error we put in catch
  // block in case of try-catch
  // we solve it in the end of project

  /** put this is model.pre middleware
   * if we use below code, it won't check for password len and user can give empty password, because, empty password is also hashed and empty password becomes 20 len+ so it passes mongoose validation
   * but in model.pre, validation is checked first and then hashed
   const { name, email, password } = req.body;
 
   const salt = await bcrypt.genSalt(10);
   const hashedPassword = await bcrypt.hash(password, salt);
 
   const tempUser = { name, email, password: hashedPassword };
   const user = await User.create(tempUser);
   */
  const user = await User.create(req.body);
  res
    .status(200)
    .json({ user: { name: user.name }, token: user.createToken() });
});

const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("please provide email and password");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("unauthenticated user");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("unauthenticated user");
  }

  const token = user.createToken();
  res.status(200).json({ user: { name: user.name }, token });
});

module.exports = { register, login };
