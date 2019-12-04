const API = "https://codecyprus.org/th/api";
let sessionID = "";


function getHuntList() {
    fetch(API + "/list")
        .then(response => response.json())
        .then(responseJSON => {
            let huntList = document.getElementById("huntList");
            if (getCookie('gamePlaying') === 'true') {
                let cookieSessionID = getCookie('sessionID');
                let nameElement = document.createElement('li');
                nameElement.id = 'savedHuntName';
                nameElement.innerHTML = '<a style="font-weight: bold" href="javascript:resumeSession(\'' + cookieSessionID + '\')">Continue previous game</a>'
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

function resumeSession(uuid) {
    sessionID = uuid;
    getQuestion();
}

// noinspection JSUnusedGlobalSymbols
function startSession(uuid, expiryDate, isContinue) {
    let username = document.getElementById('usernameBox').value;

    document.getElementById('errorBox').classList.remove('done', 'error', 'disable');
    document.getElementById('errorBox').classList.add('loading');
    document.getElementById('errorBox').innerText = "Loading...";
    fetch(API + "/start?player=" + username + "&app=dac-name&treasure-hunt-id=" + uuid)
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

function getQuestion() {
    setInterval(sendLocation, 31000);
    fetch(API + "/question?session=" + sessionID)
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

                    if (responseJSON.canBeSkipped === true) {
                        let skipBox = document.createElement("BUTTON");
                        skipBox.id = "skipBox";
                        skipBox.classList.add('button');
                        skipBox.innerText="SKIP";
                        document.body.appendChild(skipBox);
                        document.getElementById("skipBox").value="SKIP";
                        document.getElementById("skipBox").name="SKIP";
                        skipBox.addEventListener('click', skipQuestion);

                        let qrCode = document.createElement("qrCode");
                        qrCode.id = "qrCode";
                        qrCode.classList.add('button');
                        qrCode.innerText="QR Code";
                        document.body.appendChild(qrCode);
                        document.getElementById("qrCode").value="qrCode";
                        document.getElementById("qrCode").name="qrCode";
                        qrCode.addEventListener('click', QRCode);

                        let switchC = document.createElement("switchC");
                        switchC.id = "switchC";
                        switchC.classList.add('button');
                        switchC.innerText="Switch the camera";
                        document.body.appendChild(switchC);
                        document.getElementById("switchC").value="switchC";
                        document.getElementById("switchC").name="switchC";
                        switchC.addEventListener('click', changeCam);


                    } else {
                        let errorSkip = document.createElement("p");
                        errorSkip.innerText = "Cannot skip. This questions is defined as one that cannot be skipped.";
                        errorSkip.style.maxWidth = '60%';
                        document.body.appendChild(errorSkip);
                        let qrCode2 = document.createElement("qrCode2");
                        qrCode2.id = "qrCode2";
                        qrCode2.classList.add('button');
                        qrCode2.innerText="QR Code";
                        document.body.appendChild(qrCode2);
                        document.getElementById("qrCode2").value="qrCode2";
                        document.getElementById("qrCode2").name="qrCode2";
                        qrCode2.addEventListener('click', QRCode);
                    }

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
                            textSubmitButton.addEventListener('click', function() {sendAnswer(textBox.value);});

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

                    let scoreBox = document.createElement('span');
                    scoreBox.innerText = 'Loading...';
                    scoreBox.classList.add('scoreBox');
                    document.body.appendChild(scoreBox);
                    fetch(API + '/score?session=' + sessionID)
                        .then(response => response.json())
                        .then(scoreJSON => {
                            if (scoreJSON.status !== 'ERROR') {
                                scoreBox.innerText = 'Your score is: ' + scoreJSON.score;
                            }
                        });
                } else {
                    endSession();
                }
            }
        });
}

function sendAnswer(answer) {
    fetch(API + "/answer?session=" + sessionID + "&answer=" + answer)
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
function getLeaderboard() {
    fetch("https://codecyprus.org/th/api/leaderboard?session=" + sessionID +  "&sorted&limit=10")
        .then(response => response.json())
        .then(responseJSON => {

            let score = responseJSON.leaderboard;

            let limit = responseJSON.limit;
            let tableOfScores = "<table>";


             console.log(score);

            let player = "PLAYER";
            let pos = "POS."
            let time = "TIME";
            let scores = "SCORE";

            let position = [1,2,3,4,5,6,7,8,9,10];

            tableOfScores += "<tr class='styling'>" +
                "<td>" + pos + "</td>" +
                "<td>" + player + "</td>" +
                "<td>" + time + "</td>" +
                "<td>" + scores + "</td>" +
                "</tr>";

              for (let i=0; i < limit; i++ )
                {

                    tableOfScores += "<tr>" +

                                "<td>" + position[i] + "</td>" +
                                "<td>" + score[i].player + "</td>" +
                                "<td>" + score[i].completionTime + "</td>" +
                                "<td>" + score[i].score + "</td>" +
                                "</tr>";

                        }

              tableOfScores += "</table>";

              document.body = document.createElement("body");
              document.body.innerHTML = tableOfScores;


        })
}
function changeCam(){
    let getVideo = document.createElement("video");
    getVideo.id = 'preview';
    document.body.appendChild(getVideo);

    let opts = {
        // Whether to scan continuously for QR codes. If false, use scanner.scan() to manually scan.
        // If true, the scanner emits the "scan" event when a QR code is scanned. Default true.
        continuous: true,

        // The HTML element to use for the camera's video preview. Must be a <video> element.
        // When the camera is active, this element will have the "active" CSS class, otherwise,
        // it will have the "inactive" class. By default, an invisible element will be created to
        // host the video.
        video: document.getElementById('preview'),

        // Whether to horizontally mirror the video preview. This is helpful when trying to
        // scan a QR code with a user-facing camera. Default true.
        mirror: false,

        // Whether to include the scanned image data as part of the scan result. See the "scan" event
        // for image format details. Default false.
        captureImage: false,

        // Only applies to continuous mode. Whether to actively scan when the tab is not active.
        // When false, this reduces CPU usage when the tab is not active. Default true.
        backgroundScan: true,

        // Only applies to continuous mode. The period, in milliseconds, before the same QR code
        // will be recognized in succession. Default 5000 (5 seconds).
        refractoryPeriod: 5000,

        // Only applies to continuous mode. The period, in rendered frames, between scans. A lower scan period
        // increases CPU usage but makes scan response faster. Default 1 (i.e. analyze every frame).
        scanPeriod: 1
    };

    let scanner = new Instascan.Scanner(opts);


    Instascan.Camera.getCameras().then(function (cameras) {
        if (cameras.length > 0) {
            console.log(cameras);
            scanner.start(cameras[0]);
        } else {
            console.error('No cameras found.');
        }
    }).catch(function (e) {
        console.error(e);
    });

    scanner.addListener('scan', function (content) {
        console.log(content);
    });

}




getHuntList();
