const petitions = require('../controllers/petitions.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/petitions')
        .get(petitions.getPetitions)
        .post(petitions.addPetition);

    app.route(app.rootUrl + '/petitions/:id')
        .get(petitions.getPetitionById)
        .patch(petitions.updatePetitonById)
}