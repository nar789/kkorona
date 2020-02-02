from bs4 import BeautifulSoup
import requests
import re
import pandas as pd
import json
from dataclasses import dataclass

title_text=[]
link_text=[]
source_text=[]
date_text=[]
contents_text=[]
result=[]

@dataclass
class article:
	title: str
	summary: str
	date: str
	source: str
	link: str

#날짜 정제화 함수
def date_cleansing(test):
    try:
        #지난 뉴스
        #머니투데이  10면1단  2018.11.05.  네이버뉴스   보내기  
        pattern = '\d+.(\d+).(\d+).'  #정규표현식 
    
        r = re.compile(pattern)
        match = r.search(test).group(0)  # 2018.11.05.
        date_text.append(match)
        
    except AttributeError:
        #최근 뉴스
        #이데일리  1시간 전  네이버뉴스   보내기  
        pattern = '\w* (\d\w*)'     #정규표현식 
        
        r = re.compile(pattern)
        match = r.search(test).group(1)
        date_text.append(match)


#내용 정제화 함수 
def summary_cleansing(contents):
    first_cleansing_contents = re.sub('<dl>.*?</a> </div> </dd> <dd>', '', 
                                      str(contents)).strip()  #앞에 필요없는 부분 제거
    second_cleansing_contents = re.sub('<ul class="relation_lst">.*?</dd>', '', 
                                       first_cleansing_contents).strip()#뒤에 필요없는 부분 제거 (새끼 기사)
    third_cleansing_contents = re.sub('<.+?>', '', second_cleansing_contents).strip()
    contents_text.append(third_cleansing_contents)
    #print(contents_text)

def crawler():
	url = "https://search.naver.com/search.naver?where=news&query=" + "신종 코로나" + "&sort=0" + "&nso=so%3Ar%2Cp%3Aall%2Ca%3Aall&mynews=0&refresh_start=0&related=0"

	response = requests.get(url)
	html = response.text

	soup = BeautifulSoup(html, 'html.parser')

	atags = soup.select('._sp_each_title')
	for tag in atags:
		title_text.append(tag.text)
		link_text.append(tag['href'])

	source_list = soup.select('._sp_each_source')
	for source in source_list:
		source_text.append(source.text)

	date_list = soup.select('.txt_inline')
	for date in date_list:
		date_arg = date.text
		date_cleansing(date_arg)

	summary_list = soup.select('ul.type01 dl')
	for summary in summary_list:
		summary_cleansing(summary)

	for idx in range(len(title_text)):
		result.append(article(title_text[idx], contents_text[idx], date_text[idx], source_text[idx], link_text[idx]))

	# result= {"date" : date_text , "title":title_text , "source" : source_text ,"contents": contents_text ,"link":link_text }
	json_result = json.dumps(result, ensure_ascii = False, default = lambda x: x.__dict__)
	return json_result


def main():
	result = crawler()
	print(result)

main()