async function getHuntList() {
    fetch("https://codecyprus.org/th/api/list")
        .then(response => response.json())
        .then(responseJSON => {
            for (let treasureHunt of responseJSON.treasureHunts) {
                let huntList = document.getElementById("huntList");

                //Create and append hunt name
                let nameElement = document.createElement("li");
                huntList.appendChild(nameElement);
                nameElement.innerHTML = ("<a onclick='startSession(\"" + treasureHunt.uuid + "\")' href='https://codecyprus.org/th/api/start?player=Homer&app=simpsons-app&treasure-hunt-id=" +
                treasureHunt.uuid + "' alt='Treasure hunt " + treasureHunt.name + "'>" + treasureHunt.name + "</a>");

                //enter username if the user click to this link

              function getUsername(){

                var username = prompt("enter username");
                if (username != null){
                    document.getElementById("huntList").innerHTML = username;
                }
              }



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

getHuntList();