var datetime = require('node-datetime');

exports.formatedDate = function (date) {
    let dt = datetime.create()
    return dt.format('Y-m-d H:M:S.N');
}