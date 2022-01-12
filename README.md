# sberspeech
Библиотека для использования SberSpeech для интеграции на web-сайт распознавания и генерации голоса

# Установка: 
1. Предварительно установите `brew` https://brew.sh/
2. Установите пакеты `ffmpeg` в терминале - `brew install ffmpeg`
3. Подключите npm пакет в проект node.js `npm i sberspeech`
4. Пользуйтесь

# Использование:

Подключите пакет:
```javascript
let data = {
    clientID: "ENTER YOU CLIENT ID",
    secretCode: "ENTER YOU SECRET CODE"
}

let sberSpeechClass = require('sberspeech');
let sberSpeech = new sberSpeechClass(data);
```

Отправить файл с голосом для распознавания:

Пример функции которая получает на вход путь к файлу с голосом. 
На выходе json в котором разобран голос.

```javascript
async Voice(path) {
    let result = "";
    let blob = fs.readFileSync(path);

    await sberSpeech.Authorization();
    result = await sberSpeech.speechRecognize(blob);

    console.log('voice done.');

    return result;
}
```

Сгенерировать голос по входящему тексту:

Пример функции которая на вход получает текст, который требуется озвучить.
На выходе тип Buffer в котором содержится поток с голосом.
```javascript
async Text(textSynthesize) {
    let token = await sberSpeech.Authorization();
    let blob = await sberSpeech.textSynthesize(textSynthesize);

    let bf = "";
    if (blob !== "") {
        const arrayBuffer = await blob.arrayBuffer();
        bf = Buffer.from(arrayBuffer);
    }

    return bf;
}
```

## Более подробное описание самого сервиса по ссылке:

API синтеза речи: https://developers.sber.ru/docs/ru/smartspeech/synthesis

API распознавание речи: https://developers.sber.ru/docs/ru/smartspeech/recognition-overview