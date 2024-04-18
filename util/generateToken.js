const jwt = require('jsonwebtoken')
const generatToken = (user) => {
    console.log(user)
    const token = jwt.sign({ _id: user?._id, user_name:user?.user_name }, process.env.JWTPRIVATEKEY, {
          expiresIn: "7d",
      });
      return token;
  }
 module.exports = generatToken

