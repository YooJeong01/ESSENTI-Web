// 초기 테마 로드
if (localStorage.getItem("theme") === "dark") {
    document.documentElement.classList.add("dark");
} else {
    document.documentElement.classList.remove("dark");
}

// 테마 전환 버튼 이벤트
const darkTheme = document.getElementById("darkTheme");
if (darkTheme) {
    darkTheme.addEventListener("click", () => {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
    });
}

const lightTheme = document.getElementById("lightTheme");
if (lightTheme) {
    lightTheme.addEventListener("click", () => {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
    });
}

