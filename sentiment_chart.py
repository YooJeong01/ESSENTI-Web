# 감정분석 종목별 그래프 값 계산하는 파일

import pymysql
import re
from datetime import datetime

# Database connection
conn = pymysql.connect(
    host="localhost",
    user="root",
    password="0000",
    database="capstone",
)
cursor = conn.cursor()

# Step 1: Fetch financial_news data
query = "SELECT Title, Contents, Sentiment, Wdate FROM financial_news"
cursor.execute(query)
news_data = cursor.fetchall()

# Step 2: Define the list of companies
companies = ["HD한국조선해양", "HD현대중공업", "HMM" , "KB금융", "NAVER",
             "KT&G", "LG", "LG에너지솔루션", "LG전자", "LG화학",
             "POSCO홀딩스", "SK이노베이션", "SK텔레콤", "SK하이닉스", "고려아연",
             "기아", "두산에너빌리티", "메리츠금융지주", "삼성SDI", "삼성물산", 
             "삼성바이오로직스", "삼성생명", "삼성전자", "삼성전자우", "삼성화재",
             "셀트리온", "신한지주", "알테오젠", "에코프로", "에코프로비엠",
             "우리금융지주", "유한양행", "카카오", "크래프톤", "포스코퓨처엠",
             "하나금융지주", "한국전력", "한화에어로스페이스", "현대모비스", "현대차"
             ]

# Step 3: Calculate sentiment scores
results = []

for company in companies:
    monthly_sentiment = {}
    # Create a regex pattern to match the company name with or without spaces, case-insensitively
    company_pattern = re.compile(rf"{re.escape(company).replace(' ', r'\s*')}", re.IGNORECASE)

    for row in news_data:
        title, contents, sentiment, wdate = row
        year = wdate.year
        month = wdate.month

        # Check if the company name matches in Title or Contents
        if company_pattern.search(title) or company_pattern.search(contents):
            score = 1 if sentiment == "positive" else -1 if sentiment == "negative" else 0
            if (year, month) not in monthly_sentiment:
                monthly_sentiment[(year, month)] = 0
            monthly_sentiment[(year, month)] += score

    for (year, month), sentiment_score in monthly_sentiment.items():
        results.append((company, year, month, sentiment_score))

# Step 4: Insert the results into the database
insert_query = """
INSERT INTO monthly_sentiment (company_name, year, month, month_sentiment)
VALUES (%s, %s, %s, %s)
"""
cursor.executemany(insert_query, results)
conn.commit()

print("Monthly sentiment scores inserted successfully!")
cursor.close()
conn.close()
