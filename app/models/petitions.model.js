const db = require('../../config/db');

exports.getPeititons = async function (qp) {
    const connection = await db.getPool().getConnection();
    let values = [];

    let query = "SELECT petition_id, title, Category.name, User.name, COUNT(petition_id) AS signatureCount " +
        "FROM Petition NATURAL JOIN Signature " +
        "JOIN User on Petition.author_id = User.user_id " +
        "JOIN Category on Category.category_id = Petition.petition_id ";

    let where = "";
    if (qp.q != null || qp.categoryId != null || qp.authorId != null) {
        where = "WHERE ";
        let needAnd = false;
        if (qp.q != null) {
            if (needAnd) {where+= 'AND '};
            where += `title LIKE ? `;
            values.push(`'%${qp.q}%'`);
            needAnd = true;
        }
        if (qp.categoryId != null) {
            if (needAnd) {where+= 'AND '};
            where += `Category.category_id = ? `;
            values.push(qp.categoryId);
            needAnd = true;
        }
        if (qp.authorId != null) {
            if (needAnd) {where+= 'AND '};
            where += `Petition.author_id = ? `;
            values.push(qp.authorId);
        }
    }
    query += where;
    query += "GROUP BY petition_id ";

    let sortBy = "";
    if (qp.sortBy == "ALPHABETICAL_ASC") {
        sortBy = "ORDER BY Category.name ASC";
    } else if (qp.sortBy == "ALPHABETICAL_DESC") {
        sortBy = "ORDER BY Category.name DESC";
    } else if (qp.sortBy == "SIGNATURES_ASC") {
        sortBy = "ORDER BY Category.name DESC";
    } else {
        sortBy = "ORDER BY Category.name DESC";
    }
    query += sortBy;

    console.log(query);


    const [rows, fields] = await connection.query(query, values);
    await connection.release();
    return rows;
}