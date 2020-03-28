const User = require('../models/user.model');
const Photo = require('../models/user.photo.model');
const Auth = require('./helpers/authenticate');
const fs = require('mz/fs');
const mime = require('mime-types');
const Jimp = require('jimp');

exports.getPhotoByUserId = async function (req, res) {
    let errorReason = "";
    try {
        userId = req.params.id;
        let photo_filename = (await Photo.getPhotoById(userId))[0];
        if (!photo_filename) { // User has no photo
            errorReason = "Not Found";
            throw new Error();
        }
        photo_filename = photo_filename.photo_filename;


        const photoDirectory = "storage/photos/";

        let image;
        let mimeType;
        if( await fs.exists(photoDirectory + photo_filename)) {
            image = await fs.readFile(photoDirectory + photo_filename);
            mimeType = mime.lookup(photoDirectory + photo_filename);
        } else {
            errorReason = "Not Found";
            throw new Error();
        }

        res.statusMessage = "OK";
        res.status(200).contentType(mimeType).send(image);
    } catch (err) {
        if (errorReason === "Not Found") {
            res.statusMessage = errorReason;
            res.status(404).send();
        } else {
            console.log(err);
            res.statusMessage = "Internal Server Error";
            res.status(500).send();
        }
    }
};

exports.addPhotoToUser = async function (req, res) {
    let errorReason = "";
    try {
        let image_buffer = req.body;
        const photoDirectory = "storage/photos/";
        const img_mime = req.headers['content-type'];

        let user_profile = await Auth.authenticateUser(req.header('X-Authorization'));
        if (user_profile == null) {
            errorReason = "Unauthorized";
            throw new Error();
        }

        // User exists by param
        const editing_profile = (await User.getUserById(req.params.id))[0];
        if (!editing_profile) {
            errorReason = "Not Found";
            throw new Error();
        }

        // User requested is same as logged in user
        if  (user_profile.user_id !== editing_profile.user_id) { // Not own profile
            errorReason = "Forbidden";
            throw new Error();
        }

        const image_name = "user_" + user_profile.user_id;

        // image mime is of expected type
        if (!(img_mime == Jimp.MIME_PNG || img_mime == Jimp.MIME_JPEG || img_mime == Jimp.MIME_GIF)) {
            errorReason = "Bad Request";
            throw new Error();
        }

        const imageFull = image_name + "." + mime.extension(img_mime);
        fs.writeFile(photoDirectory + imageFull, image_buffer, (err) => {
            if (err) {
                console.log(err);
                errorReason = "Bad Request";
                throw new Error();
            }
        });

        // Update user db based on image name
        await Photo.addPhotoById(user_profile.user_id, imageFull);

        if (user_profile.photo_filename) {
            res.statusMessage = "OK";
            res.status(200).send();
        } else {
            res.statusMessage = "Created";
            res.status(201).send();
        }
    } catch (err) {
        if (errorReason === "Unauthorized") {
            res.statusMessage = errorReason;
            res.status(401).send();
        } else if (errorReason === "Bad Request") {
            res.statusMessage = errorReason;
            res.status(400).send();
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

exports.deletePhotoFromUser = async function (req, res) {
    let errorReason = "";
    try {
        const photoDirectory = "storage/photos/";
        const userId = req.params.id;

        let user_profile = await Auth.authenticateUser(req.header('X-Authorization'));
        if (user_profile == null) {
            errorReason = "Unauthorized";
            throw new Error();
        }

        // User exists by param
        const editing_profile = (await User.getUserById(userId))[0];
        if (!editing_profile) {
            errorReason = "Not Found";
            throw new Error();
        }

        // User requested is same as logged in user
        if  (user_profile.user_id !== editing_profile.user_id) { // Not own profile
            errorReason = "Forbidden";
            throw new Error();
        }

        const photoFilename = user_profile.photo_filename;
        if (!photoFilename) { // User does not have a profile
            errorReason = "Not Found";
            throw new Error();
        }

        await Photo.deletePhotoById(userId);

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
