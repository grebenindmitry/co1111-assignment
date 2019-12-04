const API = "https://codecyprus.org/th/api";
const TEST_API = "https://codecyprus.org/th/test-api";
let sessionID = "";

function getHuntList(isTesting,tNumberOfThs) {
    console.log("I am in testing");
    console.log(isTesting);
    let fetchURL = '';
    if (!isTesting) {
        fetchURL = API + "/list";
    } else {
        fetchURL =   TEST_API + "/list?number-of-ths=" + tNumberOfThs;

    }

    fetch(fetchURL)
        .then(response => response.json())
        .then(responseJSON => {
            let huntList = document.getElementById("huntList");
            let i = 0;
            if (getCookie('gamePlaying') === 'true') {
                let cookieSessionID = getCookie('sessionID');
                let nameElement = document.createElement('li');
                nameElement.id = 'savedHuntName';
                nameElement.innerHTML = '<a style="font-weight: bold" href="javascript:resumeSession(\'' + cookieSessionID + '\')">Continue previous game</a>';
                huntList.appendChild(nameElement);
            }

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
                let nameElement = document.createElement("li");
                nameElement.id = "thName" + i;
                huntList.appendChild(nameElement);
                nameElement.innerHTML = ("<a style='font-weight: bold;' href='javascript:enterUsername(\"" +
                    treasureHunt.uuid + "\", \"" + nameElement.id + "\", \"" + endDateObj.toUTCString() + "\")'>" + treasureHunt.name + "</a>");

                //Create and append sublist for hunt info
                let subList  = document.createElement("ul");
                huntList.appendChild(subList);

                //Append hunt info
                subList.innerHTML += ("<li><b>Description: </b>" + treasureHunt.description + "</li>");
                subList.innerHTML += ("<li><b>Starts On: </b>" + startDateObj.toLocaleDateString('en-US', dateOptions) + "</li>");
                subList.innerHTML += ("<li><b>Ends On: </b>" + endDateObj.toLocaleDateString('en-US', dateOptions) + "</li>");
                i++;
            }
            let errorBox = document.createElement('span');
            errorBox.classList.add('disable', 'outputMSG');
            errorBox.id = 'errorBox';
            document.body.appendChild(errorBox);
        });
}

// noinspection JSUnusedGlobalSymbols
function resumeSession(uuid) {
    sessionID = uuid;
    getQuestion();
}

// noinspection JSUnusedGlobalSymbols
function startSession(uuid, expiryDate,isTesting,player) {

    let username = document.getElementById('usernameBox').value;
    let fetchURL = '';
    if (!isTesting) {
        fetchURL = API + "/start?player=" + username + "&app=dac-name&treasure-hunt-id=" + uuid;
    } else {
        fetchURL =   API + "/start?player=" + player + "&app=dac-name&treasure-hunt-id=";

    }

    sendLocation();
    setInterval(sendLocation, 31000);

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
                document.cookie = 'gamePlaying=true; expires=' + expiryDate;
                document.cookie = 'sessionID=' + sessionID + ';expires=' + expiryDate;
                getQuestion();
            }
        });
    // getQuestion();
}

// noinspection JSUnusedGlobalSymbols
function enterUsername(uuid, targetID, huntEndDate) {
    let target = document.getElementById(targetID);
    if (document.getElementById('inputBox') !== null) {
        document.getElementById('inputBox').remove();
    }
    let usernameInput = document.createElement("div");
    usernameInput.id = "inputBox";
    usernameInput.style.display = "inline-block";
    usernameInput.style.marginLeft = "10px";
    usernameInput.innerHTML =   "<form action='javascript:startSession(\"" + uuid + "\", \"" + huntEndDate + "\", false)'>" +
                                        "<input id='usernameBox' type='text' placeholder='Enter your username'>" +
                                        "<input type='submit' value='Submit' style='' class='submitButton'>" +
                                "</form>";
    target.appendChild(usernameInput);
}

function showScore(isTesting,score,completed,finished,error) {
    let fetchURL = '';
    if (!isTesting) {
        fetchURL = API + '/score?session=' + sessionID;
    } else {
        fetchURL =   TEST_API + "?score=" + score + "&completed=" + completed + "&finished=" + finished +
            "&error=" + error;

    }

    let scoreBox = document.createElement('span');
    scoreBox.innerText = 'Loading...';
    scoreBox.classList.add('scoreBox');
    document.getElementById('skipField').appendChild(scoreBox);
    fetch(fetchURL)
        .then(response => response.json())
        .then(scoreJSON => {
            if (scoreJSON.status !== 'ERROR') {
                scoreBox.innerText = 'Your score is: ' + scoreJSON.score;
            }
        });
}

