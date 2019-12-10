const API = "https://codecyprus.org/th/api";
const TEST_API = "https://codecyprus.org/th/test-api";
let sessionID;
let username;
let main = document.getElementsByTagName('main')[0];
let finalScore;
let geoLoop;

function getHuntList(isTesting, tNumberOfThs) {
    let fetchURL;
    if (!isTesting) {
        fetchURL = API + "/list";
    } else {
        fetchURL = TEST_API + "/list?number-of-ths=" + tNumberOfThs;
        document.body.innerHTML += '<main></main>';
        main = document.getElementsByTagName('main')[0];
        main.innerHTML = '<div class="loader loader-big"></div>'
    }

    if (getCookie('gamePlaying') === 'true' && confirm('A saved game was found.\nContinue that game?')) {
        sessionID = getCookie('sessionID');
        startHunt();
    } else {
        fetch(fetchURL)
            .then(response => response.json())
            .then(responseJSON => {
                document.getElementsByClassName('loader')[0].remove();
                // noinspection JSUnusedLocalSymbols
                let huntList = document.getElementById("huntList");
                let i = 0;

                for (let treasureHunt of responseJSON.treasureHunts) {
                    let huntList = document.getElementById("huntList");
                    let startDateObj = new Date(treasureHunt.startsOn);
                    let dateOptions = {
                        day: 'numeric',
                        month: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    };
                    let endDateObj = new Date(treasureHunt.endsOn);

                    //Create and append hunt name
                    let thCard = document.createElement("li");
                    thCard.id = "thCard" + i;
                    thCard.classList.add('treasureHuntCard');
                    huntList.appendChild(thCard);

                    let thName = document.createElement('p');
                    thName.classList.add('thName');
                    thName.innerHTML = treasureHunt.name;
                    thCard.appendChild(thName);

                    let subList = document.createElement("ul");
                    subList.classList.add('thInfo');
                    subList.innerHTML += ("<li><b>Description: </b>" + treasureHunt.description + "</li>");
                    subList.innerHTML += ("<li><b>Starts On: </b>" + startDateObj.toLocaleDateString('en-US', dateOptions) + "</li>");
                    subList.innerHTML += ("<li><b>Ends On: </b>" + endDateObj.toLocaleDateString('en-US', dateOptions) + "</li>");
                    subList.innerHTML += ("<li><b>Duration: </b>" + (treasureHunt.maxDuration / 1000 / 60) + " minutes" + "</li>");
                    thCard.appendChild(subList);

                    let joinTH = document.createElement('button');
                    joinTH.innerText = 'Join Treasure Hunt';
                    joinTH.id = 'join' + treasureHunt.uuid + treasureHunt.maxDuration;
                    joinTH.classList.add('submitButton');
                    joinTH.addEventListener('click', enterUsername);
                    thCard.appendChild(joinTH);

                    i++;
                }
                let errorBox = document.createElement('span');
                errorBox.classList.add('disable', 'outputMSG');
                errorBox.addEventListener('click', function () {
                    document.getElementById('errorBox').classList.remove('done', 'error', 'loading');
                    document.getElementById('errorBox').classList.add('disable');
                    document.getElementById('errorBox').innerText = "";
                });
                errorBox.id = 'errorBox';
                main.appendChild(errorBox);
            });
    }
}
// noinspection JSUnusedGlobalSymbols
function startSession(uuid, huntDuration, isTesting, tPlayer) {
    let fetchURL;
    if (!isTesting) {
        fetchURL = API + "/start?player=" + username + "&app=dac-name&treasure-hunt-id=" + uuid;
    } else {
        fetchURL = TEST_API + "/start?player=" + tPlayer + "&app=dac-name&treasure-hunt-id=";
        document.body.innerHTML += '<main></main>';
        main = document.getElementsByTagName('main')[0];
        main.innerHTML = '<div class="loader loader-big"></div>'
    }

    document.getElementById('errorBox').classList.remove('done', 'error', 'disable');
    document.getElementById('errorBox').classList.add('loading');
    document.getElementById('errorBox').innerText = "Loading...";
    fetch(fetchURL)
        .then(response => response.json())
        .then(jsonResponse => {
            // noinspection EqualityComparisonWithCoercionJS
            if (jsonResponse.status == "ERROR") {
                document.getElementById('errorBox').classList.remove('done', 'loading');
                document.getElementById('errorBox').classList.add('error');
                document.getElementById('errorBox').innerText = "";
                for (let errorMessage of jsonResponse.errorMessages) {
                    document.getElementById('errorBox').innerText += errorMessage;
                }
            } else {
                document.getElementById('errorBox').classList.remove('loading', 'error');
                document.getElementById('errorBox').classList.add('done');
                document.getElementById('errorBox').innerText = "Session created!";
                sessionID = jsonResponse.session;
                document.cookie = 'gamePlaying=true; max-age=' + (huntDuration / 1000);
                document.cookie = 'sessionID=' + sessionID + ';max-age=' + (huntDuration / 1000);
                document.cookie = 'username=' + username + ';max-age=' + (huntDuration / 1000);
                startHunt();
            }
        });
    // getQuestion();
}
// noinspection JSUnusedGlobalSymbols
function enterUsername(event) {
    let usernamePopupBG = document.createElement('div');
    usernamePopupBG.id = 'usernamePopupBG';

    let usernamePopup = document.createElement('div');
    usernamePopup.id = 'usernamePopup';

    let closePopup = document.createElement('button');
    closePopup.innerText = '\u2573';
    closePopup.classList.add('closeButton');
    closePopup.addEventListener('click', function () {
        usernamePopupBG.remove();
    });
    usernamePopup.appendChild(closePopup);

    let usernameForm = document.createElement('form');
    usernameForm.id = 'usernameForm';
    usernameForm.action = 'javascript:void(0);';
    usernameForm.addEventListener('submit', function () {
        let uuid = event.target.id.substring(4, 63);
        let huntDuration = event.target.id.substring(63);
        username = document.getElementById('usernameField').value;
        startSession(uuid, huntDuration, false);
    });

    let formLabel = document.createElement('label');
    formLabel.innerText = 'Please choose a username: ';
    formLabel.id = 'formLabel';
    usernameForm.appendChild(formLabel);

    let usernameField = document.createElement('input');
    usernameField.type = 'text';
    usernameField.id = 'usernameField';
    usernameField.required = true;
    usernameField.placeholder = 'Username';
    usernameForm.appendChild(usernameField);

    let usernameSubmit = document.createElement('input');
    usernameSubmit.value = 'Submit';
    usernameSubmit.classList.add('submitButton');
    usernameSubmit.type = 'submit';
    usernameForm.appendChild(usernameSubmit);

    usernamePopup.appendChild(usernameForm);

    usernamePopupBG.appendChild(usernamePopup);

    main.appendChild(usernamePopupBG);
}

