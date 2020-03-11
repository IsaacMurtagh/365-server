const db = require('../../config/db');

module.exports.createUser = async function (values) {

    const connection = await db.getPool().getConnection();

    const sql = 'INSERT INTO User (name, email, password, city, country) ' +
                'VALUES (?, ?, ?, ?, ?)';

    const [rows, fields] = await connection.query(sql, values);
    return rows;
}

module.exports.getUserByEmail = async function (email) {

    const connection = await db.getPool().getConnection();

    const sql = 'SELECT * FROM User WHERE email = ?';

    const [rows, fields] = await connection.query(sql, [email]);
    return rows;
}

module.exports.storeTokenById = async function (userId, token) {
    const connection = await db.getPool().getConnection();

    const sql = 'UPDATE User SET auth_token = ? WHERE user_id = ?';

    const [rows, fields] = await connection.query(sql, [token, userId]);
    return rows;
}

module.exports.getUserByToken = async function (token) {
    const connection = await db.getPool().getConnection();

    const sql = "SELECT * FROM User WHERE auth_token = ?";

    const [rows, fields] = await connection.query(sql, [token]);
    return rows;
}

module.exports.updateUserById = async function (user_id, values) {
    const connection = await db.getPool().getConnection();
    values.push(user_id)


    const sql = "UPDATE User SET name = ?, email = ?, password = ?, city = ?, country = ? WHERE user_id = ?";

    const [rows, fields] = await connection.query(sql, values);
    return rows;
}

module.exports.getUserById = async function (user_id) {
    const connection = await db.getPool().getConnection();

    const sql = 'SELECT * FROM User WHERE user_id = ?';

    const [rows, fields] = await connection.query(sql, [user_id]);
    return rows;
}