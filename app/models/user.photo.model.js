const db = require('../../config/db');

exports.getPhotoById = async function (id) {
    const connection = await db.getPool().getConnection();

    const query = "SELECT photo_filename FROM User WHERE user_id = ?";
    const [rows, fields] = await connection.query(query, [id]);
    await connection.release();
    return rows;

}