const db = require('../../config/db');

exports.getPeititons = async function (qp) {
    const connection = await db.getPool().getConnection();
    let values = [];

    let query = "SELECT P.petition_id AS petitionId, title, C.name AS category, U.name AS authorName, " +
        "COUNT(S.signatory_id) AS signatureCount " +
        "FROM Petition P LEFT JOIN Signature S ON P.petition_id = S.petition_id " +
        "JOIN User U on P.author_id = U.user_id " +
        "JOIN Category C on C.category_id = P.category_id ";

    let where = "";
    if (qp.q != null || qp.categoryId != null || qp.authorId != null) {
        where = "WHERE ";
        let needAnd = false;
        if (qp.q != null) {
            if (needAnd) {where+= 'AND '};
            where += `title LIKE ? `;
            values.push(`%${qp.q}%`);
            needAnd = true;
        }
        if (qp.categoryId != null) {
            if (needAnd) {where+= 'AND '};
            where += `P.category_id = ? `;
            values.push(Number(qp.categoryId));
            needAnd = true;
        }
        if (qp.authorId != null) {
            if (needAnd) {where+= 'AND '};
            where += `P.author_id = ? `;
            values.push(parseInt(qp.authorId));
        }
    }
    query += where;
    query += "GROUP BY P.petition_id ";

    let sortBy = "";
    if (qp.sortBy == "ALPHABETICAL_ASC") {
        sortBy = "ORDER BY Category.name ASC";
    } else if (qp.sortBy == "ALPHABETICAL_DESC") {
        sortBy = "ORDER BY Category.name DESC";
    } else if (qp.sortBy == "SIGNATURES_ASC") {
        sortBy = "ORDER BY signatureCount ASC";
    } else {
        sortBy = "ORDER BY signatureCount DESC";
    }
    query += sortBy;

    console.log(query)

    const [rows, fields] = await connection.query(query, values);
    await connection.release();
    return rows;
}

exports.getCategoryById = async function (id) {
    const connection = await db.getPool().getConnection();

    const query = "SELECT * FROM Category WHERE category_id = ?";
    const [rows, fields] = await connection.query(query, [id]);
    await connection.release();
    return rows

}

exports.addPetition = async function (values) {
    const connection = await db.getPool().getConnection();

    const query = "INSERT INTO Petition (title, description, author_id, category_id, created_date, closing_date) " +
        "VALUES (?, ?, ?, ?, ?, ?)";
    const [rows, fields] = await connection.query(query, values);
    await connection.release();
    return rows;

}

exports.getDetailedPetitionById = async function (id) {
    const connection = await db.getPool().getConnection();

    const query = "SELECT P.petition_id AS petitionId, P.title AS title, C.name AS category, U.name AS authorName, " +
        "COUNT(S.signatory_id) AS signatureCount, P.description as description, U.user_id AS authorId, " +
        "U.city AS authorCity, U.country AS authorCountry, P.created_date AS createdDate, P.closing_date AS closingDate " +
        "FROM Petition P JOIN User U ON P.author_id = U.user_id JOIN Category C ON P.category_id = C.category_id " +
        "LEFT JOIN Signature S ON P.petition_id = S.petition_id WHERE P.petition_id = ? GROUP BY P.petition_id"

    console.log(query)

    const [rows, fields] = await connection.query(query, [id]);
    await connection.release();
    return rows;
}

exports.getPetitionById = async function (id) {
    const connection = await db.getPool().getConnection();

    const query = "SELECT * FROM Petition WHERE petition_id = ?";

    console.log(query)

    const [rows, fields] = await connection.query(query, [id]);
    await connection.release();
    return rows;
}

exports.updatePetitionById = async function (values) {
    const connection = await db.getPool().getConnection();

    const query = "UPDATE Petition SET title = ?, description = ?, category_id = ?, " +
        "closing_date = ? WHERE petition_id = ?";

    console.log(query)

    await connection.query(query, values);
    await connection.release();
}
