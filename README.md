# HCS-tool
[![Language](https://img.shields.io/badge/Language-Node.js-brightgreen?logo=node.js&style=flat-square)](https://nodejs.org/ko)<br>

## 📌필독 사항
 * 교육 목적으로만 사용해주세요.
 * **개인정보를 부당한 수단이나 방법으로 취득**하여 **도용**한 경우`「개인정보 보호법」 제71조`**에 의거 처벌**받을 수 있습니다.
 * 이 프로그램을 사용하여 생긴 법적 책임은 사용한 본인에게 있습니다.

## 📘설명
* 이 프로그램은 자가진단의 취약점을 이용하여 만들어진 프로그램이므로 언제든 막힐 수 있습니다.

## 📗기능
 * 학교 이름으로 학교 코드를 찾아준다
 * 이름과 생년월일로 학교를 찾아준다
 * 이름, 학교, 생년으로 생일을 찾아준다

## 💡만들까 생각중인 것
 * 특정 상대 자가진단 못하게 하기

## 📥사용
> [Node.js](https://nodejs.org/ko/) 다운로드는 필수입니다.
1. 모듈 설치
```
npm install
```
2. 실행
```
node index.js
```

## 🎫라이선스
[GPLv3](https://olis.or.kr/license/Detailselect.do?lId=1072)

## 📢자가진단 개발자 분들께...
빨리 확인하시고 막으시길 바라겠습니다... ㄹㅇㅋㅋ<br> 
-- 이 밑 대충 내가 말하는 공간(?) --<br>
api로 한번에 6000개의 요청을 보내봤는데(그 이상은 클라이언트 문제로 잘 안됨) 아주 잘 되더군요?? 아무런 이상 없이요.<br>
https://hcs.eduro.go.kr/v2/searchSchool?lctnScCode=두글자면됨&schulCrseScCode=아무거나ㄹㅇㅋㅋorgName=학&loginType=school 이렇게 GET 요청 보내도 잘 되던데 무슨 클라이언트에서는 학교 이름 2자 이상 입력하라고 하면서 정작 api에선 안막네요?ㅋㅋㅋㅋㅋㅋ<br>
뭐 나름 searchKey 넣어서 막으려 해보신거 같은데 존나 쉽게 뚫리셨습니다^^<br>
일회용도 아니고 여러번 쓸 수 있는데다가 만료 시간은 2분 ㄷ<br>
{
    addres: "(XXXXX)XXX XXX XXX XXX"
    atptOfcdcConctUrl: "XXXhcs.eduro.go.kr"
    engOrgNm: "."
    insttClsfCode: "X"
    juOrgCode: "XXXXXXXXXX"
    kraOrgNm: "XXXXXX학교"
    lctnScCode: "XX"
    lctnScNm: "XXX"
    mdfcDtm: "XXXX-XX-XX XX:XX:XX.X"
    orgAbrvNm01: "XXX"
    orgCode: "XXXXXXXXXX"
    orgUon: "Y"
    schulKndScCode: "XX"
    sigCode: "XXXXX"
    updid: "SYSTEM"
}<br>
⇡⇡⇡ 뭐 대충 이런식으로 오던데 정보를 처음부터 끝까지 다 주는 것도 문제야 문제 ㅉㅉ<br>
그리고 패스워드 요청 보낼때 페이로드 ㅈㄴ 이상하게 해도 따로 막는거 없이 5분 제한이나 걸고 ㅉ<br>
이정도면 설명 끝난듯?ㄴ