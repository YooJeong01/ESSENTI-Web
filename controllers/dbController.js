const dbConfig = require('../config/db');
const bcrypt = require('bcryptjs');
const path = require('path'); // path 모듈 추가
const conn = dbConfig.init();
dbConfig.connect(conn);
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// 기사 목록 가져오기
exports.getArticles = (req, res) => {
    conn.query('SELECT Number, Press, Wdate, Url, Title, Contents, Image, Sentiment, Summary FROM financial_news', (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
};

// // 기사 목록 가져오기 (페이징 처리)
// exports.getArticles = (req, res) => {
//     // 페이지 번호와 한 페이지에 보여줄 항목 수를 쿼리 파라미터로 받음
//     const { page = 1, limit = 20 } = req.query;
//     const offset = (page - 1) * limit;  // 페이지네이션을 위한 오프셋 계산

//     // SQL 쿼리문 수정: LIMIT과 OFFSET을 사용하여 결과를 제한
//     const query = `
//         SELECT Number, Press, Wdate, Url, Title, Contents, Image, Sentiment, Summary 
//         FROM financial_news
//         LIMIT ? OFFSET ?
//     `;

//     conn.query(query, [parseInt(limit), parseInt(offset)], (err, results) => {
//         if (err) {
//             return res.status(500).send(err);
//         }

//         // 결과를 클라이언트에 전달
//         res.json(results);
//     });
// };

// 검색 기능 추가
exports.searchArticles = (req, res) => {
    const { searchQuery } = req.body;  // 요청에서 검색어 받아오기

    if (!searchQuery) {
        return res.status(400).json({ message: '검색어를 입력하세요.' });
    }

    const query = `
        SELECT Number, Press, Wdate, Url, Title, Contents, Image, Sentiment, Summary
        FROM financial_news
        WHERE Title LIKE ? OR Contents LIKE ?`;

    // 검색어를 %로 감싸서 LIKE 쿼리 사용
    conn.query(query, [`%${searchQuery}%`, `%${searchQuery}%`], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);  // 검색된 결과를 JSON으로 반환
    });
};

// 로그인 처리 함수
exports.loginUser = (req, res) => {
    const { id, password } = req.body;

    // 사용자가 입력한 ID를 기반으로 사용자 조회
    conn.query('SELECT * FROM user WHERE Id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).render('login', { errorMessage: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(401).render('login', { errorMessage: 'Invalid credentials' });
        }
        const user = results[0];

        // 비밀번호 비교
        bcrypt.compare(password, user.Password, (err, isMatch) => {
            if (err) {
                return res.status(500).render('login', { errorMessage: 'Error occurred' });
            }

            if (isMatch) {
                req.session.user = {
                    Id: user.Id,
                    name: user.Name,
                    email: user.Email,
                    profilePicture: user.profile_picture || 'default.png',
                };
                res.redirect('/dashboard');
            } else {
                return res.status(401).render('login', { errorMessage: 'Incorrect password' });
            }
        });
    });
};

// Promise 사용한 회원가입
exports.registerUser = (name, id, password, email) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, (err, hash) => {  // 비밀번호 해시
            if (err) {
                return reject('Error occurred during registration');
            }

            conn.query('INSERT INTO user (Name, Id, Password, Email) VALUES (?, ?, ?, ?)', 
                [name, id, hash, email], (err, result) => {
                    if (err) {
                        return reject('Registration failed: User ID or Email may be already taken');
                    }
                    resolve(result);  // 회원가입 성공
                });
        });
    });
};

// 계정 삭제 함수
exports.deleteAccount = (req, res) => {
    const userId = req.body.userId;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // 사용자가 로그인한 상태인지 확인
    if (req.session.user && req.session.user.Id === userId) {
        // 사용자 계정 삭제 쿼리
        const sql = 'DELETE FROM user WHERE Id = ?';
        conn.query(sql, [userId], (err, result) => {
            if (err) {
                console.error("Error deleting account: ", err);
                return res.status(500).json({ success: false, message: 'Error deleting account' });
            }

            // 계정 삭제 성공시 세션 종료
            req.session.destroy(err => {
                if (err) {
                    console.error('Error destroying session:', err);
                    return res.status(500).json({ success: false, message: 'Error logging out' });
                }
                res.json({ success: true, message: 'Account successfully deleted' });
            });
        });
    } else {
        return res.status(400).json({ success: false, message: 'Unauthorized action' });
    }
};

