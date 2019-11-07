let sessionID;
let numOfQuestions;

async function getHuntList() {
    fetch("https://codecyprus.org/th/api/list")
        .then(response => response.json())
        .then(responseJSON => {
            for (let treasureHunt of responseJSON.treasureHunts) {
                let huntList = document.getElementById("huntList");

                //Create and append hunt name
                let nameElement = document.createElement("li");
                huntList.appendChild(nameElement);
                nameElement.innerHTML = ("<a href='#' onclick='startSession(\"" + treasureHunt.uuid + "\")' alt='Treasure hunt " + treasureHunt.name + "'>" + treasureHunt.name + "</a>")

                //Create and append sublist for hunt info
                let subList = document.createElement("ul");
                huntList.appendChild(subList);

                //Append hunt info
                subList.innerHTML += ("<li><b>Description: </b>" + treasureHunt.description + "</li>");
                subList.innerHTML += ("<li><b>Starts On: </b>" + timestampFromEpoch(treasureHunt.startsOn) + "</li>");
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

async function startSession(uuid) {
    fetch("https://codecyprus.org/th/api/start?player=" + "boi2" + "&app=dac-app&treasure-hunt-id=" + uuid)
        .then(response => response.json()).then(responseJSON => {
            if (responseJSON.status !== "ERROR") {
                sessionID = responseJSON.session;
                numOfQuestions = responseJSON.numOfQuestions;
                prepareQuestionPage(sessionID);
            } else {
                let errorString = "";
                for (let errorMessage of responseJSON.errorMessages) {
                    errorString += errorMessage;
                }
                alert(errorString);
            }

        });
}

function prepareQuestionPage(session) {
    let body = document.getElementsByTagName("body")[0];
    body.innerHTML = "";
    let questionName = document.createElement("h1");
    let answerList = document.createElement("ol");
    let answerField = document.createElement("div");
    questionName.innerText = "Question name";
    answerList.innerHTML = "<li>answer1</li><li>answer2</li>";
    answerField.innerHTML = "<button>Yeet</button><button>Yeet2</button>"
    body.appendChild(questionName);
    body.appendChild(answerList);
    body.appendChild(answerField);
}

getHuntList();