const User = require('../models/user.model');
const Auth = require('./helpers/authenticate');
const crypto = require('crypto');

exports.createUser = async function (req, res) {
    try {
        // Check if valid email syntax
        if (!(Auth.validEmail(req.body.email))) {
            throw new SyntaxError();
        }

        // Check if user exists
        const user_results = await User.getUserByEmail(req.body.email);
        if (user_results.length > 0) {
            throw new SyntaxError();
        }

        let user_data = [req.body.name, req.body.email, req.body.password, req.body.city, req.body.country]

        const result = await User.createUser(user_data);
        let response = {"userId": result.insertId};

        res.statusMessage = "OK";
        res.status(201).send(response);

    } catch (err) {
        if (err instanceof SyntaxError) {
            res.statusMessage = "Bad Request";
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
        const user_profile = user_results[0];


        // Check that email exists
        if (user_results.length !== 1) {
            throw new SyntaxError();
        }

        // Check that the password is correct
        if (!(user_profile.password == req.body.password)) {
            throw new SyntaxError();
        }

        // Generate and store a session token
        const token = crypto.randomBytes(24).toString('BASE64');
        await User.storeTokenById(user_profile.user_id, token);

        // Add the Id and Token to results
        const response = {
            "userId": user_profile.user_id,
            "token": token
        }

        res.statusMessage = "OK";
        res.status(200).send(response);

    } catch (err) {
        if (err instanceof SyntaxError) {
            res.statusMessage = "Bad Request";
            res.status(400).send();
        } else {
            console.log(err);
            res.statusMessage = "Internal Server Error";
            res.status(500).send();
        }

    }
}

exports.logout = async function (req, res) {
    try {
        const session_token = req.header('X-Authorization');

        // Get the User profile that is associated to the session token and set it to null if there is one,
        // otherwise raise an exception
        const user_results = await User.getUserByToken(session_token);
        if (user_results.length != 1) {
            throw new SyntaxError();
        }
        const user_profile = user_results[0];
        await User.storeTokenById(user_profile.user_id, null);

        res.statusMessage = "OK";
        res.status(200).send();
    } catch (err) {
        if (err instanceof SyntaxError) {
            res.statusMessage = "Unauthorized";
            res.status(401).send();
        } else {
            console.log(err);
            res.statusMessage = "Internal Server Error";
            res.status(500).send();
        }

    }
}


exports.getUser = async function (req, res) {
    try {
        const session_token = req.header('X-Authorization');

        // Get the User profile that is associated to the session token
        const user_profile = await Auth.authenticateUser(req.params.id, session_token);

        let response = {
            "name": user_profile.name,
            "city": user_profile.city,
            "country": user_profile.country,
            "email": user_profile.email
        }

        res.statusMessage = "OK";
        res.status(200).send(response);
    } catch (err) {
        if (err instanceof SyntaxError) {
            res.statusMessage = "Not Found";
            res.status(404).send();
        } else {
            console.log(err);
            res.statusMessage = "Internal Server Error";
            res.status(500).send();
        }

    }
}


exports.updateUser = async function (req, res) {
    try {
        const session_token = req.header('X-Authorization');

        // Get the User profile that is associated to the session token\
        let user_profile;
        try {
            user_profile = await Auth.authenticateUser(req.params.id, session_token);
        } catch (e) {
            throw new ReferenceError()
        }

        // Check valid email type
        if (!(Auth.validEmail(req.body.email))) {
            throw new SyntaxError();
        }

        // Check that the email is not in use
        const user_results = await User.getUserByEmail(req.body.email);
        if (user_results.length > 0) {
            throw new SyntaxError();
        }

        // Check password is being changed
        if (user_profile.password != req.body.password) {
            if (req.params.password.length < 1) { // check valid new password
                throw new SyntaxError();
            }

            if (user_profile.password != req.body.currentPassword) { // Authenticate current password
                throw new EvalError();
            }
        }

        updated_details = [req.body.name, req.body.email.req.body.password, req.body.city, req.body.country];
        await User.updateUserById(user_profile.user_id, updated_details);

        res.statusMessage = "OK";
        res.status(200).send();
    } catch (err) {
        if (err instanceof SyntaxError) {
            res.statusMessage = "Bad Request";
            res.status(400).send();
        } else if (err instanceof ReferenceError) {
            res.statusMessage = "Forbidden";
            res.status(403).send();
        } else if (err instanceof EvalError) {
            res.statusMessage = "Unauthorized";
            res.status(401).send();
        } else {
            console.log(err);
            res.statusMessage = "Internal Server Error";
            res.status(500).send();
        }

    }
}