function showScore(isTesting, tScore, tCompleted, tFinished, tError) {
    let fetchURL;
    if (!isTesting) {
        fetchURL = API + '/score?session=' + sessionID;
    } else {
        fetchURL = TEST_API + "/score?score=" + tScore + "&completed=" + tCompleted + "&finished=" + tFinished +
            "&error=" + tError;
        document.body.innerHTML += '<main></main>';
        main = document.getElementsByTagName('main')[0];
        let questionInfo = document.createElement('div');
        questionInfo.id = 'questionInfo';
        let scoreBox = document.createElement('span');
        scoreBox.innerHTML = '<div class="loader loader-small loader-light"></div>';
        scoreBox.classList.add('scoreBox');
        scoreBox.id = 'scoreBox';
        questionInfo.appendChild(scoreBox);
        main.appendChild(questionInfo);
    }

    fetch(fetchURL)
        .then(response => response.json())
        .then(scoreJSON => {
            if (scoreJSON.status !== 'ERROR') {
                document.getElementById('scoreBox').innerText = 'Your score is: ' + scoreJSON.score;
            }
        });
}

function startHunt() {
    document.getElementsByTagName('main')[0].innerHTML = "";
    getQuestion(false);
    sendLocation();
    geoLoop = setInterval(sendLocation, 31000);
}

