// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDocSybKTZ9k0bdKdmFONuunQ_TZfCpUiQ",
    authDomain: "senti-d553b.firebaseapp.com",
    projectId: "senti-d553b",
    storageBucket: "senti-d553b.appspot.com",
    messagingSenderId: "407814694923",
    appId: "1:407814694923:web:e7a3c574e412247a837f0e",
    measurementId: "G-6WFY40RDNE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

document.getElementById('signUpBtn').addEventListener('click', (event) => {
    event.preventDefault()
    const signUpemail = document.getElementById('signUpId').value
    const signUppassword = document.getElementById('signUpPw').value

    createUserWithEmailAndPassword(auth, signUpemail, signUppassword)
        .then((userCredential) => {
            console.log(userCredential)
            // Signed in 
            const user = userCredential.user;
            // ...
        })
        .catch((error) => {
            console.log('error')
            const errorCode = error.code;
            const errorMessage = error.message;
            // ..
        });
    })

document.getElementById('signInBtn').addEventListener('click', (event) => {
    event.preventDefault()
    const signInEmail = document.getElementById('signInId').value
    const signInPassword = document.getElementById('signInPw').value
    signInWithEmailAndPassword(auth, signInEmail, signInPassword)
        .then((userCredential) => {
            // Signed in
            console.log(userCredential)
            const user = userCredential.user;
            window.open
            // ...
        })
        .catch((error) => {
            console.log("로그인실패")
            const errorCode = error.code;
            const errorMessage = error.message;
        });

})


// 구글 로그인 
import { getRedirectResult, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
provider.setCustomParameters({
    'login_hint': 'user@example.com'
});
document.getElementById('signInGoogleBtn').addEventListener('click', (event) => {
    event.preventDefault()
    // 구글 인증 기능 추가
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("구글 로그인 완료")
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            // ...
        }).catch((error) => {
            console.log("구글 로그인 실패")
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
        });
})
document.getElementById('signOutGoogleBtn').addEventListener('click', (event) => {
    event.preventDefault()
    // 구글 인증 기능 추가
    signOut(auth).then(() => {
        console.log("구글 아이디 로그아웃 성공")
        // Sign-out successful.
    }).catch((error) => {
        // An error happened.
        console.log("구글 아이디 로그아웃 실패")
    });
})


console.log('hello world')
console.log(app)