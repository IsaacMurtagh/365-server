const User = require('../models/user.model');
const Auth = require('./helpers/authenticate');
const crypto = require('crypto');

exports.createUser = async function (req, res) {
    try {
        // Check not null
        if (req.body.email == null || req.body.password == null || req.body.name == null) {
            throw new SyntaxError();
        }

        // Check if valid email syntax
        if (!(Auth.validEmail(req.body.email))) {
            throw new SyntaxError();
        }

        // Check if user exists
        if (!(await Auth.uniqueEmail(req.body.email))) {
            throw new SyntaxError();
        }

        // Check password not empty
        if (req.body.password.length < 1) {
            throw new SyntaxError();
        }

        const values = [
            req.body.name,
            req.body.email,
            Auth.hashedPassword(req.body.password),
            req.body.city,
            req.body.country
        ];

        const result = await User.createUser(values);
        let response = {"userId": result.insertId};

        res.statusMessage = "Created";
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
        if (user_profile == null) {
            throw new SyntaxError();
        }

        // Check that the password is correct
        if (!Auth.comparePasswords(req.body.password, user_profile.password)) {
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


exports.updateUser = async function (req, res) {
    let errorReason = "";
    try {
        let updated_details = {
            "name": req.body.name,
            "email": req.body.email,
            "password": req.body.password,
            "city": req.body.city,
            "country": req.body.country
        }

        let user_profile = await Auth.authenticateUser(req.header('X-Authorization'));
        if (user_profile == null) { // Not logged in
            errorReason = "Unauthorized";
            throw new Error();
        }

        if  (user_profile.user_id != req.params.id) {// Not own profile
            errorReason = "Forbidden";
            throw new Error();
        }
        // Consistency passwords
        if (req.body.password == null) {
            errorReason = "Bad Request";
            throw new Error();
        } else if (req.body.password.length < 1) {
            errorReason = "Bad Request";
            throw new Error();
        }
        if (!Auth.comparePasswords(req.body.password, user_profile.password)) { //changing password
            // Check if current password is same as old password
            if (!Auth.comparePasswords(req.body.currentPassword, user_profile.password)) {
                errorReason = "Unauthorized";
                throw new Error();
            } else {
                updated_details.password = Auth.hashedPassword(req.body.password);
            }
        }

        // email
        if (req.body.email == null) { // Email not changing
            updated_details['email'] = user_profile.email;
        } else if (!Auth.validEmail(req.body.email)) { // invalid new email
            errorReason = "Bad Request";
            throw new Error();
        }else if (!(await Auth.uniqueEmail(req.body.email))) {
            errorReason = "Bad Request";
            throw new Error();
        }

        //name
        if (req.body.name == null) {
            updated_details['name'] = user_profile.name;
        }

        if (req.body.city == null) {
            updated_details['city'] = user_profile.city;
        }

        if (req.body.country == null) {
            updated_details['country'] = user_profile.country;
        }

        let values = []
        for (const [key, value] of Object.entries(updated_details)) {
            values.push(value);
        }

        await User.updateUserById(user_profile.user_id, values);

        res.statusMessage = "OK";
        res.status(200).send();
    } catch (err) {
        if (errorReason == "Unauthorized") {
            res.statusMessage = errorReason;
            res.status(401).send();
        } else if (errorReason == "Bad Request") {
            res.statusMessage = errorReason;
            res.status(400).send();
        } else if (errorReason == "Forbidden") {
            res.statusMessage = errorReason;
            res.status(403).send();
        } else {
            console.log(err);
            res.statusMessage = "Internal Server Error";
            res.status(500).send();
        }

    }
}

exports.getUser = async function (req, res) {
    let errorReason = "";
    try {
        let result;
        let ownProfile = false;
        let user_profile = await Auth.authenticateUser(req.header('X-Authorization'));

        if (user_profile != null) { // They are logged in
            if (user_profile.user_id == req.params.id) { // Requested own profile
                ownProfile = true;
                result = {
                    "name": user_profile.name,
                    "city": user_profile.city,
                    "country": user_profile.country,
                    "email": user_profile.email
                }
            }
        }
        if (!ownProfile) { // Requesting another user
            user_profile = (await User.getUserById(req.params.id))[0]
            if (user_profile == null) { // User does not exist
                errorReason = "Not Found";
                throw new Error();
            }

            result = {
                "name": user_profile.name,
                "city": user_profile.city,
                "country": user_profile.country,
            }
        }

        res.statusMessage = "OK";
        res.status(200).send(result);
    } catch (err) {
        if (errorReason == "Not Found") {
            res.statusMessage = "Not Found";
            res.status(404).send();
        } else {
            console.log(err);
            res.statusMessage = "Internal Server Error";
            res.status(500).send();
        }

    }
}