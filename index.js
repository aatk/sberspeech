const fs = require('fs');
const os = require('os');
const fetch = require('cross-fetch');
const {Base64} = require('js-base64');
const { v4: uuidv4 } = require('uuid');
const ffmpeg = require('ffmpeg');

class SberSpeech {

    token = "";
    settings = {
        clientID: "",
        secretCode: ""
    };

    constructor(option) {
        this.settings.clientID = option.clientID !== undefined ? option.clientID : '';
        this.settings.secretCode = option.secretCode !== undefined ? option.secretCode : '';

        this.authUrl = option.authUrl !== undefined ? option.authUrl : 'https://salute.online.sberbank.ru:9443/api/v2/oauth';
        this.speechUrl = option.speechUrl !== undefined ? option.speechUrl : 'https://smartspeech.sber.ru/rest/v1/speech:recognize';
        this.textUrl = option.textUrl !== undefined ? option.textUrl : 'https://smartspeech.sber.ru/rest/v1/text:synthesize';
    }

    Authorization = async () => {
        let code = Base64.encode(this.settings.clientID+':'+this.settings.secretCode);
        let headerBasic ='Basic '+code;
        let rquid = uuidv4();
        let body = 'scope=SBER_SPEECH';
        let response = await fetch(this.authUrl, {
            method: 'POST',
            headers: {
                'Authorization': headerBasic,
                'RqUID': rquid,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body
        });

        let result = await response.text();
        //К сожалению нельзя сразу забирать json, в случае ошибки в заголовке возвращается пустая строка и сервер сваливается в ошибку уже здесь
        if (result !== "") {
            result = JSON.parse(result);
            this.token = result.access_token;
        }

        console.log(result);
        return result;
    }

    speechRecognize = async (blob, token = "") => {
        let result = null;

        if (token === "") {token = this.token};
        if (token !== "") {
            //навсякий случай, вдруг ни разу не авторизовывались

            let rquid = uuidv4();
            let tmpFilename = os.tmpdir()+rquid;
            fs.writeFileSync(tmpFilename+".webm", blob);
            let mp3File = await this.convertor(tmpFilename);
            if (mp3File !== null ) {

                let mp3blob = fs.readFileSync(mp3File);
                //Удалим файлы после конвертации
                fs.unlink(mp3File, (err) => { if (err) console.log(err.name) });
                fs.unlink(tmpFilename+".webm", (err) => { if (err) console.log(err.name) });

                let response = await fetch(this.speechUrl + '?model=general', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'audio/mpeg'
                    },
                    body: mp3blob
                });

                result = await response.text();
                //К сожалению нельзя сразу забирать json, в случае ошибки в заголовке возвращается пустая строка и сервер сваливается в ошибку уже здесь
                if (result !== "") {
                    result = JSON.parse(result);
                }

                console.log(result);
            }
        }

        return result;
    }

    textSynthesize = async (text,token = "") => {
        let result = "";

        if (token === "") {token = this.token}
        if (token !== "") {
            //curl -H "Authorization: Bearer ..." -H "Content-Type: application/text" --data-binary "Текст для синтеза" "https://smartspeech.sber.ru/rest/v1/text:synthesize?format=opus&voice=May_24000" > out.opus

            let response = await fetch(this.textUrl, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer '+token,
                    'Content-Type': 'application/text'
                },
                body: text
            });

            result = await response.blob();
            // if (result !== "") {
            //     result = JSON.parse(result);
            // }

        }

        return result;
    }

    convertor = async (filename) => {
        //ffmpeg -i source.webm dest.wav
        let process, result = null;
        try {
            process = await new ffmpeg(filename+".webm");
            result = await process.fnExtractSoundToMP3(filename + ".mp3");
        } catch (e) {
            console.log(e.code);
            console.log(e.msg);
        }

        return result;
    }

}

module.exports = SberSpeech;