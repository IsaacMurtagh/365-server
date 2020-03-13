const Petition = require('../models/petitions.model');
const Auth = require('./helpers/authenticate');

exports.getPetitions = async function (req, res) {
    var errorReason = "";
    try {
        await Petition.getPeititons("ALPHABETICAL_ASC");
    } catch (e) {
        
    }
}