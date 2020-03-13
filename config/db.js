const mysql = require('mysql2/promise');

let pool = null;

exports.createPool = async function () {
    pool = mysql.createPool({
        multipleStatements: true,
        host: process.env.SENG365_MYSQL_HOST,
        user: process.env.SENG365_MYSQL_USER,
        password: process.env.SENG365_MYSQL_PASSWORD,
        database: process.env.SENG365_MYSQL_DATABASE,
        port: process.env.SENG365_MYSQL_PORT || 9991 //Change to 3306 when in lab
    });
};

exports.getPool = function () {
    return pool;
};
