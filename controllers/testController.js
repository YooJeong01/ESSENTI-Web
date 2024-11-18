// controllers/testController.js
const dbConfig = require('../config/db');
const conn = dbConfig.init();

//db 연결
dbConfig.connect(conn);

// SQL 쿼리 테스트 함수
const testQuery = () => {
    const query = 'ALTER TABLE `like` DROP FOREIGN KEY like_user_FK, ADD CONSTRAINT like_user_FK FOREIGN KEY (user_id) REFERENCES user(Id) ON DELETE CASCADE'; // 원하는 SQL 쿼리로 변경해

    conn.query(query, (err, results) => {
        if (err) {
            console.error('SQL 쿼리 에러: ', err);
            return;
        }
        console.log('쿼리 결과: ', results);
    });
};

const testQuery1 = () => {
    const query = 'INSERT INTO company  (company_name) VALUES ("크래프톤")'; // 원하는 SQL 쿼리로 변경해

    conn.query(query, (err, results) => {
        if (err) {
            console.error('SQL 쿼리 에러: ', err);
            return;
        }
        console.log('쿼리 결과: ', results);
    });
};

const testQuery2 = () => {
    const query = 'INSERT INTO company  (company_name) VALUES ("KT&G")'; // 원하는 SQL 쿼리로 변경해

    conn.query(query, (err, results) => {
        if (err) {
            console.error('SQL 쿼리 에러: ', err);
            return;
        }
        console.log('쿼리 결과: ', results);
    });
};



// 쿼리 실행
testQuery();

// 연결 종료
process.on('exit', () => {
    conn.end(err => {
        if (err) console.error('DB 연결 종료 에러: ', err);
        else console.log('DB 연결 종료');
    });
});