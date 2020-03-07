const User = require('../models/user.model');

exports.createUser = async function (req, res) {
    try {
        // Check if valid email syntax
        if (!(req.body.email.match(/[\w\.]+@[\w\.]+/g))) {
            throw new SyntaxError();
        }

        // Check if user exists
        if (User.getUserByEmail(req.body.email).length > 0) {
            throw new SyntaxError();
        }

        let user_data = [req.body.name, req.body.email, req.body.password, req.body.city, req.body.country]

        const result = await User.createUser(user_data);
        let response = {"userId": result.insertId};

        res.statusMessage = "OK";
        res.status(201).send(response);

    } catch (err) {
        if (err instanceof SyntaxError) {
            res.statusMessage = "Bad Request"
            res.status(400).send();
        } else {
            console.log(err);
            res.statusMessage = "Internal Server Error";
            res.status(500).send();
        }
    }
};

exports.login = async function (req, res) {
    try {
        // Get user associated with email
        const user_results = await User.getUserByEmail(req.body.email);
        const user_profile = user_results[0]

        // Check that email exists
        if (user_results.length !== 1) {
            throw new SyntaxError();
        }

        // Check that the password is correct
        if (!(user_profile.password == req.body.password)) {
            throw new SyntaxError();
        }

        // Add the Id and Token to results
        const result = {
            "userId": user_profile.user_id,
            "token": user_profile.auth_token
        }

        res.statusMessage = "OK";
        res.status(201).send(result);

    } catch (err) {
        if (err instanceof SyntaxError) {
            res.statusMessage = "Bad Request"
            res.status(400).send();
        } else {
            console.log(err);
            res.statusMessage = "Internal Server Error";
            res.status(500).send();
        }

    }
}

// exports.login = async function (req, res) {
//     try {
//
//     } catch (err) {
//
//     }
// }