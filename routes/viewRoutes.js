const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');
const newsController = require('../controllers/newsController');
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

const upload = multer({ storage: storage });

router.get('/dashboard', viewController.dashboard);
router.get('/news', viewController.newsPage);
router.get('/login', viewController.loginPage);
router.get('/register', viewController.registerPage); // 회원가입 페이지
router.get('/chat', viewController.chatPage);
router.get('/help', viewController.helpPage);
router.get('/settings', viewController.settingsPage);
router.get('/mypage', viewController.myPage);
router.get('/dashboard', newsController.getCompanies); // 회사 목록 카드 생성

router.post('/uploadProfilePicture', upload.single('profilePicture'), newsController.uploadProfilePicture);
router.post('/updateProfilePicture', newsController.updateProfilePicture);

// 뉴스 관련 API
router.get('/articles', newsController.getArticles);
// 뉴스 검색 요청 처리
router.post('/search', newsController.searchArticles);  // 검색 요청 시 searchArticles 메소드 호출
router.post('/favorite', newsController.addFavorite);


// 사용자 로그인/회원가입/로그아웃 관련 라우트
router.post('/login', newsController.loginUser);

// 사용자 계정 삭제 관련 라우트
router.post('/delete-account', newsController.deleteAccount);

router.post('/register', (req, res) => {
    const { name, id, password, email } = req.body;
    newsController.registerUser(name, id, password, email)
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

// 좋아요 누른 회사 목록과 로고 정보를 반환하는 API
router.get('/liked-companies/:userId', (req, res) => {
    const userId = req.params.userId;

    newsController.getCompanyLogos(userId, (err, companyLogos) => {
        if (err) {
            return res.status(500).send('Error fetching liked companies.');
        }
        res.json(companyLogos);  // 회사 목록과 로고 정보 반환
    });
});

module.exports = router;