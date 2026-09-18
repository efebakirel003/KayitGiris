import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, push, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const regUsernameInput = document.getElementById("regUsernameInput");
const regPasswordInput = document.getElementById("regPasswordInput");
const regShowPasswordInput = document.getElementById("regShowPasswordInput");
const regPasswordAgainInput = document.getElementById("regPasswordAgainInput");
const regShowPasswordAgainInput = document.getElementById("regShowPasswordAgainInput");
const regSubmitBtn = document.getElementById("regSubmitBtn");
const regRecord = document.getElementById("regRecord");
const logUsernameInput = document.getElementById("logUsernameInput");
const logPasswordInput = document.getElementById("logPasswordInput");
const logShowPasswordInput = document.getElementById("logShowPasswordInput");
const logSubmitBtn = document.getElementById("logSubmitBtn");
const logRecord = document.getElementById("logRecord");
const commentArea = document.getElementById("commentArea");
const charCounter = document.getElementById("charCounter");
const sendCommentBtn = document.getElementById("sendCommentBtn");
const comRecord = document.getElementById("comRecord");
const comInfo = document.getElementById("comInfo");
const hiUserTitle = document.getElementById("hiUserTitle");

const firebaseConfig = {
    apiKey: "AIzaSyBwcx-6NJHV0kt56IXXUoaeQjscReIYpiw",
    authDomain: "kayitgiris-c88cc.firebaseapp.com",
    projectId: "kayitgiris-c88cc",
    storageBucket: "kayitgiris-c88cc.firebasestorage.app",
    messagingSenderId: "51966779253",
    appId: "1:51966779253:web:ce835d09a4068a13a9fd3c",
    measurementId: "G-KS89P4X7K8",
    databaseURL: "https://kayitgiris-c88cc-default-rtdb.firebaseio.com/",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

let isLoggedIn = false;

regShowPasswordInput.addEventListener("change", () => { regShowPasswordInput.checked ? regPasswordInput.type = "text" : regPasswordInput.type = "password"; });
regShowPasswordAgainInput.addEventListener("change", () => { regShowPasswordAgainInput.checked ? regPasswordAgainInput.type = "text" : regPasswordAgainInput.type = "password"; });
logShowPasswordInput.addEventListener("change", () => { logShowPasswordInput.checked ? logPasswordInput.type = "text" : logPasswordInput.type = "password"; });

commentArea.addEventListener("input", () => { charCounter.textContent = `${commentArea.value.length} / 200`; });
sendCommentBtn.addEventListener("click", () => {
    const comment = commentArea.value;
    
    if (comment.length === 0) {
        comRecord.textContent = "Lütfen boş yorum göndermeyin!";
        setTimeout(() => { comRecord.textContent = ""; }, 2000);
        return 0;
    }
    
    signInAnonymously(auth).then(() => {
        const commentsRef = ref(db, "comments");
        sendCommentBtn.disabled = true;
        return push(commentsRef, comment);
    }).then(() => {
        commentArea.value = "";
        comRecord.textContent = "Yorumun için teşekkürler!";
        commentArea.style.display = "none";
        charCounter.style.display = "none";
        sendCommentBtn.style.display = "none";
    }).catch((err) => {
        comRecord.textContent = "Hata: " + err.message;
    }).finally(() => {
        sendCommentBtn.disabled = false;
        comInfo.style.display = "none";
    });
});

regSubmitBtn.addEventListener("click", () => {
    const username = regUsernameInput.value;
    const password = regPasswordInput.value;
    const passwordAgain = regPasswordAgainInput.value;
    
    if (username.length < 4) {
        regRecord.textContent = "Kullanıcı adı 4 karakterden fazla olmalı!";
        setTimeout(() => { regRecord.textContent = ""; }, 2000);
        return;
    }
    if (password.length < 3) {
        regRecord.textContent = "Şifre 3 karakterden fazla olmalı!";
        setTimeout(() => { regRecord.textContent = ""; }, 2000);
        return;
    }
    if (passwordAgain.length < 3) {
        regRecord.textContent = "Tekrar şifre 3 karakterden fazla olmalı!";
        setTimeout(() => { regRecord.textContent = ""; }, 2000);
        return;
    }
    if (password !== passwordAgain) {
        regRecord.textContent = "Girilen şifreler uyuşmuyor!";
        setTimeout(() => { regRecord.textContent = ""; }, 2000);
        return;
    }
    
    regRecord.textContent = "Kontrol ediliyor...";
    const accountsRef = ref(db, "account");
    
    get(accountsRef).then((snapshot) => {
        let isExist = false;
        
        if (snapshot.exists()) {
            const accounts = snapshot.val();
            for (let id in accounts) {
                if (accounts[id].username === username) {
                    isExist = true;
                    break;
                }
            }
        }
        
        if (isExist) {
            regSubmitBtn.disabled = false;
            regRecord.textContent = "Bu kullanıcı adı zaten alınmış!";
            setTimeout(() => { regRecord.textContent = ""; }, 2000);
            return;
        }
        
        signInAnonymously(auth).then(() => {
            regSubmitBtn.disabled = true;
            return push(accountsRef, {
                username: username,
                password: password,
                createdAt: Date.now()
            });
        }).then(() => {
            remakeHUTitle(username);
            regUsernameInput.value = "";
            regPasswordInput.value = "";
            regPasswordAgainInput.value = "";
            regRecord.textContent = "Başarıyla kayıt olundu!";
            window.location.hash = "#commentMenu";
        }).catch((err) => {
            regRecord.textContent = "Hata: " + err.message;
        }).finally(() => {
            setTimeout(() => { regRecord.textContent = ""; regSubmitBtn.disabled = false; }, 2000);
        });
    }).catch((err) => {
        regRecord.textContent = "Hata: " + err.message;
    });
});

logSubmitBtn.addEventListener("click", () => {
    const username = logUsernameInput.value;
    const password = logPasswordInput.value;
    
    if (username.length < 4) {
        logRecord.textContent = "Kullanıcı adı 4 karakterden fazla olmalı!";
        setTimeout(() => { logRecord.textContent = ""; }, 2000);
        return;
    }
    if (password.length < 3) {
        logRecord.textContent = "Şifre 3 karakterden fazla olmalı!";
        setTimeout(() => { logRecord.textContent = ""; }, 2000);
        return;
    }
    
    logRecord.textContent = "Kontrol ediliyor...";
    logSubmitBtn.disabled = true;
    const accountsRef = ref(db, "account");
    
    get(accountsRef).then((snapshot) => {
        let isExist = false;
        let matchedUser = null;
        
        if (snapshot.exists()) {
            const accounts = snapshot.val();
            for (let id in accounts) {
                if (accounts[id].username === username) {
                    isExist = true;
                    matchedUser = accounts[id];
                    break;
                }
            }
        }
        
        if (!isExist) {
            logRecord.textContent = "Böyle bir hesap bulunamadı!";
            setTimeout(() => { logRecord.textContent = ""; }, 2000);
            return 0;
        }
        
        if (matchedUser.password !== password) {
            logRecord.textContent = "Şifre doğru değil!";
            setTimeout(() => { logRecord.textContent = ""; }, 2000);
            return 0;
        }
        
        remakeHUTitle(username);
        logRecord.textContent = "Başarıyla giriş yapıldı!";
        window.location.hash = "#commentMenu";
        isLoggedIn = true;
    }).catch((err) => {
        logRecord.textContent = "Hata: " + err.message;
    }).finally((err) => {
        setTimeout(() => { logRecord.textContent = ""; }, 2000);
        logSubmitBtn.disabled = false;
    });
});

function remakeHUTitle(username) {
    isLoggedIn = true;
    hiUserTitle.textContent = "Selam, " + username + "!";
}

function checkAccess() {
    if (!isLoggedIn && window.location.hash === "#commentMenu") {
        alert("Lütfen önce kayıt olun veya giriş yapın!");
        window.location.hash = "#login";
    }
}

window.addEventListener("hashchange", checkAccess);
window.addEventListener("load", checkAccess);