function getQuestion(isTesting, tQuestionType, tIsCompleted, tCanBeSkipped, tRequireLocation) {
    let fetchURL;
    if (!isTesting) {
        fetchURL = API + "/question?session=" + sessionID;
    } else {
        fetchURL = TEST_API + "/question?session=" + sessionID + "&question-type="
            + tQuestionType +"&can-be-skipped=" + tCanBeSkipped +  "&requires-location=" +tRequireLocation ;
        document.body.innerHTML += '<main></main>';
        main = document.getElementsByTagName('main')[0];
        main.innerHTML = '<div class="loader loader-big"></div>';
    }

    fetch(fetchURL)
        .then(response => response.json())
        .then(responseJSON => {
            // noinspection EqualityComparisonWithCoercionJS
            if (responseJSON.status == "ERROR") {
                let errorMessageList = "";
                for (let errorMessage of responseJSON.errorMessages) {
                    errorMessageList += errorMessage + "\n";
                }
                if (responseJSON.errorMessages[0] === 'Finished session. The specified session has run out of time.') {
                    endSession();
                }
            } else {
                if (!responseJSON.completed) {
                    main.innerHTML = '';
                    let skipDiv = document.createElement('div');
                    skipDiv.id = 'skipDiv';
                    skipDiv.style.minHeight = '80px';
                    main.appendChild(skipDiv);

                    if (responseJSON.canBeSkipped === true) {
                        let skipBox = document.createElement("BUTTON");
                        skipBox.id = "skipBox";
                        skipBox.classList.add('button');
                        skipBox.innerText = 'SKIP >>';
                        skipDiv.appendChild(skipBox);
                        skipBox.value="SKIP";
                        skipBox.name="SKIP";
                        skipBox.addEventListener('click', function () {
                            skipQuestion(responseJSON.skipScore);
                        });
                    } else {
                        let errorSkip = document.createElement("span");
                        errorSkip.innerText = "This question cannot be skipped.";
                        errorSkip.id = 'errorSkip';
                        errorSkip.style.textAlign = 'right';
                        errorSkip.style.display = 'inline-block';
                        errorSkip.style.maxWidth = '60%';
                        skipDiv.appendChild(errorSkip);
                    }

                    let qrCode = document.createElement("button");
                    qrCode.id = "qrCode";
                    qrCode.classList.add('button');
                    qrCode.value="qrCode";
                    qrCode.name="qrCode";
                    skipDiv.appendChild(qrCode);
                    qrCode.addEventListener('click', prepareQR);


                    let questionText = document.createElement('h3');
                    questionText.id="questionText";
                    questionText.innerHTML = responseJSON.questionText;
                    main.appendChild(questionText);

                    createAnswer(responseJSON.questionType);

                    let questionInfo = document.createElement('div');
                    questionInfo.classList.add('questionInfo');
                    questionInfo.id = 'questionInfo';

                    let questionNumBox = document.createElement('p');
                    questionNumBox.innerText = 'Question: ' + (responseJSON.currentQuestionIndex + 1) +
                        "/" + responseJSON.numOfQuestions;
                    questionInfo.appendChild(questionNumBox);

                    let scoresBox = document.createElement('p');
                    scoresBox.innerText = 'Correct answer: ' + responseJSON.correctScore + ' points\n' +
                        'Incorrect answer: ' + responseJSON.wrongScore + ' points\n' +
                        'Skip: ' + responseJSON.skipScore + ' points';
                    questionInfo.appendChild(scoresBox);

                    let scoreBox = document.createElement('span');
                    scoreBox.innerHTML = '<div class="loader loader-small loader-light"></div>';
                    scoreBox.classList.add('scoreBox');
                    scoreBox.id = 'scoreBox';
                    questionInfo.appendChild(scoreBox);

                    let outputMSG = document.createElement('span');
                    outputMSG.id = 'outputMSG';
                    outputMSG.classList.add('disable', 'outputMSG');
                    questionInfo.appendChild(outputMSG);

                    main.appendChild(questionInfo);

                    showScore(false);
                } else {
                    endSession();
                }
            }
        });
}

