const bcrypt = require("bcrypt");

function hashPassword(password) {
  try {
    // Generate a salt
    const salt = bcrypt.genSaltSync(10);

    // Hash password
    return bcrypt.hashSync(password, salt);
  } catch (error) {
    console.log(error);
  }

  return null;
}

function verifyPassword(password, hash) {
  try {
    return bcrypt.compareSync(password, hash);
  } catch (error) {
    console.log(error);
  }

  return null;
}

exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
