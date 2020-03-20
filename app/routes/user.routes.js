const users = require('../controllers/users.controller');
const userPhotos = require('../controllers/users.photo.controller');
const Auth = require('../middleware/Auth');

module.exports = function (app) {
    app.route(app.rootUrl + '/users/register')
        .post(users.createUser);

    app.route(app.rootUrl + '/users/login')
        .post(users.login);

    app.route(app.rootUrl + '/users/logout')
        .post(users.logout);

    app.route(app.rootUrl + '/users/:id')
        .get(users.getUser)
        .patch(users.updateUser)
        .delete();

    app.route(app.rootUrl + '/users/:id/photo')
        .get(userPhotos.getPhotoByUserId)
        .put(userPhotos.addProfileToUser)
}
