const User = require('../../models/user.model');

exports.authenticateUser = async function (req, res) {
    /* Returns the first user associated with that token or null if not a valid token*/
    const session_token = req.header("X-Authorization");
    const user_results = await User.getUserByToken(session_token);
    return user_results[0];
}