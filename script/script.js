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
                let subList = document.createElement("ul");
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
                prepareQuiz();
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
        if (event.keyCode == 13) {
            document.getElementById('submitButton').click();
        }
        });
}

function prepareQuiz() {
    console.log(sessionID);
    fetch(API + "/question?session=" + sessionID)
        .then(response => response.json())
        .then(jsonResponse => {
            if (jsonResponse.status === "ERROR") {
                let errorMessageList = "";
                for (let errorMessage of jsonResponse.errorMessages) {
                    errorMessageList += errorMessage + "\n";
                }
                alert(errorMessageList);
            } else {
                //Wipe the screen
                document.getElementsByTagName('body')[0].innerHTML = "<input type='number'></input>";
            }
        });
}

getHuntList();