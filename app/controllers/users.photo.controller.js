const User = require('../models/user.model');
const Photo = require('../models/user.photo.model');
const Auth = require('./helpers/authenticate');
const fs = require('mz/fs');
const mime = require('mime-types');
const Jimp = require('jimp');

exports.getPhotoByUserId = async function (req, res) {
    let errorReason = "";
    try {

        let photo_filename = (await Photo.getPhotoById(userId))[0];
        if (!photo_filename) {
            errorReason = "Not Found";
            throw new Error();
        }
        photo_filename = photo_filename.photo_filename;
        const photoDirectory = "storage/photos/";

        let image;
        let mimeType;
        if( await fs.exists(photoDirectory + photo_filename)) {
            image = await fs.readFile(photoDirectory + photo_filename);
            mimeType = mime.lookup(photo_filename);
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

exports.addProfileToUser = async function (req, res) {
    let errorReason = "";
    try {
        let image = req.body;
        console.log(image);

        let user_profile = await Auth.authenticateUser(req.header('X-Authorization'));
        if (user_profile == null) {
            errorReason = "Unauthorized";
            throw new Error();
        }

        // User exists by param
        const editing_profile = await User.getUserById(req.params.id);
        if (!editing_profile) {
            errorReason = "Not Found";
            throw new Error();
        }

        // User requested is same as usermimetype get mimstream
        if  (user_profile.user_id !== req.params.id) { // Not own profile
            errorReason = "Forbidden";
            throw new Error();
        }
        // read image


        res.statusMessage = "OK";
        res.status(201).send();
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
