const API = "https://codecyprus.org/th/api"
let sessionID = "";


async function getHuntList() {
    fetch(API + "/list")
        .then(response => response.json())
        .then(responseJSON => {
            let i = 0;
            for (let treasureHunt of responseJSON.treasureHunts) {
                let huntList = document.getElementById("huntList");

                //Create and append hunt name
                let nameElement = document.createElement("li");
                nameElement.id = "thName" + i;
                huntList.appendChild(nameElement);
                nameElement.innerHTML = ("<a style='font-weight: bold;' href='javascript:enterUsername(\"" + 
                    treasureHunt.uuid + "\", \"" + nameElement.id + "\")'>" + treasureHunt.name + "</a>");

                //Create and append sublist for hunt info
                let subList  = document.createElement("ul");
                huntList.appendChild(subList);

                //Append hunt info
                subList.innerHTML += ("<li><b>Description: </b>" + treasureHunt.description + "</li>");
                subList.innerHTML += ("<li><b>Starts On: </b>" + timestampFromEpoch(treasureHunt.startsOn) + "</li>");
                i++;

            }
        });
}

function timestampFromEpoch(epochTime) {
    let dateObj = new Date(epochTime);
    return (dateObj.getDate() + "/" + (dateObj.getMonth() + 1) + "/" + dateObj.getFullYear() + 
        ", " + dateObj.getHours() + ":" + dateObj.getMinutes()
        .toLocaleString("en-US", {minimumIntegerDigits: 2, useGrouping:false}) + ":" + 
        dateObj.getSeconds().toLocaleString("en-US", {minimumIntegerDigits: 2, useGrouping:false}));
}

function startSession(uuid) {
    let username = document.getElementById('usernameBox').value;
    document.getElementById('errorBox').classList.remove('done', 'error', 'disable');
    document.getElementById('errorBox').classList.add('loading');
    document.getElementById('errorBox').innerText = "Loading...";
    fetch(API + "/start?player=" + username + "&app=dac-name&treasure-hunt-id=" + uuid)
        .then(response => response.json())
        .then(jsonResponse => {
            console.log(jsonResponse);
            if (jsonResponse.status === "ERROR") {
                document.getElementById('errorBox').classList.remove('done', 'loading');
                document.getElementById('errorBox').classList.add('error');
                document.getElementById('errorBox').innerText = "";
                for (let errorMessage of jsonResponse.errorMessages) {
                    document.getElementById('errorBox').innerText += errorMessage;
                }
            } else {
                document.getElementById('errorBox').classList.remove('loading', 'error');
                document.getElementById('errorBox').classList.add('done');
                document.getElementById('errorBox').innerText = "Session created!"
                sessionID = jsonResponse.session;
                getQuestion();
            }
        });
}

function enterUsername(uuid, targetID) {
    let username = "";
    
    let target = document.getElementById(targetID);
    if (document.getElementById('inputBox') !== null) {
        document.getElementById('inputBox').remove();
    }
    usernameInput = document.createElement("div");
    usernameInput.id = "inputBox";
    usernameInput.style.display = "inline-block";
    usernameInput.style.marginLeft = "10px";
    usernameInput.innerHTML = "<span>Username: </span>" +
                            "<input id='usernameBox' type='text'></input>" + 
                            "<button id='submitButton' onclick='startSession(\""+ uuid + "\")'>OK</button>" +
                            "<span id='errorBox' class='disable' style='padding:2px; margin-left: 10px'></span>";
    target.appendChild(usernameInput);
    document.getElementById('usernameBox').addEventListener("keyup", function(event) {
        if (event.code === "Enter" || event.code === "NumpadEnter") {
            document.getElementById('submitButton').click();
        }
        });
}