// 비밀번호 찾기 요청 처리
exports.forgotPassword = (req, res) => {
    const { email } = req.body;

    conn.query('SELECT * FROM user WHERE Email = ?', [email], (err, results) => {
        if (err) {
            return res.status(500).render('forgot-password', { 
                errorMessage: 'Internal server error', 
                successMessage: null 
            });
        }

        if (results.length === 0) {
            return res.status(404).render('forgot-password', { 
                errorMessage: 'Email not found', 
                successMessage: null 
            });
        }

        const user = results[0];
        const token = crypto.randomBytes(20).toString('hex');
        const expiry = Date.now() + 3600000; // 1시간 유효

        conn.query('UPDATE user SET reset_token = ?, reset_token_expiry = ? WHERE Id = ?', 
            [token, expiry, user.Id], (err) => {
                if (err) {
                    return res.status(500).render('forgot-password', { 
                        errorMessage: 'Error generating reset token', 
                        successMessage: null 
                    });
                }

                const resetLink = `${req.protocol}://${req.get('host')}/reset-password/${token}`;
                exports.sendEmail(user.Email, 'Password Reset Request', `
                    <p>Hello ${user.Name},</p>
                    <p>You requested a password reset. Click the link below to reset your password:</p>
                    <a href="${resetLink}">${resetLink}</a>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                `);

                res.render('forgot-password', { 
                    errorMessage: null, 
                    successMessage: 'Password reset email sent. Please check your email.' 
                });
            });
    });
};

// 비밀번호 재설정 페이지 처리
exports.resetPasswordPage = (req, res) => {
    const token = req.params.token;

    conn.query('SELECT * FROM user WHERE reset_token = ? AND reset_token_expiry > ?', 
        [token, Date.now()], (err, results) => {
            if (err || results.length === 0) {
                return res.status(400).send('Invalid or expired token');
            }

            res.render('reset-password', { token });
        });
};

// 비밀번호 재설정 요청 처리
exports.resetPassword = (req, res) => {
    const { password } = req.body;
    const token = req.params.token;

    conn.query('SELECT * FROM user WHERE reset_token = ? AND reset_token_expiry > ?', 
        [token, Date.now()], (err, results) => {
            if (err || results.length === 0) {
                return res.status(400).send('Invalid or expired token');
            }

            const user = results[0];

            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).send('Error resetting password');
                }

                conn.query('UPDATE user SET Password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE Id = ?', 
                    [hash, user.Id], (err) => {
                        if (err) {
                            return res.status(500).send('Error updating password');
                        }

                        res.redirect('/login');
                    });
            });
        });
};

// 이메일 전송 함수
exports.sendEmail = (to, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER, // 환경 변수 사용
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) console.error('Error sending email:', err);
        else console.log('Email sent:', info.response);
    });
};

// 회사 목록 가져오기
exports.getCompanies = (callback) => {
    const query = 'SELECT company_name, company_logo FROM company LIMIT 40';
  
    conn.query(query, (err, results) => {
      if (err) {
        return callback(err); // 에러가 있을 경우 에러를 전달
      }
      
      // 쿼리 결과를 배열로 전달 (results가 배열이어야 함)
      if (Array.isArray(results)) {
        callback(null, results); // 성공적으로 쿼리 결과 전달
      } else {
        callback(new Error("Query result is not iterable")); // 쿼리 결과가 배열이 아닌 경우 처리
      }
    });
};

