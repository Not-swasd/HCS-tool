process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import _schools from './schools.json' assert { "type": "json" };
const schools = _schools.reduce((all, one, i) => {
    const ch = Math.floor(i / 200);
    all[ch] = [].concat((all[ch] || []), one);
    return all
}, []);
import fs from 'fs';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import iconvLite from 'iconv-lite';
var res = await axios.get("https://www.schoolinfo.go.kr/Main.do").then(() => true).catch(() => false);
if (!res) {
    console.error("학교알리미 서버에 접속할 수 없습니다.");
    process.exit(1);
};
axiosRetry(axios, {
    retries: 2,
    retryDelay: (retryCount) => retryCount * 1000
});
let done = [];
let failed = [];
let page = 0;
let c = 0;
for (const chunk of schools) {
    page++;
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`\r${page}/${schools.length}`);
    await Promise.all(chunk.map(async (school) => {
        var name = "";
        try {
            var res = await axios({
                method: "GET",
                url: `https://www.schoolinfo.go.kr/ei/ss/Pneiss_b01_s0.do?HG_CD=${school.code}&VIEWMODE=3`, //VIEWMODE=1이면 css까지 불러옴. &PRE_JG_YEAR=
                responseType: "arraybuffer"
            }).catch(() => false);
            var decoded = iconvLite.decode(res.data, 'euc-kr');
            name = decoded.match(/(?<=',')(.*?)(?='\)")/)[0];
        } catch (e) { name = "" };
        if (name) {
            if (school.name !== name) c++;
            school.name = name;
            done.push(school);
        } else failed.push(school);
    }));
    done = done.sort((a, b) => a.name.localeCompare(b.name) || a.code.localeCompare(b.code));
    if (done.length > 0) fs.writeFileSync("./done_dev.json", JSON.stringify(done, null, 4));
    if (failed.length > 0) fs.writeFileSync("./failed_dev.json", JSON.stringify(failed, null, 4));
};
console.info(`\r총 ${_schools.length}개 학교 중 ${c}개의 학교 정보가 업데이트 되었고, ${failed.length}개의 학교 정보가 업데이트 되지 않았습니다.`);
if (failed.length <= 0 && done.length > 0) {
    fs.writeFileSync("./schools.json", JSON.stringify(done, null, 4));
    if (fs.existsSync("./done_dev.json")) fs.unlinkSync("./done_dev.json");
} else console.info(`오류로 인해 정보 업데이트를 못한 학교가 ${failed.length}개 있으니 확인해주세요. 이유에는 폐교, axios오류 등이 있을 수 있습니다.`);