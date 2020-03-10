const User = require('../../models/user.model');

exports.authenticateUser = async function (userId, session_token) {

    const user_results = await User.getUserByToken(session_token);
    if (user_results.length != 1) {
        throw new SyntaxError();
    }

    // Check that the login session is associated to the requested user
    const user_profile = user_results[0];
    if (user_profile.user_id != userId) {
        return null
    }

    return user_profile;

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
