const Petition = require('../models/petitions.model');
const Auth = require('./helpers/authenticate');

exports.getPetitions = async function (req, res) {
    var errorReason = "";
    try {
        console.log(req.query);
        const q = req.query;

        res.statusMessage = "OK";
        res.status(200).send();
    } catch (e) {
        
    }
}