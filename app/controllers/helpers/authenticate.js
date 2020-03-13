const User = require('../../models/user.model');
const bcrypt = require('bcrypt-nodejs');

exports.authenticateUser = async function (session_token) {
    /* Returns the first user associated with that token or null if not a valid token*/
    const user_results = await User.getUserByToken(session_token);
    return user_results[0];
}

exports.validEmail = function (email) {

    if (!email.match(/[\w\.]+@[\w\.]+/g)) {
        return false;
    }

    return true;
}

exports.uniqueEmail = async function (email) {
    const user_results = await User.getUserByEmail(email);
    if (user_results.length > 0) {
        return false;
    }

    return true;
}

exports.hashedPassword = function (password) {
    return bcrypt.hashSync(password);
}

exports.comparePasswords = function (clear_password, hashed_password) {
    return bcrypt.compareSync(clear_password, hashed_password);
}