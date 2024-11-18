document.addEventListener('DOMContentLoaded', function() {
    const setDefaultBtn = document.getElementById('setDefaultBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadForm = document.getElementById('uploadForm');
    const inputFile = document.getElementById('input-file');
    const closePopup = document.getElementById('closePopup');
    const profileImage = document.getElementById('profileImage'); // 프로필 이미지 DOM 선택
    const sidenavProfileImage = document.querySelector('.admin-profile img'); // sidenav 프로필 이미지
    const upload = document.getElementById('upload');
    const uploadOptionPopup = document.getElementById('uploadOptionPopup');

    upload.addEventListener('click', () => {
        uploadOptionPopup.style.display = 'flex';
    });

    // 기본 이미지 설정
    setDefaultBtn.addEventListener('click', function() {
        // 프로필 이미지를 default로 설정
        profileImage.src = '/uploads/default.png';
        sidenavProfileImage.src = '/uploads/default.png';

        // 서버에 기본 이미지로 업데이트 요청
        fetch('/updateProfilePicture', {
            method: 'POST',
            body: JSON.stringify({ profilePicture: 'default.png' }),
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            // 서버 응답에서 프로필 이미지 변경
            if (data.success) {
                // sidenav 프로필 이미지와 mypage 프로필 이미지를 업데이트
                sidenavProfileImage.src = '/uploads/default.png';
                profileImage.src = '/uploads/default.png';
                uploadOptionPopup.style.display = 'none';
                alert('프로필 이미지가 기본 이미지로 설정되었습니다.');
            }
        })

        .catch(error => {
            uploadOptionPopup.style.display = 'none';
            alert('이미지 설정에 실패했습니다.');
        });
    });

    // 파일 선택 시 업로드 폼 보여주기
    uploadBtn.addEventListener('click', function() {
        inputFile.click();  // 파일 입력창 열기
    });

    // 파일이 선택되면 폼 제출
    inputFile.addEventListener('change', function() {
        if (inputFile.files.length > 0) {
            uploadForm.submit();  // 파일을 서버에 업로드
        }
        uploadOptionPopup.style.display = 'none';
    });

    closePopup.addEventListener('click',function() {
        uploadOptionPopup.style.display = 'none';
    })
});