function getQuestion(isTesting, tQuestionType, tIsCompleted, tCanBeSkipped, tRequireLocation) {
    let fetchURL = '';
    if (!isTesting) {
        fetchURL = API + "/question?session=" + sessionID;
    } else {
        fetchURL =   TEST_API + "/question?session=" + sessionID + "?completed&question-type="
            + tQuestionType +"&can-be-skipped=" + tCanBeSkipped +  "&requires-location=" +tRequireLocation ;

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
                alert(errorMessageList);
            } else {
                if (!responseJSON.completed) {
                    document.body.innerHTML = "";
                    document.body.classList.remove('margin-free');

                    let skipField = document.createElement('div');
                    skipField.id = 'skipField';
                    document.body.append(skipField);

                    if (responseJSON.canBeSkipped === true) {
                        let skipBox = document.createElement("BUTTON");
                        skipBox.id = "skipBox";
                        skipBox.classList.add('button');
                        skipBox.innerText="SKIP";
                        skipBox.value="SKIP";
                        skipBox.name="SKIP";
                        skipField.appendChild(skipBox);
                        skipBox.addEventListener('click', skipQuestion);
                    } else {
                        let errorSkip = document.createElement("span");
                        errorSkip.innerText = "Cannot skip. This questions is defined as one that cannot be skipped.";
                        errorSkip.id = 'errorSkip';
                        skipField.appendChild(errorSkip);
                    }

                    let qrCode = document.createElement("qrCode");
                    qrCode.id = "qrCode";
                    qrCode.classList.add('button');
                    qrCode.innerText="QR Code";
                    qrCode.value="qrCode";
                    qrCode.name="qrCode";
                    skipField.appendChild(qrCode);
                    qrCode.addEventListener('click', prepareQR);

                    let questionName = document.createElement('h1');
                    questionName.innerHTML = responseJSON.questionText;
                    document.body.appendChild(questionName);

                    switch (responseJSON.questionType) {
                        case "BOOLEAN":
                            let booleanButtonTrue = document.createElement('button');
                            let booleanButtonFalse = document.createElement('button');

                            booleanButtonFalse.innerHTML = "False";
                            booleanButtonTrue.innerHTML = "True";

                            booleanButtonFalse.classList.add('button');
                            booleanButtonTrue.classList.add('button');

                            booleanButtonTrue.addEventListener('click', function() {sendAnswer('true');});
                            booleanButtonFalse.addEventListener('click', function() {sendAnswer('false');});

                            document.body.appendChild(booleanButtonTrue);
                            document.body.appendChild(booleanButtonFalse);
                            break;

                        case "INTEGER":
                            let integerForm = document.createElement('form');
                            integerForm.action = 'javascript:sendAnswer(document.getElementById("integerTextBox").value)';

                            let integerTextBox = document.createElement('input');
                            integerTextBox.id = 'integerTextBox';
                            integerTextBox.type = "number";

                            let integerSubmitButton = document.createElement('input');
                            integerSubmitButton.type = 'submit';
                            integerSubmitButton.classList.add('button');
                            integerSubmitButton.value = "Submit";

                            document.body.appendChild(integerForm);
                            integerForm.appendChild(integerTextBox);
                            integerForm.appendChild(integerSubmitButton);
                            break;
                        case "NUMERIC":
                            let numericForm = document.createElement('form');
                            numericForm.action = 'javascript:sendAnswer(document.getElementById("numericTextBox").value)';

                            let numericTextBox = document.createElement('input');
                            numericTextBox.id = 'numericTextBox';
                            numericTextBox.type = 'number';

                            let numericSubmitButton = document.createElement('input');
                            numericSubmitButton.type = 'submit';
                            numericSubmitButton.value = 'Submit';
                            numericSubmitButton.classList.add('button');

                            document.body.appendChild(numericForm);
                            numericForm.appendChild(numericTextBox);
                            numericForm.appendChild(numericSubmitButton);
                            break;
                        case "MCQ":
                            let mcqA = document.createElement('button');
                            let mcqB = document.createElement('button');
                            let mcqC = document.createElement('button');
                            let mcqD = document.createElement('button');

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

                            document.body.appendChild(mcqA);
                            document.body.appendChild(mcqB);
                            document.body.appendChild(mcqC);
                            document.body.appendChild(mcqD);
                            break;
                        case "TEXT":
                            let textForm = document.createElement('form');
                            textForm.action = 'javascript:sendAnswer(document.getElementById("textBox").value)';

                            let textBox = document.createElement('input');
                            textBox.type = 'text';
                            
                            let textSubmitButton = document.createElement('button');
                            textSubmitButton.innerText = 'Submit';
                            textSubmitButton.classList.add('button');
                            textSubmitButton.id = 'textButton';

                            document.body.appendChild(textForm);
                            textForm.appendChild(textBox);
                            textForm.appendChild(textSubmitButton);
                            break;
                    }

                    let questionInfo = document.createElement('div');

                    questionInfo.classList.add('questionInfo');

                    let questionNumBox = document.createElement('p');
                    questionNumBox.innerText = 'Question: ' + (responseJSON.currentQuestionIndex + 1) +
                        "/" + responseJSON.numOfQuestions;
                    questionInfo.appendChild(questionNumBox);

                    let scoresBox = document.createElement('p');
                    scoresBox.innerText = 'Correct answer: ' + responseJSON.correctScore + ' points\n' +
                        'Incorrect answer: ' + responseJSON.wrongScore + ' points\n' +
                        'Skip: ' + responseJSON.skipScore + ' points';
                    questionInfo.appendChild(scoresBox);

                    let outputMSG = document.createElement('span');
                    outputMSG.id = 'outputMSG';
                    outputMSG.classList.add('disable', 'outputMSG');
                    questionInfo.appendChild(outputMSG);

                    document.body.appendChild(questionInfo);

                    showScore();
                } else {
                    endSession();
                }
            }
        });
}

