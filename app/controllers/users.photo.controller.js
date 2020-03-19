const User = require('../models/user.model');
const Photo = require('../models/user.photo.model');
const fs = require('mz/fs');
const mime = require('mime-types');

exports.getPhotoByUserId = async function (req, res) {
    let errorReason = "";
    try {
        const userId = req.params.id;

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