process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

(async () => {
    let schools1 = require('./schools.json').reduce((all, one, i) => {
        const ch = Math.floor(i / 200);
        all[ch] = [].concat((all[ch] || []), one);
        return all
    }, []);
    const fs = require('fs');
    const axios = require('axios').default;
    const axiosRetry = require('axios-retry');
    axiosRetry(axios, {
        retries: 2,
        retryDelay: (retryCount) => retryCount * 1000
    });
    const iconv = require('iconv-lite');
    let done = [];
    let failed = [];
    let page = 0;
    for (chunk of schools1) {
        page++;
        console.log(`${page}/${schools1.length}`);
        await Promise.all(chunk.map(async (school) => {
            let res = await axios({
                method: "POST",
                url: "https://www.schoolinfo.go.kr/ei/ss/Pneiss_b01_s0.do",
                data: `HG_CD=${school.code}&GS_HANGMOK_CD=&PRE_JG_YEAR=`,
                headers: {
                    "Host": `www.schoolinfo.go.kr`,
                    "Connection": `keep-alive`,
                    "Cache-Control": `max-age=0`,
                    "sec-ch-ua": `"Whale";v="3", " Not;A Brand";v="99", "Chromium";v="104"`,
                    "sec-ch-ua-mobile": `?0`,
                    "sec-ch-ua-platform": `"Windows"`,
                    "Upgrade-Insecure-Requests": `1`,
                    "Origin": `https://www.schoolinfo.go.kr`,
                    "Content-Type": `application/x-www-form-urlencoded`,
                    "User-Agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.87 Whale/3.16.138.22 Safari/537.36`,
                    "Accept": `text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
                    "Sec-Fetch-Site": `same-origin`,
                    "Sec-Fetch-Mode": `navigate`,
                    "Sec-Fetch-Dest": `document`,
                    "Referer": `https://www.schoolinfo.go.kr/ei/ss/pneiss_a03_s0.do`,
                },
                responseType: "arraybuffer"
            }).catch(() => false);
            if (!res || !res.data || !iconv.decode(res.data, 'euc-kr') || !iconv.decode(res.data, 'euc-kr').split("<title>") || !iconv.decode(res.data, 'euc-kr').split("<title>")[1].split(" 학교정보</title>")[0]) failed.push(school);
            else {
                school.name = iconv.decode(res.data, 'euc-kr').split("<title>")[1].split(" 학교정보</title>")[0];
                done.push(school);
            };
        }));
        done = done.sort((a, b) => a.name.localeCompare(b.name));
        fs.writeFileSync("./done.json", JSON.stringify(done, null, 4));
        fs.writeFileSync("./failed.json", JSON.stringify(failed, null, 4));
    };
})();