const Petition = require('../models/petitions.model');
const Auth = require('./helpers/authenticate');

exports.getPetitions = async function (req, res) {
    var errorReason = "";
    try {
        const q = req.query;
        let results = await Petition.getPeititons(q);

        let start = 0;
        let end = results.length;
        if(req.query.startIndex != null && Number(req.query.count) != NaN) {
            start = Number(req.query.startIndex);
        }
        if(req.query.count != null && Number(req.query.count) != NaN) {
            end = Math.min(Number(req.query.count) + start, end);
        }

        results = results.slice(start, end);

        res.statusMessage = "OK";
        res.status(200).send(results);
    } catch (e) {
        
    }
}