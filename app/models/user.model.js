const db = require('../../config/db');
const fs = require('mz/fs');

module.exports.createUser = async function (values) {

    const connection = await db.getPool().getConnection();

    const sql = 'INSERT INTO User (name, email, password, city, country) ' +
                'VALUES (?, ?, ?, ?, ?)'

    const [rows, fields] = await connection.query(sql, values);
    console.log(rows);
    return rows;
}

module.exports.getUserByEmail = async function (email) {

    const connection = await db.getPool().getConnection();

    const sql = 'SELECT * FROM User WHERE email = ?'

    const [rows, fields] = await connection.query(sql, [email]);
    return rows;
}