function getQuestion() {
    fetch(API + "/question?session=" + sessionID)
        .then(response => response.json())
        .then(jsonResponse => {
            console.log(jsonResponse);
            if (jsonResponse.status === "ERROR") {
                let errorMessageList = "";
                for (let errorMessage of jsonResponse.errorMessages) {
                    errorMessageList += errorMessage + "\n";
                }
                alert(errorMessageList);
            } else {
                let body = document.getElementsByTagName('body')[0];
                body.innerHTML = "";

                let position= jsonResponse.currentQuestionIndex;
                console.log(position);


                if(jsonResponse.canBeSkipped === true)
                {
                    console.log("inside-skip fun");

                    let skipBox = document.createElement("BUTTON");
                    skipBox.id = "skipBox";
                    skipBox.innerText="SKIP >>";
                    document.body.appendChild(skipBox);
                    document.getElementById("skipBox").value="SKIP";
                    document.getElementById("skipBox").name="SKIP";


                    skipBox.addEventListener('click', function(event) {skipQuestion();});
                    // skipBox.onclick = skipQuestion();

                }
                else{
                  let errorSkip = document.createElement("P");
                    errorSkip.innerText = "Cannot skip. This questions is defined as one that cannot be skipped.";
                    document.body.appendChild(errorSkip);
                }

                let questionName = document.createElement('h1');
                questionName.innerHTML = jsonResponse.questionText;
                body.appendChild(questionName);

                console.log(jsonResponse.questionType);
                switch (jsonResponse.questionType) {
                    case "BOOLEAN":
                        let booleanButtonTrue = document.createElement('button');
                        let booleanButtonFalse = document.createElement('button');

                        booleanButtonFalse.innerHTML = "No";
                        booleanButtonTrue.innerHTML = "Yes";

                        booleanButtonTrue.addEventListener('click', function(event) {sendAnswer('true');});
                        booleanButtonFalse.addEventListener('click', function(event) {sendAnswer('false');});

                        body.appendChild(booleanButtonTrue);
                        body.appendChild(booleanButtonFalse);
                        break;

                    case "INTEGER":
                        let integerTextBox = document.createElement('input');
                        integerTextBox.type = "number";
                        integerTextBox.readOnly = true;
                        integerTextBox.addEventListener('keydown', handleIntegerInput);

                        let integerSubmitButton = document.createElement('button');
                        integerSubmitButton.innerText = "Submit";
                        integerSubmitButton.id = "integerButton";
                        integerSubmitButton.addEventListener('click', function(event) {sendAnswer(integerTextBox.value);});

                        body.appendChild(integerTextBox);
                        body.appendChild(integerSubmitButton);
                        break;
                    case "NUMERIC":
                        let numericTextBox = document.createElement('input');
                        numericTextBox.type = 'number';
                        
                        let numericSubmitButton = document.createElement('button');
                        numericSubmitButton.innerText = 'Submit';
                        numericSubmitButton.id = 'numberButton';
                        numericSubmitButton.addEventListener('click', function(event) {sendAnswer(numericTextBox.value);});

                        body.appendChild(numericTextBox);
                        body.appendChild(numericSubmitButton);
                        break;
                    case "MCQ":
                        let mcqA = document.createElement('button');
                        let mcqB = document.createElement('button');
                        let mcqC = document.createElement('button');
                        let mcqD = document.createElement('button');

                        mcqA.innerText = 'A';
                        mcqB.innerText = 'B';
                        mcqC.innerText = 'C';
                        mcqD.innerText = 'D';

                        mcqA.addEventListener('click', function(event) {sendAnswer('A');});
                        mcqB.addEventListener('click', function(event) {sendAnswer('B');});
                        mcqC.addEventListener('click', function(event) {sendAnswer('C');});
                        mcqD.addEventListener('click', function(event) {sendAnswer('D');});

                        body.appendChild(mcqA);
                        body.appendChild(mcqB);
                        body.appendChild(mcqC);
                        body.appendChild(mcqD);
                        break;
                    case "TEXT":
                        let textBox = document.createElement('input');
                        textBox.type = 'text';
                        
                        let textSubmitButton = document.createElement('button');
                        textSubmitButton.innerText = 'Submit';
                        textSubmitButton.id = 'textButton';
                        textSubmitButton.addEventListener('click', function(event) {sendAnswer(textBox.value);});
                        
                        body.appendChild(textBox);
                        body.appendChild(textSubmitButton);
                        break;
                }
                
                let outputMSG = document.createElement('span');
                outputMSG.id = 'outputMSG';
                outputMSG.classList.add('disable', 'outputMSG');
                body.appendChild(outputMSG);
            }
        });
}

function handleNumericInput(event) {
    if (event.code == "Enter" || event.code == "NumpadEnter") {
        document.getElementById('numberButton').click();
    }
}

function handleIntegerInput(event) {
    //TODO: mb add numpad
    switch (event.code) {
        case "Digit0":
        case "Numpad0":
            event.target.value += "0";
            break;
        case "Digit1":
        case "Numpad1":
            event.target.value += "1";
            break;
        case "Digit2":
        case "Numpad2":
            event.target.value += "2";
            break;
        case "Digit3":
        case "Numpad3":
            event.target.value += "3";
            break;
        case "Digit4":
        case "Numpad4":
            event.target.value += "4";
            break;
        case "Digit5":
        case "Numpad5":
            event.target.value += "5";
            break;
        case "Digit6":
        case "Numpad6":
            event.target.value += "6";
            break;
        case "Digit7":
        case "Numpad7":
            event.target.value += "7";
            break;
        case "Digit8":
        case "Numpad8":
            event.target.value += "8";
            break;
        case "Digit9":
        case "Numpad9":
            event.target.value += "9";
            break;
        case "Enter":
        case "NumpadEnter":
            document.getElementById('integerButton').click();                        
            break;
        case "Backspace":
            event.target.value = event.target.value.slice(0, event.target.value.length - 1);
            break;
    }
}

function sendAnswer(answer) {
    fetch(API + "/answer?session=" + sessionID + "&answer=" + answer)
        .then(response => response.json())
        .then(responseJSON => {
            if (responseJSON.status === "OK") {
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
            }
        });
}


function skipQuestion(sessionID) {
    fetch("https://codecyprus.org/th/api/skip?session=" + sessionID)
        .then(response => response.json())
        .then(responseJSON => {
            console.log(responseJSON + "here");
        });
}









getHuntList();
