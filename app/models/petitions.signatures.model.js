const db = require('../../config/db');

exports.getSignaturesForPetition = async function (id) {
    const connection = await db.getPool().getConnection();

    const query = "SELECT S.signatory_id AS signatoryId, U.name, U.city, U.country, S.signed_date AS signedDate " +
        "FROM Petition P NATURAL JOIN Signature S JOIN User U ON P.author_id = U.user_id " +
        "WHERE P.petition_id = ? ORDER BY S.signed_date";

    const [rows, fields] = await connection.query(query, [id]);
    await connection.release();
    return rows;

};

exports.getSignaturesForPetitionByUser = async function (petitionId, userId) {
    const connection = await db.getPool().getConnection();

    const query = "SELECT * FROM Signature Where petition_id = ? AND signatory_id = ? ";

    const [rows, fields] = await connection.query(query, [petitionId, userId]);
    await connection.release();
    return rows;
};

exports.signPetition = async function (values) {
    const connection = await db.getPool().getConnection();

    const query = "INSERT INTO Signature (signatory_id, petition_id, signed_date) VALUES (?, ?, ?)";
    await connection.query(query, values);
    await connection.release();
};


exports.removeSignature = async function (petitionId, signatureId) {
    const connection = await db.getPool().getConnection();

    const query = "DELETE FROM Signature WHERE petition_id = ? and signatory_id = ?";
    await connection.query(query, [petitionId, signatureId]);
    await connection.release();
};