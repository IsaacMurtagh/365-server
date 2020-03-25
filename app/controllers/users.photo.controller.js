const User = require('../models/user.model');
const Photo = require('../models/user.photo.model');
const Auth = require('./helpers/authenticate');
const fs = require('mz/fs');
const mime = require('mime-types');
const bt = require('buffer-type');
const Jimp = require('jimp');

exports.getPhotoByUserId = async function (req, res) {
    let errorReason = "";
    try {
        userId = req.params.id;
        let user = (await Photo.getPhotoById(userId))[0];
        if (!user) { // user with ID does not exist
            errorReason = "Not Found";
            throw new Error();
        }
        photo_filename = user.photo_filename;
        if (!photo_filename) { // User does not have a profile set
            errorReason = "Not Found";
            throw new Error();
        }

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
        let image_buffer = req.body;
        const photoDirectory = "storage/photos/";

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
        // read image
        const img_mime = bt(image_buffer).type;
        const image_name = "user_" + user_profile.user_id;

        if (!(img_mime == Jimp.MIME_PNG || img_mime == Jimp.MIME_JPEG || img_mime == Jimp.MIME_GIF)) {
            errorReason = "Bad Request";
            throw new Error();
        }

        const image_full = await Jimp.read(image_buffer)
            .then(image => {
                let image_full = image_name + "." + image.getExtension();
                image.write(photoDirectory + image_full);
                return image_full
            })
            .catch(() => {
                errorReason = "Bad Request";
                throw new Error();
            });

        // Update user db based on image name
        await Photo.addPhotoById(user_profile.user_id, image_full);

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
