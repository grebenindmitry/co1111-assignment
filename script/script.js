const API = "https://codecyprus.org/th/api"
let sessionID = "";


async function getHuntList() {
    fetch(API + "/list")
        .then(response => response.json())
        .then(responseJSON => {
            let i = 0;
            for (let treasureHunt of responseJSON.treasureHunts) {
                let huntList = document.getElementById("huntList");
                let dateObj = new Date(treasureHunt.startsOn);
                let dateOptions = {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }

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
                subList.innerHTML += ("<li><b>Starts On: </b>" + dateObj.toLocaleDateString('en-US', dateOptions) + "</li>");
                i++;

            }
        });
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
    // getQuestion();
}

function enterUsername(uuid, targetID) {
    let target = document.getElementById(targetID);
    if (document.getElementById('inputBox') !== null) {
        document.getElementById('inputBox').remove();
    }
    usernameInput = document.createElement("div");
    usernameInput.id = "inputBox";
    usernameInput.style.display = "inline-block";
    usernameInput.style.marginLeft = "10px";
    usernameInput.innerHTML =   "<form action='javascript:startSession(\"" + uuid + "\")'>" +
                                    "<fieldset>" +
                                        "<legend>Username:</legend>" +
                                        "<input id='usernameBox' type='text'></input>" + 
                                        "<input type='submit' class='button'></button>" +
                                        "<span id='errorBox' class='disable' style='padding:2px; margin-left: 10px'></span>" + 
                                    "</fieldset>" +
                                "</form>";
    target.appendChild(usernameInput);
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

                if (jsonResponse.canBeSkipped === true) {
                    let skipBox = document.createElement("BUTTON");
                    skipBox.id = "skipBox";
                    skipBox.classList.add('button');
                    skipBox.innerText="SKIP";
                    document.body.appendChild(skipBox);
                    document.getElementById("skipBox").value="SKIP";
                    document.getElementById("skipBox").name="SKIP";

                    skipBox.addEventListener('click', function(event) {skipQuestion();});
                } else {
                    let errorSkip = document.createElement("p");
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

                        booleanButtonFalse.classList.add('button');
                        booleanButtonTrue.classList.add('button');

                        booleanButtonTrue.addEventListener('click', function(event) {sendAnswer('true');});
                        booleanButtonFalse.addEventListener('click', function(event) {sendAnswer('false');});

                        body.appendChild(booleanButtonTrue);
                        body.appendChild(booleanButtonFalse);
                        break;

                    case "INTEGER":
                        let integerTextBox = document.createElement('input');
                        integerTextBox.type = "number";

                        let integerSubmitButton = document.createElement('button');
                        integerSubmitButton.classList.add('button');
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
                        numericSubmitButton.classList.add('button');
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

                        mcqA.classList.add('button');
                        mcqB.classList.add('button');
                        mcqC.classList.add('button');
                        mcqD.classList.add('button');

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
                        textSubmitButton.classList.add('button');
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

function handleEnter(event) {
    if (event.code == "Enter" || event.code == "NumpadEnter") {
        document.getElementById('numberButton').click();
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


function skipQuestion() {
    fetch("https://codecyprus.org/th/api/skip?session=" + sessionID)
        .then(response => response.json())
        .then(responseJSON => {
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
    console.log('end');
}

getHuntList();
