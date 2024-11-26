const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');
const dbController = require('../controllers/dbController');
const multer = require('multer');
const path = require('path');

// multer를 사용한 파일 업로드 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, req.session.user.id + ext); // 파일 이름을 유저 아이디로 설정
    }
})

// 공통 테마 데이터 설정 미들웨어
router.use((req, res, next) => {
    // 기본 테마는 Light 모드
    res.locals.theme = req.session?.theme || 'light';
    next();
});

const upload = multer({ storage: storage });

router.get('/dashboard', viewController.dashboard);
router.get('/news', viewController.newsPage);
router.get('/login', viewController.loginPage);
router.get('/register', viewController.registerPage); // 회원가입 페이지
router.get('/chat', viewController.chatPage);
router.get('/help', viewController.helpPage);
router.get('/settings', viewController.settingsPage);
router.get('/mypage', viewController.myPage);
router.get('/dashboard', dbController.getCompanies); // 회사 목록 카드 생성

router.post('/uploadProfilePicture', upload.single('profilePicture'), dbController.uploadProfilePicture);
router.post('/updateProfilePicture', dbController.updateProfilePicture);

// 뉴스 관련 API
router.get('/articles', dbController.getArticles);
// 뉴스 검색 요청 처리
router.post('/search', dbController.searchArticles);  // 검색 요청 시 searchArticles 메소드 호출
router.post('/favorite', dbController.addFavorite);


// 사용자 로그인/회원가입/로그아웃 관련 라우트
router.post('/login', dbController.loginUser);

// 사용자 계정 삭제 관련 라우트
router.post('/delete-account', dbController.deleteAccount);

router.post('/register', (req, res) => {
    const { name, id, password, email } = req.body;
    dbController.registerUser(name, id, password, email)
        .then(result => {
            res.redirect('/login');
        })
        .catch(errorMessage => {
            res.status(500).render('login', { errorMessage });
        });
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send('Error during logout');
        res.redirect('/login');
    });
});

// 비밀번호 찾기 페이지
router.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { errorMessage: null, successMessage: null });
});

// 비밀번호 찾기 요청 처리
router.post('/forgot-password', dbController.forgotPassword);

// 비밀번호 재설정 페이지
router.get('/reset-password/:token', dbController.resetPasswordPage);

// 비밀번호 재설정 요청 처리
router.post('/reset-password/:token', dbController.resetPassword);



// 좋아요 누른 회사 목록과 로고 정보를 반환하는 API
router.get('/liked-companies/:userId', (req, res) => {
    const userId = req.params.userId;

    dbController.getCompanyLogos(userId, (err, companyLogos) => {
        if (err) {
            return res.status(500).send('Error fetching liked companies.');
        }
        res.json(companyLogos);  // 회사 목록과 로고 정보 반환
    });
});


// 유저가 좋아요한 회사 목록과 월별 데이터를 반환하는 API
router.get('/liked-companies-monthData/:userId', (req, res) => {
    const userId = req.params.userId;

    dbController.getMonthlySentiment(userId, (err, monthData) => {
        if (err) {
            return res.status(500).json({ error: "Error fetching liked companies" });
        }
        res.json(monthData); // 회사별 월별 sentiment 데이터 반환
    });
});

module.exports = router;