const Petition = require('../models/petitions.model');
const Photo = require('../models/petitions.photo.model');
const Auth = require('./helpers/authenticate');
const fs = require('mz/fs');
const mime = require('mime-types');
const Jimp = require('jimp');

exports.getPhotoById = async function (req, res) {
    let errorReason = "";
    try {
        petitionId = req.params.id;
        let photo_filename = (await Photo.getPhotoById(petitionId))[0];
        if (!photo_filename) { // Petition has no photo
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


exports.addPhotoToPetition = async function (req, res) {
    let errorReason = "";
    try {
        let image_buffer = req.body;
        const petitionId = req.params.id;
        const photoDirectory = "storage/photos/";
        const img_mime = req.headers['content-type'];

        let user_profile = await Auth.authenticateUser(req.header('X-Authorization'));
        if (!user_profile) {
            errorReason = "Unauthorized";
            throw new Error();
        }

        // petition exists
        const petition = (await Petition.getPetitionById(petitionId))[0];
        if (!petition) {
            errorReason = "Not Found";
            throw new Error();
        }

        if  (user_profile.user_id !== petition.author_id) { // User not the author
            errorReason = "Forbidden";
            throw new Error();
        }

        const image_name = "petition_" + petition.petition_id;

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
        await Photo.addPhotoById(petition.petition_id, imageFull);

        if (petition.photo_filename) {
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
        } else if (errorReason === "Not Found") {
            res.statusMessage = errorReason;
            res.status(404).send();
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