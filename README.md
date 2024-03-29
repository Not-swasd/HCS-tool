# HCS-tool
[![Language](https://img.shields.io/badge/Language-Node.js-brightgreen?logo=node.js&style=flat-square)](https://nodejs.org/ko)<br>
test

## getSchool과 getBirthday에 관하여 (버전 1.9.17 패치)
자가진단측의 패치로 인해 더 이상 사용할 수 없게 되었습니다.<br>
사실 뚫을 방법이 있지만 원래 방법보다 6배나 느리고 한국 프록시가 아주 많이 필요하기 때문에 사실상 불가능합니다.<br>
패치 내용(테스트로 알아낸 사실):
1. 같은 아이피로 짧은 시간 내 여러 번의 /findUser 리퀘스트를 보냈을 때, "수요가 높아 이용에 제한이 있다"라는 내용으로 속도 제한(Rate Limit)을 먹게 됩니다.
2. 유저가 존재하고 비번이 틀릴 때와 유저가 존재하지 않을 때 리스폰스가 똑같아 해당 취약점은 더 이상 작동하지 않습니다.   

곧 다른 기능들로 돌아오겠습니다

## 📌필독 사항
 * **제발 사용 헤더 읽고 해보세요 프로그램 오류 외 이슈는 아무 댓글 없이 이슈 닫을게요**
 * 학습 목적으로만 사용해주세요.
 * **개인정보를 부당한 수단이나 방법으로 취득**하여 **도용**한 경우`「개인정보 보호법」 제71조`**에 의거 처벌**받을 수 있습니다.
 * 이 프로그램을 사용하여 생긴 법적 책임은 사용한 본인에게 있습니다.

## 📗기능
 * 학교 이름으로 학교를 찾아준다

## 💡만들까 생각중인 것
 * 자동 자가진단
 * 특정 상대 자가진단 못하게 하기

## 📥사용
> [Node.js](https://nodejs.org/ko/)와 [Discord](https://discord.com) 다운로드는 필수입니다.
1. `yarn`
2. config.json.example을 config.json으로 바꾼 뒤 따로 설정을 한다.<br>
**파일에 설명을 위해 주석처리를 한 부분이 있습니다. 지워주세요 ('//'과 뒤에 있는 것)**
3. `node index.js`
4. 디스코드 서버에 봇을 초대하고 사용하면 됨 (슬래시 커맨드).

## 🎫라이선스
[GPLv3](https://olis.or.kr/license/Detailselect.do?lId=1072)
