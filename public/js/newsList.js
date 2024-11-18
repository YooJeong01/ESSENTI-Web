window.addEventListener('load', () => fetchNews());

function reload() {
    window.location.reload();
}

// fetchNews 함수 수정
async function fetchNews(sentiment = null) {
    try {
        const response = await fetch('/articles');
        const articles = await response.json();
        
        // sentiment 값에 따라 필터링
        const filteredArticles = sentiment !== null ? articles.filter(article => article.sentiment === sentiment) : articles;
        
        bindData(filteredArticles);
    } catch (error) {
        console.error('Error fetching news:', error);
    }
}

async function fetchSummary(articleId) {
    try {
        const response = await fetch(`/article-summary/${articleId}`);
        const { summary } = await response.json();
        return summary || "none"; // Summary가 없으면 "none" 반환
    } catch (error) {
        console.error('Error fetching article summary:', error);
        return "none"; // 에러 발생 시에도 "none" 반환
    }
}

// bindData 함수는 변경 없음
function bindData(articles) {
    const cardsContainer = document.getElementById('cards-container');
    const newsCardTemplate = document.getElementById('template-news-card');

    cardsContainer.innerHTML = "";

    articles.forEach(article => {
        const cardClone = newsCardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);
        cardsContainer.appendChild(cardClone);
    });
}

// fillDataInCard 함수는 변경 없음
function fillDataInCard(cardClone, article) {
    const newsSentimental = cardClone.querySelector("#news-sentimental");
    const newsImg = cardClone.querySelector('#news-img');
    const newsTitle = cardClone.querySelector('#news-title');
    const newsSource = cardClone.querySelector('#news-source');
    const newsSummary = cardClone.querySelector('#summaryContent');
    const newsIndexSentimental = cardClone.querySelector('#indexSentimental');
    const viewSummary = cardClone.querySelector('#view-summary');
    const summaryPopup = cardClone.querySelector('#summaryPopup');

    // sentiment 값에 따라 HTML 내용을 설정
    switch (article.sentiment) {
        case 0:
            newsSentimental.innerHTML = "중립";
            newsSentimental.className = 'sentiment-neutral';
            newsIndexSentimental.className= 'indexNeutral';
            newsIndexSentimental.innerHTML = "Neutral";
            break;
        case 1:
            newsSentimental.innerHTML = "부정";
            newsSentimental.className = 'sentiment-negative';
            newsIndexSentimental.className= 'indexNegative';
            newsIndexSentimental.innerHTML = "Negative";
            break;
        case 2:
            newsSentimental.innerHTML = "긍정";
            newsSentimental.className = 'sentiment-positive';
            newsIndexSentimental.className= 'indexPositive';
            newsIndexSentimental.innerHTML = "Positive";
            break;
        default:
            newsSentimental.innerHTML = "none";
            newsSentimental.className = '';
            newsIndexSentimental.className= '';
            newsIndexSentimental.innerHTML = "none";
            break;
    }
    newsImg.src = article.Image;
    newsImg.onload = function() {
        if (!newsImg.src || newsImg.src === null || newsImg.src === undefined || newsImg.src === '') {
            // 이미지가 없을 경우 기본 이미지로 설정
            newsImg.src = '/images/placeholder.png';  // 대체 이미지 경로
        }
    }
    newsImg.onerror = function() {
        newsImg.src= '/images/placeholder.png';
    }
    newsTitle.innerHTML = article.Title;

    const date = new Date(article.Wdate).toLocaleString("kor");
    newsSource.innerHTML = `${article.Press} · ${date}`;


    // #view-summary hover 시 요약 표시
    viewSummary.addEventListener('mouseenter', async () => {
        const summary = article.Summary;
        newsSummary.innerHTML = summary;
        if (!newsSummary.innerHTML || newsSummary.innerHTML === 'null' || newsSummary.innerHTML === 'undefined' || newsSummary.innerHTML === '') {
            newsSummary.innerHTML = "None";  // 대체 문구로 설정
        }
        summaryPopup.style.display = 'block'; // Summary 보이기
    });

    // #view-summary hover 시 요약 숨기기
    viewSummary.addEventListener('mouseleave', () => {
        summaryPopup.style.display = 'none'; // Summary 숨기기
    });

    cardClone.firstElementChild.addEventListener("click", ()  => {
        window.open(article.Url, "_blank");
    });
}

let curSelectedNav = null;

