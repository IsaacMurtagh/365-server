const db = require('../../config/db');

module.exports.getPeititons = async function (query_params) {

    let q = 1;
    if (query_params.q != null) {
        q = "title = ?"
    }
    let sortBy;
    if (query_params.sortBy == "ALPHABETICAL_ASC") {
        sortBy = "ORDER BY title ASC"
    } else if (query_params.sortBy == "ALPHABETICAL_DESC") {
        sortBy = "ORDER BY title DESC"
    } else if (query_params == "SIGNATURES_ASC") {
        sortBy = "ORDER BY title DESC"
    }

    switch (query_params.sortBy){
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