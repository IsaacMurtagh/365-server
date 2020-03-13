const db = require('../../config/db');

module.exports.getPeititons = async function (order_conditon) {

    const connection = await db.getPool().getConnection();

    switch (order_conditon){
        case "ALPHABETICAL_ASC":
            console.log(order_conditon);
            break;
        case "ALPHABETICAL_DESC":
            console.log(order_conditon);
            break;
        case "SIGNATURES_ASC":
            console.log(order_conditon);
            break;
        default:
            console.log(order_conditon);
            break;
    }
    // const sql = 'INSERT INTO User (name, email, password, city, country) ' +
    //     'VALUES (?, ?, ?, ?, ?)';
    //
    // const [rows, fields] = await connection.query(sql, values);
    return true;
}