exports.addFavorite = (req, res) => {
    const userId = req.session.user.Id; // 세션에서 사용자 ID 가져오기
    const companyName = req.body.companyName;

    // 먼저 사용자가 해당 회사를 좋아요 했는지 확인
    conn.query('SELECT * FROM `like` WHERE user_id = ? AND company_name = ?', [userId, companyName], (err, results) => {
        if (err) {
            console.error('Database error: ', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        const isLiked = results.length > 0; // 이미 좋아요한 경우

        const query = isLiked
            ? 'DELETE FROM `like` WHERE user_id = ? AND company_name = ?' // 좋아요 제거
            : 'INSERT INTO `like` (user_id, company_name) VALUES (?, ?)' // 좋아요 추가

        const params = isLiked ? [userId, companyName] : [userId, companyName];

        // 쿼리 실행
        conn.query(query, params, (err) => {
            if (err) {
                console.error('Database error: ', err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            // 성공적으로 추가되거나 제거된 경우
            const actionMessage = isLiked ? 'Favorite removed' : 'Favorite added';
            res.status(200).json({ message: actionMessage });
        });
    });
};

// 프로필 사진 업데이트 (기본 이미지 설정 포함)
exports.updateProfilePicture = (req, res) => {
    const { profilePicture } = req.body;
    
    if (!profilePicture) {
        return res.status(400).send('No profile picture provided');
    }

    // DB 업데이트
    const sql = 'UPDATE user SET profile_picture = ? WHERE Id = ?';
    const params = [profilePicture, req.session.user.Id];

    conn.query(sql, params, (err) => {
        if (err) {
            return res.status(500).send('Error updating profile picture');
        }
        
        // 세션에 새 프로필 이미지 정보 업데이트
        req.session.user.profilePicture = profilePicture;
        res.json({ success: true });
    });
};

// 파일 업로드 처리
exports.uploadProfilePicture = (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send('No file uploaded');
    }

    const sql = 'UPDATE user SET profile_picture = ? WHERE Id = ?';
    const params = [file.filename, req.session.user.Id];

    conn.query(sql, params, (err) => {
        if (err) {
            return res.status(500).send('Error updating profile picture');
        }

        // 세션에 프로필 이미지 정보 업데이트
        req.session.user.profilePicture = file.filename;
        res.redirect('/mypage');
    });
};

exports.getLikedCompanies = (userId, callback) => {
    const query = 'SELECT company_name FROM `like` WHERE user_id = ?';
    
    conn.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Database query error: ", err); // 에러 로그
            return callback(err, null);
        }
        console.log("Query Results: ", results); // 쿼리 결과 로그
        
        // 결과가 없을 경우 빈 배열로 처리
        const likedCompanies = results.length > 0 ? results.map(row => row.company_name) : [];
        console.log("Liked Companies: ", likedCompanies); // 디버깅을 위한 로그
        
        callback(null, likedCompanies);
    });
};

exports.getLikedCompaniesWithArticles = (userId, companies, callback) => {
    
    // companies가 배열이 아닌 경우 배열로 처리
    if (!Array.isArray(companies)) {
        companies = [companies]; // 단일 값일 경우 배열로 감싸기
    }

    // companies 배열이 비어 있지 않은지 확인
    if (companies.length === 0) {
        return callback(null, []); // 빈 배열을 바로 반환
    }

    // companies의 모든 요소가 문자열인지 확인
    if (companies.some(company => typeof company !== 'string')) {
        return callback(new Error("All companies must be strings"), null);
    }

    // IN 절에서 사용할 회사명을 콤마로 구분된 문자열로 변환
    const placeholders = companies.map(() => '?').join(', '); // 예: ?, ?, ?

    const query = `
        SELECT c.company_name, c.company_logo, f.Title, f.Url, f.Contents 
        FROM \`like\` l 
        JOIN company c ON c.company_name = l.company_name 
        LEFT JOIN financial_news f ON (f.Title LIKE CONCAT('%', c.company_name, '%') 
        OR f.Contents LIKE CONCAT('%', c.company_name, '%')) 
        WHERE l.user_id = ? AND l.company_name IN (${placeholders})`; // 회사명 리스트를 IN 절에 맞게 확장
    // MySQL은 배열 자체를 바로 처리하지 못하므로, 각 회사명을 콤마로 구분된 리스트로 전달해야 함


    const queryParams = [userId, ...companies]; // userId와 회사명 리스트를 함께 전달

    conn.query(query, queryParams, (err, results) => {
        if (err) {
            console.error("Database query error: ", err);
            return callback(err, null);
        }

        // 데이터 처리: 회사별로 기사 배열을 묶기
        const companiesWithArticles = [];
        results.forEach(row => {
            let company = companiesWithArticles.find(c => c.company_name === row.company_name);

            if (!company) {
                company = {
                    company_name: row.company_name,
                    company_logo: row.company_logo,
                    articles: []
                };
                companiesWithArticles.push(company);
            }

             // row.Contents가 null 또는 undefined인 경우 기본값으로 빈 문자열 처리
             const contentText = row.Contents !== null && row.Contents !== undefined ? row.Contents.toString() : '';
           
            const articleExists = company.articles.some(article => article.Title === row.Title);
            if (!articleExists) {
                company.articles.push({
                    Title: row.Title,
                    Url: row.Url,
                    // Contents가 null인 경우를 체크하여 처리
                    Contents: row.Contents && row.Contents.length > 160 ? row.Contents.substring(0, 160) + '...' : contentText
                });
            }
        });
        callback(null, companiesWithArticles);
    });
};


