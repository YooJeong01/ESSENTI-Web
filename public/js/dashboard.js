document.addEventListener("DOMContentLoaded", function() {
  let primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--main-color-highlight")
      .trim();

  let labelColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--text-color")
      .trim();

  let fontFamily = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-family")
      .trim();

  const companyData = {
      samsung: [30, 45, 35, 50, 49, 60],
      skhynix: [25, 30, 40, 60, 75, 80]
  };

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
          y: { formatter: (value) => `${value}k` }
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
          categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
      },
  };

  let chart;

  function renderChart(data) {
      const options = {
          ...defaultOptions,
          series: [{ name: "Stocks", data: data }]
      };

      if (chart) {
          chart.destroy(); // 기존 차트 제거
      }

      chart = new ApexCharts(document.querySelector(".chart-area"), options);
      chart.render().catch(err => console.error(`차트 렌더링 오류: ${err}`));
  }

  // 초기 차트 렌더링
  renderChart(companyData.samsung); // 기본적으로 삼성전자 차트 렌더링

  // 드롭다운 선택 시 차트 업데이트
  const selectElement = document.getElementById("companySelect");
  selectElement.addEventListener("change", function() {
      const selectedCompany = this.value;
      const data = companyData[selectedCompany];

      // 데이터가 없으면 오류 메시지 출력
      if (!data || !Array.isArray(data)) {
          console.error(`데이터가 없습니다: ${selectedCompany}`);
          return;
      }

      console.log(`선택한 회사: ${selectedCompany}, 데이터: ${data}`);
      renderChart(data); // 회사에 맞는 데이터로 차트 업데이트
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