function sendAnswer(answer,isTesting,correct,completed) {

    let fetchURL = '';
    if (!isTesting) {
        fetchURL = API + "/answer?session=" + sessionID + "&answer=" + answer
    } else {
        fetchURL =   TEST_API + "/answer?" + "correct=" + correct + "&completed=" + completed;

    }

    fetch(fetchURL)
        .then(response => response.json())
        .then(responseJSON => {
            // noinspection EqualityComparisonWithCoercionJS
            if (responseJSON.status == "OK") {
                if (responseJSON.correct) {
                    document.getElementById('outputMSG').classList.remove('disable', 'error');
                    document.getElementById('outputMSG').classList.add('done');
                    document.getElementById('outputMSG').innerText = responseJSON.message;
                    window.setTimeout(getQuestion, 600);
                } else {
                    document.getElementById('outputMSG').classList.remove('disable', 'done');
                    document.getElementById('outputMSG').classList.add('error');
                    document.getElementById('outputMSG').innerText = responseJSON.message;
                    window.setTimeout(getQuestion, 600);
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

function skipQuestion() {
    fetch("https://codecyprus.org/th/api/skip?session=" + sessionID)
        .then(response => response.json())
        .then(responseJSON => {
            // noinspection EqualityComparisonWithCoercionJS
            if (responseJSON.status != 'ERROR'){
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

function endSession() {
    document.cookie = 'gamePlaying=; expires=Thu 01 Jan 1970';
    document.cookie = 'sessionID=; expires=Thu 01 Jan 1970';
    document.body.innerHTML = "End of treasure hunt. Loading the leaderboard...";
    console.log('end');
    getLeaderboard()
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
function getLeaderboard(isTesting,size,sorted,hasPrize) {

    let fetchURL = '';
    if (!isTesting) {
        fetchURL = API + "/leaderboard?session=" + sessionID + "&sorted&limit=10";
    } else {
        fetchURL =   TEST_API + "/leaderboard?session=" + sessionID + "?sorted=" + sorted +
            "&hasPrize="+hasPrize + "&size=" +size;

    }

    fetch(fetchURL)
        .then(response => response.json())
        .then(responseJSON => {

            let score = responseJSON.leaderboard;

            let limit = responseJSON.limit;
            let tableOfScores = "<table>";

            console.log(score);

            for (let i = 0; i < limit; i++) {
                tableOfScores += "<tr>" +
                    "<td>" + score[i].player + "</td>" +
                    "<td>" + score[i].completionTime + "</td>" +
                    "<td>" + score[i].score + "</td>" +
                    "</tr>";
            }

            tableOfScores += "</table>";

            document.body = document.createElement("body");
            document.body.innerHTML = tableOfScores;


        });
}

function stopQR() {
    document.getElementById('qrWindow').remove();
}

function prepareQR() {
    let qrWindow = document.createElement('div');
    qrWindow.id = 'qrWindow';
    qrWindow.classList.add('qrWindow');
    document.body.append(qrWindow);

    let exitBtn = document.createElement('button');
    exitBtn.innerText = 'X';
    exitBtn.addEventListener('click', stopQR);
    exitBtn.classList.add('cameraExit');
    qrWindow.append(exitBtn);

    let videoOut = document.createElement('video');
    videoOut.id = 'videoOut';
    qrWindow.append(videoOut);

    let sourceSelect = document.createElement('select');
    sourceSelect.classList.add('cameraSelect');
    qrWindow.append(sourceSelect);

    let deviceID;
    const codeReader = new ZXing.BrowserQRCodeReader();
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
    codeReader.decodeFromInputDeviceContinuously(device, 'videoOut')
        .then((result, err) => {
            if (result) {
                console.log(result);
            } 
        })
}