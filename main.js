// main.js ver.2
const express = require('express');
const session = require('express-session');
const ejs = require('ejs');
const viewRoutes = require('./routes/viewRoutes');
const newsController = require('./controllers/newsController');
const app = express();
const port = 3000;
const path = require('path')
require('dotenv').config(); // .env 파일 불러오기
// DB 설정
const dbConfig = require('./config/db');
const conn = dbConfig.init();
dbConfig.connect(conn);
// EJS 설정
app.set('view engine', 'ejs');
app.set('views', './views');

// 1. 세션 미들웨어를 먼저 등록하여 모든 라우트에서 세션 사용 가능하게 설정
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET, // .env 파일에서 세션 비밀 키 불러오기
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// 2. 세션을 확인하고 공통 데이터(예: 사용자 이름)를 모든 EJS 템플릿에 전달하는 미들웨어
app.use((req, res, next) => {
    if (req.session.user) {
        // 세션에 저장된 사용자 정보를 res.locals에 저장하여 모든 뷰에서 접근 가능
        res.locals.username = req.session.user.name;
        res.locals.userId = req.session.user.Id; // ID 추가
    } else {
        res.locals.username = null;
        res.locals.userId = null; // ID도 null로 설정
    }
    next();
});


// 3. 정적 파일 제공 미들웨어 (정적 파일 서빙, 세션 확인 이후에 사용 가능)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 4. 라우트 처리 - 세션 미들웨어 및 사용자 확인 미들웨어 이후에 라우트를 등록
app.use('/', viewRoutes); // '/' 경로에 대해 viewRoutes 사용

// 5. 서버 실행
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/login`);
});