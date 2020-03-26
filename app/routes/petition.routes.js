const petitions = require('../controllers/petitions.controller');
const photos = require('../controllers/petitions.photo.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/petitions')
        .get(petitions.getPetitions)
        .post(petitions.addPetition);

    app.route(app.rootUrl + '/petitions/categories')
        .get(petitions.getCategories);

    app.route(app.rootUrl + '/petitions/:id')
        .get(petitions.getPetitionById)
        .patch(petitions.updatePetitonById)
        .delete(petitions.deletePetitonById);

    app.route(app.rootUrl + '/petitions/:id/photo')
        .get(photos.getPhotoById)
        .put(photos.addPhotoToPetition);
}