function createAnswer(qType) {
    switch (qType) {
        case "BOOLEAN":
            let booleanButtonTrue = document.createElement('button');
            let booleanButtonFalse = document.createElement('button');
            let booleanButtons = document.createElement('div');
            booleanButtons.style.margin = 'auto';
            booleanButtons.style.width = 'max-content';

            booleanButtonFalse.innerHTML = "False";
            booleanButtonTrue.innerHTML = "True";

            booleanButtonFalse.classList.add('button');
            booleanButtonTrue.classList.add('button');

            booleanButtonTrue.addEventListener('click', function() {sendAnswer('true');});
            booleanButtonFalse.addEventListener('click', function() {sendAnswer('false');});

            booleanButtons.appendChild(booleanButtonTrue);
            booleanButtons.appendChild(booleanButtonFalse);
            main.appendChild(booleanButtons);
            break;
        case "INTEGER":
            let integerForm = document.createElement('form');
            integerForm.classList.add('answerForm');
            integerForm.action = 'javascript:sendAnswer(document.getElementById("integerTextBox").value)';

            let integerTextBox = document.createElement('input');
            integerTextBox.id = 'integerTextBox';
            integerTextBox.classList.add('inputField');
            integerTextBox.autofocus = true;
            integerTextBox.required = true;
            integerTextBox.type = "number";

            let integerSubmitButton = document.createElement('input');
            integerSubmitButton.type = 'submit';
            integerSubmitButton.classList.add('button');
            integerSubmitButton.value = "Submit";

            main.appendChild(integerForm);
            integerForm.appendChild(integerTextBox);
            integerForm.appendChild(integerSubmitButton);
            break;
        case "NUMERIC":
            let numericForm = document.createElement('form');
            numericForm.classList.add('answerForm');
            numericForm.action = 'javascript:sendAnswer(document.getElementById("numericTextBox").value)';

            let numericTextBox = document.createElement('input');
            numericTextBox.id = 'numericTextBox';
            numericTextBox.classList.add('inputField');
            numericTextBox.autofocus = true;
            numericTextBox.required = true;
            numericTextBox.type = 'number';

            let numericSubmitButton = document.createElement('input');
            numericSubmitButton.type = 'submit';
            numericSubmitButton.value = 'Submit';
            numericSubmitButton.classList.add('button');

            main.appendChild(numericForm);
            numericForm.appendChild(numericTextBox);
            numericForm.appendChild(numericSubmitButton);
            break;
        case "MCQ":
            let mcqButtons = document.createElement('div');
            let mcqA = document.createElement('button');
            let mcqB = document.createElement('button');
            let mcqC = document.createElement('button');
            let mcqD = document.createElement('button');

            mcqButtons.style.margin = 'auto';
            mcqButtons.style.width = 'max-content';

            mcqA.classList.add('button');
            mcqB.classList.add('button');
            mcqC.classList.add('button');
            mcqD.classList.add('button');

            mcqA.innerText = 'A';
            mcqB.innerText = 'B';
            mcqC.innerText = 'C';
            mcqD.innerText = 'D';

            mcqA.addEventListener('click', function() {sendAnswer('A');});
            mcqB.addEventListener('click', function() {sendAnswer('B');});
            mcqC.addEventListener('click', function() {sendAnswer('C');});
            mcqD.addEventListener('click', function() {sendAnswer('D');});

            mcqButtons.appendChild(mcqA);
            mcqButtons.appendChild(mcqB);
            mcqButtons.appendChild(mcqC);
            mcqButtons.appendChild(mcqD);
            main.appendChild(mcqButtons);
            break;
        case "TEXT":
            let textForm = document.createElement('form');
            textForm.classList.add('answerForm');
            textForm.action = 'javascript:sendAnswer(document.getElementById("textBox").value)';

            let textBox = document.createElement('input');
            textBox.id = 'textBox';
            textBox.classList.add('inputField');
            textBox.autofocus = true;
            textBox.required = true;
            textBox.type = 'text';

            let textSubmitButton = document.createElement('input');
            textSubmitButton.value = 'Submit';
            textSubmitButton.type = 'submit';
            textSubmitButton.classList.add('button');
            textSubmitButton.id = 'textButton';

            main.appendChild(textForm);
            textForm.appendChild(textBox);
            textForm.appendChild(textSubmitButton);
            break;
    }
}

