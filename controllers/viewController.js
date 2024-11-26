const dbController = require('./dbController');  // dbController.js 가져오기


// session을 한 번에 이용하기 위한 코드
const viewController = {
    dashboard: (req, res, next) => {  // next 추가
        const user = req.session.user || null;
    
        if (!user) {
          return res.redirect('/login');
        }
    
        const userId = user.Id;
        console.log("User ID: ", userId); // 디버깅을 위한 로그

        // dbController에서 좋아요한 회사 목록을 가져오는 함수 호출
        dbController.getLikedCompanies(userId, (err, likedCompanies) => {
            if (err) {
                console.error(err);
                return next(err);  // next로 오류 처리
            }
            
            // 좋아요한 회사 목록과 관련된 기사를 가져오는 함수 호출
            dbController.getLikedCompaniesWithArticles(userId, likedCompanies, (err, companiesWithArticles) => {
                if (err) {
                    console.error(err);
                    return next(err);
                }
                
                // 전체 회사 목록 가져오기
                dbController.getCompanies((err, companies) => {
                    if (err) {
                        console.error(err);
                        return next(err);
                    }
        
                    // 좋아요한 회사 목록과 관련된 기사를 포함한 데이터, 전체 회사 목록을 대시보드로 전달
                    res.render('dashboard', { user, likedCompanies, companiesWithArticles, companies });
                });
            });
        });
    },
    loginPage: (req, res) => {
        res.render('login', { user: req.session.user || null });
    },
    chatPage: (req, res) => {
        res.render('chat', { user: req.session.user || null });
    },
    newsPage: (req, res) => {
        res.render('news', { user: req.session.user || null });
    },
    registerPage: (req, res) => {
        res.render('login', { user: req.session.user || null });
    },
    forgotPasswordPage:(req, res) => {
        res.render('forgot-password', {user: req.session.user || null});
    },
    resetPasswordPage: (req, res) => {
        res.render('reset-password', {user: req.session.user || null});
    },
    helpPage: (req,res) => {
        res.render('help', {user: req.session.user || null});
    },
    settingsPage: (req, res) => {
        res.render('settings', {user: req.session.user || null});
    },
    myPage: (req, res) => {
        console.log(req.session.user); // 디버깅용 로그
        if (req.session.user) {
            res.render('mypage', { user: req.session.user });
        } else {
            res.redirect('/login');
        }
    },
};
module.exports = viewController;