// 좋아요를 누른 회사 목록을 가져온 후 회사 로고를 조회하는 함수
exports.getCompanyLogos = (userId, callback) => {
    // 좋아요 누른 회사 목록을 먼저 가져옴
    exports.getLikedCompanies(userId, (err, likedCompanies) => {
        if (err) {
            return callback(err, null);  // 오류 처리
        }

        if (likedCompanies.length === 0) {
            // 좋아요 누른 회사가 없을 경우 빈 배열 반환
            return callback(null, []);
        }

        // 좋아요 누른 회사 이름에 맞는 로고 조회
        const query = 'SELECT company_name, company_logo FROM company WHERE company_name IN (?)';
        
        conn.query(query, [likedCompanies], (err, results) => {
            if (err) {
                console.error("Database query error: ", err);  // 오류 로그
                return callback(err, null);
            }

            console.log("Company Logos: ", results);  // 쿼리 결과 로그
            callback(null, results);  // 회사 로고 정보 반환
        });
    });
};

// 대시보드 페이지를 렌더링하는 함수
exports.renderDashboard = (req, res) => {
    const userId = req.session.user.id; // 세션에서 사용자 ID 가져오기
    console.log("User ID: ", userId); // 디버깅을 위한 로그
    getLikedCompanies(userId, (err, likedCompanies) => {
        if (err) {
            return res.status(500).send(err);
        }
        console.log("Rendering dashboard with liked companies: ", likedCompanies); // 디버깅을 위한 로그
        res.render('dashboard', { likedCompanies });
    });
};

// 좋아요를 누른 회사 목록을 가져온 후 회사의 월별 sentiment값을 조회하는 함수
exports.getMonthlySentiment = (userId, callback) => {
    // 좋아요를 누른 회사 목록 조회
    exports.getLikedCompanies(userId, (err, likedCompanies) => {
        if (err) {
            return callback(err, null); // 오류 처리
        }

        if (likedCompanies.length === 0) {
            // 좋아요를 누른 회사가 없을 경우 빈 데이터를 반환
            const defaultData = [{
                company_name: "관심 종목을 설정해주세요",
                monthly_data: Array(12).fill(0) // 12개월 동안 sentiment 값 0
            }];
            return callback(null, defaultData);
        }

        // 좋아요 누른 회사의 월별 sentiment 데이터 조회
        const query = `
            SELECT company_name, month, month_sentiment 
            FROM monthly_sentiment 
            WHERE company_name IN (?) 
            ORDER BY company_name, month ASC
        `;

        conn.query(query, [likedCompanies], (err, monthlyData) => {
            if (err) {
                console.error("Database query failed:", err.message);
                return callback(err, null);
            }

            // 데이터 형식 정리
            const result = likedCompanies.map(companyName => {
                const companyMonthlyData = monthlyData.filter(data => data.company_name === companyName);
                const monthlyDataFormatted = Array(12).fill(0); // 1월부터 12월 기본값 0
                companyMonthlyData.forEach(data => {
                    monthlyDataFormatted[data.month - 1] = data.month_sentiment;
                });
                return { company_name: companyName, monthly_data: monthlyDataFormatted };
            });

            callback(null, result);
        });
    });
};
