document.addEventListener("DOMContentLoaded", async function() {
    const metaTag = document.querySelector('meta[name="user-id"]');

    if (!metaTag) {
        console.error("meta[name='user-id'] 태그가 존재하지 않습니다.");
        return;
    }
  
    let primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--main-color-highlight")
      .trim();

  let labelColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--text-color")
      .trim();

  let fontFamily = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-family")
      .trim();

  const defaultOptions = {
      chart: {
          type: 'area',
          toolbar: { show: false },
          zoom: { enabled: false },
          width: "100%",
          height: 270,
          offsetY: 18,
      },
      dataLabels: { enabled: false },
      tooltip: {
          enabled: true,
          style: { fontFamily: fontFamily },
          y: { formatter: (value) => `${value}` }
      },
      colors: [primaryColor],
      fill: {
          type: 'gradient',
          gradient: {
              type: 'vertical',
              opacityFrom: 1,
              opacityTo: 0,
              stops: [0, 100],
              colorStops: [
                  { offset: 0, opacity: 0.2, color: "#ffffff" },
                  { offset: 100, opacity: 0, color: "#ffffff" }
              ],
          },
      },
      stroke: { colors: [primaryColor], lineCap: 'round' },
      grid: {
          borderColor: "rgba(0, 0, 0, 0)",
          padding: { top: -30, right: 0, bottom: -8, left: 12 },
      },
      markers: { strokeColors: primaryColor },
      yaxis: { show: false },
      xaxis: {
          labels: { show: true, floating: true, style: { colors: labelColor, fontFamily: fontFamily } },
          axisBorder: { show: false },
          crosshairs: { show: false },
          categories: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]
      },
    };

    let chart;

    const userId = metaTag.content;
    console.log("Request User ID: ", userId);
     // 좋아요한 회사 및 월별 데이터 가져오기
    async function fetchLikedCompaniesMonthly() {
        try {
            const response = await fetch(`/liked-companies-monthData/${userId}`);
            if (!response.ok) throw new Error("데이터를 가져오지 못했습니다.");
            return await response.json();
        } catch (err) {
            console.error(`데이터 가져오기 실패: ${err.message}`);
            return null;
        }
    }

    // 차트 렌더링
    function renderChart(data) {
        const options = {
            ...defaultOptions,
            series: [{ name: "Sentiment", data: data }]
        };

        if (chart) {
            chart.destroy(); // 기존 차트 제거
        }

        chart = new ApexCharts(document.querySelector(".chart-area"), options);
        chart.render().catch(err => console.error(`차트 렌더링 오류: ${err}`));
    }

    // 데이터 초기화
    const companyData = await fetchLikedCompaniesMonthly();

    if (!companyData || companyData.length === 0) {
        console.error("데이터가 비어 있습니다. 기본 데이터를 사용합니다.");
        renderChart(Array(12).fill(0)); // 모든 월을 0으로 렌더링
        return;
    }

    // 드롭다운에 회사 목록 추가
    const selectElement = document.getElementById("companySelect");
    companyData.forEach(company => {
        const option = document.createElement("option");
        option.value = company.company_name;
        option.textContent = company.company_name;
        selectElement.appendChild(option);
    });

    // 기본 회사 데이터 차트 렌더링
    const defaultCompany = companyData[0];
    selectElement.value = defaultCompany.company_name;
    renderChart(defaultCompany.monthly_data);

    // 선택된 회사 차트 업데이트
    selectElement.addEventListener("change", function () {
        const selectedCompany = companyData.find(company => company.company_name === this.value);
        renderChart(selectedCompany ? selectedCompany.monthly_data : Array(12).fill(0));
    });
});

// 카드 슬라이드
// 모든 버튼 요소 선택
const hearts = document.querySelectorAll(".favorite-icon-btn");
hearts.forEach(heart => {
    const heartEmpty = heart.querySelector(".likeImg");
    const companyName = heartEmpty.getAttribute("alt");

    // likedCompanies 배열에서 현재 회사 이름이 있는지 확인하여 activeClass 추가
    if (likedCompanies.includes(companyName)) {
        heart.classList.add("active");
        heartEmpty.src = "/images/heartFill.png";  // 좋아요된 상태의 이미지를 설정
    }

    // 좋아요 버튼 클릭 시 좋아요/취소 동작
    heart.addEventListener('click', function() {
        const activeClass = "active";
        const isLiked = heart.classList.toggle(activeClass);  // 좋아요 상태를 토글
        heartEmpty.src = isLiked ? "/images/heartFill.png" : "/images/heartEmpty.png";

        // userName을 콘솔에 로그 출력하여 확인
        console.log(`user: ${userName}, ${isLiked ? 'Like' : 'Unlike'} ${companyName}`);

        // 서버에 좋아요 상태를 반영하는 요청 보내기
        fetch('/favorite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ companyName, isLiked })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data.message);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});

function updateSwiper(swiper) {
    if (window.innerWidth <= 1120) {
      swiper.params.slidesPerGroup = 3; // 화면이 1120px보다 작아지면 3으로 변경
      swiper.params.slidesPerView = 3; // 필요하면 slidesPerView도 업데이트
    } else {
      swiper.params.slidesPerGroup = 5; // 기본 값으로 복구
      swiper.params.slidesPerView = 5; // 필요하면 slidesPerView도 업데이트
    }
    swiper.update(); // Swiper 업데이트
  }
  
  // 초기화
  var swiper = new Swiper(".mySwiper", {
    slidesPerView: 5,
    spaceBetween: 10,
    slidesPerGroup: 5,
    loop: true,
    loopFillGroupWithBlank: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });
  
  // 초기 화면 크기에 따라 설정
  updateSwiper(swiper);
  
  // 화면 크기 변경 시 업데이트
  window.addEventListener("resize", () => {
    updateSwiper(swiper);
  });

// var swiper = new Swiper(".mySwiper", {
//   slidesPerView: 5,
//   spaceBetween: 10,
//   slidesPerGroup: 5,
//   loop: true,
//   loopFillGroupWithBlank: true,
//   pagination: {
//     el: ".swiper-pagination",
//     clickable: true,
//   },
//   navigation: {
//     nextEl: ".swiper-button-next",
//     prevEl: ".swiper-button-prev",
//   },
// });