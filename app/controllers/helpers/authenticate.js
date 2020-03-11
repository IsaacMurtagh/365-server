const User = require('../../models/user.model');

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
