const Petition = require('../models/petitions.model');
const Auth = require('./helpers/authenticate');

exports.getPetitions = async function (req, res) {
    var errorReason = "";
    try {
        console.log(req.query);
        const q = req.query;
        let results = await Petition.getPeititons(q);

        let start = 0;
        let end = results.length;
        if(req.query.startIndex != null) {
            start = req.query.startIndex;
        }
        if(req.query.count != null) {
            end = Math.min(req.query.count + start, end);
        }

        results = results.slice(start, end);
        console.log(results)

        res.statusMessage = "OK";
        res.status(200).send();
    } catch (e) {
        
    }
}