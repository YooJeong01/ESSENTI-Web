const mysql = require('mysql');
const dbInfo = {
    host: 'host',
    user: 'user',
    password: 'pw',
    database: 'db',
    charset: 'utf8'
}

module.exports = {
    init: function() {
        return mysql.createConnection(dbInfo);
    },
    connect: function(conn) {
        conn.connect(function(err) {
            if(err) console.error('mysql과 js 연결 에러 : ' + err);
            else console.log('mysql과 js 연결 성공');
        })
    }
};