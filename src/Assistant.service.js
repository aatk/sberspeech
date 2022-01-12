const fs = require('fs');

let data = {
    clientID: "ENTER YOU CLIENT ID",
    secretCode: "ENTER YOU SECRET CODE"
}

let sberSpeechClass = require('sberspeech');
let sberSpeech = new sberSpeechClass(data);

class AssistantService {

    static async Auth() {
        let result = await sberSpeech.Authorization();
        return result;
    }

    static async Voice(path) {
        let result = "";
        let blob = fs.readFileSync(path);

        await sberSpeech.Authorization();
        result = await sberSpeech.speechRecognize(blob);

        console.log('voice done.');

        return result;
    }

    static async Text(textSynthesize) {
        let token = await sberSpeech.Authorization();
        let blob = await sberSpeech.textSynthesize(textSynthesize);

        let bf = "";
        if (blob !== "") {
            const arrayBuffer = await blob.arrayBuffer();
            bf = Buffer.from(arrayBuffer);
        }

        return bf;
    }

}

module.exports = AssistantService;