function sendAnswer(answer, isTesting, tCorrect, tCompleted) {

    let fetchURL;
    if (!isTesting) {
        fetchURL = API + "/answer?session=" + sessionID + "&answer=" + answer
    } else {
        fetchURL = TEST_API + "/answer?correct=" + tCorrect + "&completed=" + tCompleted;
        document.body.innerHTML += '<main></main>';
        main = document.getElementsByTagName('main')[0];
        main.innerHTML = '<div class="loader loader-big"></div>'
    }

    fetch(fetchURL)
        .then(response => response.json())
        .then(responseJSON => {
            // noinspection EqualityComparisonWithCoercionJS
            if (responseJSON.status == "OK") {
                if (responseJSON.correct) {
                    document.getElementById('outputMSG').classList.remove('disable', 'error');
                    document.getElementById('outputMSG').classList.add('done');
                    document.getElementById('outputMSG').innerHTML = responseJSON.message + '\n<div class="loader loader-small loader-light"></div>';
                    if (!isTesting) {
                        window.setTimeout(getQuestion, 600);
                    } else {
                        document.getElementById('outputMSG').innerText += "\nLoad the question";
                    }
                } else {
                    document.getElementById('outputMSG').classList.remove('disable', 'done');
                    document.getElementById('outputMSG').classList.add('error');
                    document.getElementById('outputMSG').innerText = responseJSON.message;
                    showScore(false);
                }
            } else {
                document.getElementById('outputMSG').classList.remove('disable', 'done');
                document.getElementById('outputMSG').classList.add('error');
                document.getElementById('outputMSG').innerText = responseJSON.errorMessages[0];
                if (responseJSON.errorMessages[0] === 'Finished session. The specified session has run out of time.') {
                    endSession();
                }
            }
        });
}

function skipQuestion(pointLoss) {
    if (confirm("You will lose " + Math.abs(pointLoss) + " points by skipping.\nAre you sure you want to continue?")) {
        fetch("https://codecyprus.org/th/api/skip?session=" + sessionID)
            .then(response => response.json())
            .then(responseJSON => {
                // noinspection EqualityComparisonWithCoercionJS
                if (responseJSON.status !== 'ERROR') {
                    if (!responseJSON.completed) {

                        document.getElementById('outputMSG').classList.remove('disable', 'error');
                        document.getElementById('outputMSG').classList.add('done');
                        document.getElementById('outputMSG').innerText = responseJSON.message;

                        getQuestion();
                    } else {
                        endSession();
                    }
                } else {
                    document.getElementById('outputMSG').classList.remove('disable', 'done');
                    document.getElementById('outputMSG').classList.add('error');
                    document.getElementById('outputMSG').innerText = responseJSON.errorMessages[0];
                }
            });
    }
}

function endSession() {
    document.cookie = 'gamePlaying=; expires=Thu 01 Jan 1970';
    document.cookie = 'sessionID=; expires=Thu 01 Jan 1970';
    finalScore = document.getElementById('scoreBox').innerHTML.substring(15);
    clearInterval(geoLoop);
    main.innerHTML = "End of treasure hunt. Loading the leaderboard... <div style='margin-top: 30%' class=\"loader loader-big loader-dark\"></div>";
    getLeaderboard(false, 20)
}

function sendLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            fetch(API + "/location?session=" + sessionID + "&latitude=" + position.coords.latitude +
                "&longitude=" + position.coords.longitude).then(response => response.json()
                .then(responseJSON => {
                    if (responseJSON.status === 'ERROR') {
                        document.getElementById('outputMSG').classList.remove('disable', 'done');
                        document.getElementById('outputMSG').classList.add('error');
                        document.getElementById('outputMSG').innerText = '';
                        for (let message of responseJSON.errorMessages) {
                            document.getElementById('outputMSG').innerText += message;
                        }
                    } else {
                        console.log(responseJSON.message);
                    }
            }));
        });
    }
}

function getCookie(cookieName) {
    let name = cookieName + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function getLeaderboard(isTesting, size, tSorted, tHasPrize) {

    let fetchURL;
    if (!isTesting) {
        fetchURL = API + "/leaderboard?session=" + sessionID + "&sorted&limit=1000";
    } else {
        fetchURL = TEST_API + "/leaderboard?sorted=" + tSorted + "&hasPrize=" + tHasPrize + "&size=" + size;
        document.body.innerHTML += '<main></main>';
        main = document.getElementsByTagName('main')[0];
        main.innerHTML = '<div class="loader loader-big"></div>';
    }

    fetch(fetchURL)
        .then(response => response.json())
        .then(responseJSON => {
            let scores = responseJSON.leaderboard;
            let players ='Player';
            let position = 'Pos.';
            let time = 'Time';
            let points = 'Score';
            main.innerHTML = '';

            let userPosition = 'below 1000';

            for (let i = 0; i < scores.length; i++) {
                if (scores[i].player === username) {
                    if (i % 10 === 1) userPosition = i + 'st';
                    else if (i % 10 === 2) userPosition = i + 'nd';
                    else if (i % 10 === 3) userPosition = i + 'rd';
                    else userPosition = i + 'th';
                }
            }

            let congratulationsMSG = document.createElement('div');
            congratulationsMSG.innerHTML = '<h3>Congratualtions, ' + getCookie('username') + '! You have completed the treasure hunt.</h3>';
            congratulationsMSG.innerHTML += '<h4>You have placed ' + userPosition + ', with a score of ' + finalScore + '!</h4>';

            main.appendChild(congratulationsMSG);

            let tableOfScores = "<table>";

            tableOfScores += "<tr style='border: 2px solid black; background-color:#666666;font-weight: bold; color: white;'>" +
                "<td>" + position + "</td>" +
                "<td>" + players + "</td>" +
                "<td>" + time + "</td>" +
                "<td>" + points + "</td>" +
                "</tr>";

            for (let i = 0; i < size; i++) {
                let compTime = new Date(scores[i].completionTime);
                tableOfScores += "<tr>" +
                    "<td>" + (i + 1) + "</td>" +
                    "<td>" + scores[i].player + "</td>" +
                    "<td>" + moment(compTime).format('MMM D YYYY, HH:mm:ss') + "</td>" +
                    "<td>" + scores[i].score + "</td>" +
                    "</tr>";
            }

            tableOfScores += "</table>";

            main.innerHTML += tableOfScores;
        });
}

function prepareQR() {
    // noinspection JSUnresolvedFunction
    const codeReader = new ZXing.BrowserQRCodeReader();
    let qrWindow = document.createElement('div');
    qrWindow.id = 'qrWindow';
    qrWindow.classList.add('qrWindow');
    main.appendChild(qrWindow);

    let exitBtn = document.createElement('button');
    exitBtn.innerText = '\u2573';
    exitBtn.id = 'exitBtn';
    exitBtn.addEventListener('click', function () {
        codeReader.reset();
        qrWindow.addEventListener('animationend', function () {
            qrWindow.remove();
        });
        qrWindow.classList.add('removing');
    });
    exitBtn.classList.add('cameraExit');
    qrWindow.appendChild(exitBtn);

    let videoOut = document.createElement('video');
    videoOut.id = 'videoOut';
    qrWindow.appendChild(videoOut);

    let sourceSelect = document.createElement('select');
    sourceSelect.classList.add('cameraSelect');
    qrWindow.appendChild(sourceSelect);

    let deviceID;
    // noinspection JSUnresolvedFunction
    codeReader.getVideoInputDevices()
        .then(videoInputDevices => {
            if (videoInputDevices.length !== 0) {
                deviceID = videoInputDevices[0].deviceId;
                if (videoInputDevices.length >= 1) {
                    videoInputDevices.forEach(element => {
                        const sourceOption = document.createElement('option');
                        sourceOption.text = element.label;
                        sourceOption.classList.add('cameraOption');
                        sourceOption.value = element.deviceId;
                        sourceSelect.appendChild(sourceOption);
                    });

                    sourceSelect.addEventListener('change', function () {
                        deviceID = sourceSelect.value;
                        codeReader.reset();
                        decode(codeReader, deviceID);
                    });
                }
                decode(codeReader, deviceID);
            } else {
                const sourceOption = document.createElement('option');
                sourceOption.text = 'No cameras found';
                sourceOption.classList.add('cameraOption');
                sourceSelect.appendChild(sourceOption);
                console.error("No cameras found!");
            }
        })
}

function decode(codeReader, device) {
    // noinspection JSUnresolvedFunction,JSUnusedLocalSymbols
    codeReader.decodeFromInputVideoDeviceContinuously(device, 'videoOut', (result, err) => {
            if (result) {
                let isValidURL;
                try {
                    new URL(result.text);
                    isValidURL = true;
                } catch (_) {
                    isValidURL = false;
                }
                try {
                    if (/^\d+\.\d+$/.test(result.text)) { //if a number
                        document.getElementById('numericTextBox').value = result.text;
                        document.getElementById('exitBtn').click();
                    } else if (/^\d+$/.test(result.text)) { //if an integer
                        document.getElementById('integerTextBox').value = result.text;
                        document.getElementById('exitBtn').click();
                    } else { //if not a number
                        document.getElementById('textBox').value = result.text;
                        document.getElementById('exitBtn').click();
                    }
                } catch (e) {
                    if (document.getElementById('copyButton') === null) {
                        let resultDiv = document.createElement('div');

                        let resultBox = document.createElement('p');
                        resultBox.innerText = result.text;
                        resultBox.id = 'resultBox';
                        resultBox.style.backgroundColor = 'black';
                        resultBox.style.color = 'white';
                        resultDiv.appendChild(resultBox);

                        let copyButton = document.createElement('button');
                        copyButton.innerText = 'Copy';
                        copyButton.id = 'copyButton';
                        copyButton.addEventListener('click', function () {
                            navigator.clipboard.writeText(result.text)
                                .then(function () {
                                    document.getElementById('exitBtn').click();
                                    document.getElementById('outputMSG').classList.remove('disable', 'error');
                                    document.getElementById('outputMSG').classList.add('done');
                                    document.getElementById('outputMSG').innerText = 'Copied to clipboard';
                                });
                        });
                        resultDiv.appendChild(copyButton);

                        if (isValidURL) {
                            let openURLButton = document.createElement('button');
                            openURLButton.innerText = 'Open URL';
                            openURLButton.id = 'openURLButton';
                            openURLButton.addEventListener('click', function () {
                                window.open(result.text, '_blank').focus();
                            });
                            resultDiv.appendChild(openURLButton);
                        }

                        document.getElementById('qrWindow').appendChild(resultDiv);
                    } else {
                        document.getElementById('resultBox').innerText = result.text;
                    }
                }
            }
        });
}