// onNavItemClick 함수 수정
function onNavItemClick(id) {
    let sentiment;
    switch (id) {
        case 'Positive':
            sentiment = 2; // 긍정
            break;
        case 'Negative':
            sentiment = 1; // 부정
            break;
        case 'Neutral':
            sentiment = 0; // 중립
            break;
        default:
            sentiment = null; // 모든 기사
            break;
    }

    if (sentiment === null) {
        // 필터링을 하지 않거나 기본값을 설정
        fetchNews(null);
    } else {
        fetchNews(sentiment);
    }
    // fetchNews(sentiment);
    const navItem = document.getElementById(id);
    if (curSelectedNav) curSelectedNav.classList.remove('active');
    curSelectedNav = navItem;
    curSelectedNav.classList.add('active');
}

const searchButton = document.getElementById('search-button');
const searchText = document.getElementById('search-text');

searchButton.addEventListener('click', async () => {
    const query = searchText.value;
    if (!query) return;  // 검색어가 없으면 아무 작업도 하지 않음

    try {
        const response = await fetch('/search', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ searchQuery: query })  // 검색어를 JSON 형태로 서버로 전송
        });

        const articles = await response.json();  // 서버에서 받은 검색 결과

        // 검색된 기사들을 화면에 바인딩
        bindData(articles);
    } catch (error) {
        console.error('Error searching articles:', error);
    }
});

// 목표 : mysql에 저장한 데이터를 불러오는 방식으로 바꾸기
// html에 나타내기


// sql문은 js를 직접 실행해야 결과가 나오고
// 밑의 DOM 객체를 사용하는 js문은 html을 실행했을때 나오는지 확인해야함
// 즉  따로 만들어야 하는가?, sql문의 bindData(articles)넘겨주는걸로 받아와서
// 받아온 결과를 다른 js파일에서 밑의 과정을 수행해야하는가?
// 결국엔 express를 원활하게 쓰기위해 ejs를 사용해야한다..































// function bindData(articles) {
//     console.log(articles[0].Title);
//     const cardsContainer = document.getElementById('cards-container');
//     const newsCardTemplate = document.getElementById('template-news-card');

//     cardsContainer.innerHTML = "";

//     articles.forEach(article => {
//         // if (!article.urlToImage) return; // 이미지가 없으면 생략하는 로직 (주석처리)
//         //const cardClone = newsCardTemplate.content.cloneNode(true);
//         //fillDataInCard(cardClone, article);
//         //cardsContainer.appendChild(cardClone);      
//         console.log(article.Press);

//     });
// }



// // 가져온 기사들의 해당하는 이미지, 제목, 내용, 날짜 등을 innerHTML로 넣어줌
// function fillDataInCard(cardClone, article) {
//     //const newsImg = cardClone.querySelector('#news-img');
//     const newsTitle = cardClone.querySelector('#news-title');
//     const newsSource = cardClone.querySelector('#news-source');
//     const newsDesc = cardClone.querySelector('#news-desc');

//     //newsImg.src = article.urlToImage;
//     newsTitle.innerHTML = article.Title;
//     newsDesc.innerHTML = article.Summary;

//     const date = new Date(article.Wdate).toLocaleString("kor");

//     newsSource.innerHTML = `${article.Press} · ${date}`;

//     cardClone.firstElementChild.addEventListener("click", ()  => {
//         window.open(article.Url, "_blank");
//     })
// }
 




// conn.query('select Number, Press, Wdate, Url, Title from naver_news where Number < 11', function (err, results, fields) {
//     if (err) {
//         console.error(err); // 오류 발생 시 콘솔에 출력
//         return;
//     }   
//     console.log(results); // 전체 결과를 출력해 구조 확인

//     if (results.length > 0) {
//         for (i=0; i<results.length; i++) {
//             Id = results[i].Number;
//             Press = results[i].Press;
//             Wdate = results[i].Wdate;
//             Url = results[i].Url;
//             Title = results[i].Title;
//             console.log(Id, Press, Wdate, Url, Title);
//             console.log(typeof Id)
//             // db에서 가져온 데이터를 리스트에 저장해서 하나씩 꺼내서 사용하거나?
//             // 가져온 데이터를 따로 저장하지 않고 바로 객체 생성하는 방식?
//             // 둘 다 안되면,, 생활코딩 코드로 다시 응용
//         }
//     } else {
//         console.log("No results found");
//     }
// });
