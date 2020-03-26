const db = require('../../config/db');

exports.getPhotoById = async function (id) {
    const connection = await db.getPool().getConnection();

    const query = "SELECT photo_filename FROM Petition WHERE petition_id = ?";
    const [rows, fields] = await connection.query(query, [id]);
    await connection.release();
    return rows;

};

exports.addPhotoById = async function (id, photoName) {
    const connection = await db.getPool().getConnection();

    const query = "UPDATE Petition SET photo_filename = ? WHERE petition_id = ?";
    await connection.query(query, [photoName, id]);
    await connection.release();
};