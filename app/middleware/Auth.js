const User = require('../models/user.model');

exports.authenticateUser = async function (req, res, next) {
    /* Returns the first user associated with that token or null if not a valid token*/
    var errorReason = "Unauthorized";
    try {
        const session_token = req.header("X-Authorization");
        const user_results = await User.getUserByToken(session_token);
        if (!user_results[0]) {
            errorReason = "Un"
            throw new Error();
        } else {
            next();
        }
    } catch (err) {
        if (errorReason === 'Unauthorized') {
            res.statusMessage = errorReason;
            res.status(401).send();
        } else {
            console.log(err);
            res.statusMessage = "Internal Server Error";
            res.status(500).send();
        }
    }
}