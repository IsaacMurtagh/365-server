const Petition = require('../models/petitions.model');
const Auth = require('./helpers/authenticate');
const DateTime = require('./helpers/datetime');

exports.getPetitions = async function (req, res) {
    var errorReason = "";
    try {
        const q = req.query;
        console.log(q);
        // Syntax checks
        if (q.categoryId != null && isNaN(Number(q.categoryId))) { // Invalid Category ID syntax
            errorReason = 'Bad Request';
            throw new Error();
        }
        if (q.authorId != null && isNaN(Number(q.authorId))) { // Invalid Author ID syntax
            errorReason = 'Bad Request';
            throw new Error();
        }
        if (q.count != null && isNaN(Number(q.count))) { // Invalid Count syntax
            errorReason = 'Bad Request';
            throw new Error();
        }
        if (q.startIndex != null && isNaN(Number(q.startIndex))) { // Invalid Start Index syntax
            errorReason = 'Bad Request';
            throw new Error();
        }

        let results = await Petition.getPeititons(q);

        let start = 0;
        let end = results.length;

        if(q.startIndex != null) {
            start = Number(q.startIndex);
        }
        if(q.count != null) {
            end = Math.min(Number(q.count) + start, end);
        }

        results = results.slice(start, end);

        res.statusMessage = "OK";
        res.status(200).send(results);
    } catch (e) {
        if (errorReason === "Bad Request") {
            res.statusMessage = errorReason;
            res.status(400).send();
        } else {
            res.statusMessage = "Internal Server Error";
            res.status(500).send();
        }
    }
}

exports.addPetition = async function (req, res) {
    var errorReason = "";
    try {
        const body = req.body;
        let user_profile = await Auth.authenticateUser(req.header('X-Authorization'));
        if (user_profile == null) { // Not logged in
            errorReason = "Unauthorized";
            throw new Error();
        }

        // Syntax Checks
        if (body.title == null || body.description == null ||
            body.categoryId == null || isNaN(body.categoryId) ||
            isNaN(Date.parse(body.closingDate))) {
            errorReason = "Bad Request";
            throw new Error();
        }

        if ((await Petition.getCategoryById(body.categoryId)).length === 0) { // Category exist
            errorReason = "Bad Request";
            throw new Error();
        }

        if (Date.now() >= Date.parse(body.closingDate)) { // Closing Date is not in the future
            errorReason = "Bad Request";
            throw new Error();
        }

        const values = [body.title, body.description, user_profile.user_id,
                        body.categoryId, DateTime.formatedDate(Date.now()), body.closingDate]

        const response = await Petition.addPetition(values);
        results = {"petitionId" : response.insertId};

        res.statusMessage = "OK";
        res.status(201).send(results);
    } catch (e) {
        if (errorReason === "Bad Request") {
            res.statusMessage = errorReason;
            res.status(400).send();
        } else if (errorReason === "Unauthorized") {
            res.statusMessage = errorReason;
            res.status(401).send();
        } else {
            console.log(e)
            res.statusMessage = "Internal Server Error";
            res.status(500).send();
        }
    }
}

exports.getPetitionById = async function (req, res) {
    var errorReason = "";
    try {
        const petitionId = req.params.id;

        let results = await Petition.getDetailedPetitionById(petitionId);
        if (results.length != 1) {
            errorReason = "Not Found";
            throw new Error();
        }

        res.statusMessage = "OK";
        res.status(200).send(results[0]);
    } catch (e) {
        if (errorReason === "Not Found") {
            res.statusMessage = errorReason;
            res.status(404).send();
        } else {
            console.log(e)
            res.statusMessage = "Internal Server Error";
            res.status(500).send();
        }
    }
}

exports.updatePetitonById = async function (req, res) {
    var errorReason = "";
    try {
        const petitionId = req.params.id;
        const body = req.body

        // If not logged in
        let user_profile = await Auth.authenticateUser(req.header('X-Authorization'));
        if (user_profile == null) { // Not logged in
            errorReason = "Unauthorized";
            throw new Error();
        }

        // Syntax Checks
        if (body.title == null || body.description == null ||
            body.categoryId == null || isNaN(body.categoryId) ||
            isNaN(Date.parse(body.closingDate))) {
            errorReason = "Bad Request";
            throw new Error();
        }

        // Check petition exists
        const petition = (await Petition.getPetitionById(petitionId))[0];
        if (results.length == null) {
            errorReason = "Not Found";
            throw new Error();
        }

        if ((await Petition.getCategoryById(body.categoryId)).length === 0) { // Category doesn't exist
            errorReason = "Bad Request";
            throw new Error();
        }

        if (Date.now() >= Date.parse(body.closingDate)) { // Closing Date is not in the future
            errorReason = "Bad Request";
            throw new Error();
        }

        // Check user is author
        if (user_profile.userId !== petition.author_id) {
            errorReason = "Forbidden";
            throw new Error();
        }

        // Update petition
        const values = [body.title, body.description, body.categoryId, body.closingDate, petitionId];
        await Petition.updatePetitionById(values);

        res.statusMessage = "OK";
        res.status(200).send(results[0]);
    } catch (e) {
        if (errorReason === "Bad Request") {
            res.statusMessage = errorReason;
            res.status(400).send();
        } else if (errorReason === "Unauthorized") {
            res.statusMessage = errorReason;
            res.status(401).send();
        } else if (errorReason === "Forbidden") {
            res.statusMessage = errorReason;
            res.status(403).send();
        } else if (errorReason === "Not Found") {
            res.statusMessage = errorReason;
            res.status(404).send();
        } else {
            console.log(e);
            res.statusMessage = "Internal Server Error";
            res.status(500).send();
        }
    }
}