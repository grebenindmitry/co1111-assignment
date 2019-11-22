const API = "https://codecyprus.org/th/api";
let sessionID = "";


function getHuntList() {
    fetch(API + "/list")
        .then(response => response.json())
        .then(responseJSON => {
            let huntList = document.getElementById("huntList");
            if (getCookie('gamePlaying') === 'true') {
                let cookieSessionID = getCookie('sessionID');
                let username = getCookie('username');
                let nameElement = document.createElement('li');
                nameElement.id = 'savedHuntName';
                nameElement.innerHTML = '<a style="font-weight: bold" href="javascript:startSession(\'' + cookieSessionID + "\', undefined, true, \'" + username + '\')">Continue previous game</a>'
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
        });
}

// noinspection JSUnusedGlobalSymbols
function startSession(uuid, expiryDate) {
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
                document.cookie = 'sessionID=' + sessionID + 'expires=' + expiryDate;
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
    usernameInput.innerHTML =   "<form action='javascript:startSession(\"" + uuid + "\", \"" + huntEndDate + "\")'>" +
                                        "<input id='usernameBox' type='text' placeholder='Enter your username'>" +
                                        "<input type='submit' value='Submit' style='' class='submitButton'>" +
                                        "<span id='errorBox' class='disable' style='padding:2px; margin-left: 10px'></span>" +
                                "</form>";
    target.appendChild(usernameInput);
}

function getQuestion() {
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

                    if (responseJSON.canBeSkipped === true) {
                        let skipBox = document.createElement("BUTTON");
                        skipBox.id = "skipBox";
                        skipBox.classList.add('button');
                        skipBox.innerText="SKIP";
                        document.body.appendChild(skipBox);
                        document.getElementById("skipBox").value="SKIP";
                        document.getElementById("skipBox").name="SKIP";

                        skipBox.addEventListener('click', skipQuestion);
                    } else {
                        let errorSkip = document.createElement("p");
                        errorSkip.innerText = "Cannot skip. This questions is defined as one that cannot be skipped.";
                        document.body.appendChild(errorSkip);
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

                    let questionNumBox = document.createElement('span');
                    questionNumBox.innerText = 'Question: ' + (responseJSON.currentQuestionIndex + 1) +
                        "/" + responseJSON.numOfQuestions;
                    questionNumBox.classList.add('questionNum');
                    document.body.appendChild(questionNumBox);

                    let outputMSG = document.createElement('span');
                    outputMSG.id = 'outputMSG';
                    outputMSG.classList.add('disable', 'outputMSG');
                    document.body.appendChild(outputMSG);
                    if (responseJSON.requiresLocation) {
                        getLocation();
                        setInterval(getLocation, 31000);
                    }
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
                    setTimeout(getQuestion(), 5000);
                } else {
                    document.getElementById('outputMSG').classList.remove('disable', 'done');
                    document.getElementById('outputMSG').classList.add('error');
                    document.getElementById('outputMSG').innerText = responseJSON.message;
                }
            } else {
                document.getElementById('outputMSG').classList.remove('disable', 'done');
                document.getElementById('outputMSG').classList.add('error');
                document.getElementById('outputMSG').innerText = responseJSON.errorMessages[0];
                endSession();
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
    document.body.innerHTML = "end";
    console.log('end');
    getLeaderboard()
}

function getLocation() {
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
    fetch("https://codecyprus.org/th/api/leaderboard?session=" + sessionID)
        .then(response => response.json())
        .then(responseJSON => {

            //  console.log("i am in");
            //  let tableScore = document.createElement("TABLE");
            // document.body.innerHTML="hre";

            let score = responseJSON.leaderboard;
            score.id= "score";
            let scoreStatus = responseJSON.status;
            console.log(scoreStatus);
            let numOFplayes = responseJSON.numOfPlayers;
            console.log(numOFplayes);

            // let hasPrize = responseJSON.hasPrice;
            // console.log(hasPrize);
            let limit = responseJSON.limit;
            limit=10;
            console.log(limit);

            // document.body.innerText = score.
            console.log(score);
            document.createElement("table");

            //  let jasonScore = JSON.stringify(score);
            // document.body.innerText = jasonScore;

            for  (let scoreObject of score){
                console.log(scoreObject);
                let jasonScore = JSON.stringify(score);
                document.body.innerText = jasonScore;

            }
            // let playrName = jasonScore.player;
            // console.log(playrName);

        });
}

getHuntList();
