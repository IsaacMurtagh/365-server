const Petition = require('../models/petitions.model');
const Signature = require('../models/petitions.signatures.model');
const Auth = require('./helpers/authenticate');
const DateTime = require('./helpers/datetime');

exports.getSignaturesByPetition = async function (req, res) {
    var errorReason = "";
    try {
        const petitionId = req.params.id;

        let results = await Signature.getSignaturesForPetition(petitionId);
        if (results.length === 0) {
            errorReason = "Not Found";
            throw new Error();
        }

        res.statusMessage = "OK";
        res.status(200).send(results);
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
};


exports.signPetition = async function (req, res) {
    let errorReason = "";
    try {
        const petitionId = req.params.id;

        let user_profile = await Auth.authenticateUser(req.header('X-Authorization'));
        if (!user_profile) {
            errorReason = "Unauthorized";
            throw new Error();
        }

        let petition = await Petition.getPetitionById(petitionId);
        if (!petition) {
            errorReason = "Not Found";
            throw new Error();
        }

        if(Date.now() >= Date.parse(petition.closing_date)) {
            errorReason = "Forbidden";
            throw new Error();
        }

        const userAlreadySigned = (await Signature.getSignaturesForPetitionByUser(petitionId, user_profile.user_id))[0]
        if (userAlreadySigned) {
            errorReason = "Forbidden";
            throw new Error();
        }

        const values = [Number(user_profile.user_id), Number(petitionId), DateTime.formatedDate(Date.now())];

        await Signature.signPetition(values);

        res.statusMessage = "Created";
        res.status(201).send();

    } catch (err) {
        if (errorReason === "Unauthorized") {
            res.statusMessage = errorReason;
            res.status(401).send();
        } else if (errorReason === "Not Found") {
            res.statusMessage = errorReason;
            res.status(404).send();
        } else if (errorReason === "Forbidden") {
            res.statusMessage = errorReason;
            res.status(403).send();
        } else {
            console.log(err);
            res.statusMessage = "Internal Server Error";
            res.status(500).send();
        }
    }
};

exports.removeSigantureById = async function (req, res) {
    let errorReason = "";
    try {
        const petitionId = req.params.id;

        let user_profile = await Auth.authenticateUser(req.header('X-Authorization'));
        if (!user_profile) {
            errorReason = "Unauthorized";
            throw new Error();
        }

        let petition = (await Petition.getPetitionById(petitionId))[0];
        if (!petition) {
            errorReason = "Not Found";
            throw new Error();
        }

        if(Date.now() >= Date.parse(petition.closing_date)) {
            errorReason = "Forbidden";
            throw new Error();
        }

        const userAlreadySigned = (await Signature.getSignaturesForPetitionByUser(petitionId, user_profile.user_id))[0]
        console.log(userAlreadySigned)
        if (!userAlreadySigned) { // User has not signed the petition
            errorReason = "Forbidden";
            throw new Error();
        }

        await Signature.removeSignature(petitionId, user_profile.user_id);

        res.statusMessage = "OK";
        res.status(200).send();

    } catch (err) {
        if (errorReason === "Unauthorized") {
            res.statusMessage = errorReason;
            res.status(401).send();
        } else if (errorReason === "Not Found") {
            res.statusMessage = errorReason;
            res.status(404).send();
        } else if (errorReason === "Forbidden") {
            res.statusMessage = errorReason;
            res.status(403).send();
        } else {
            console.log(err);
            res.statusMessage = "Internal Server Error";
            res.status(500).send();
        }
    }
};