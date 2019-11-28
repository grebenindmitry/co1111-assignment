function testingLeaderboard() {
    fetch("https://codecyprus.org/th/test-api/leaderboard?sorted&hasPrize&size=42")
        .then(response => response.json())
        .then(responseJSON => {

            let score = responseJSON.leaderboard;

            let size = 42;
            let hasPrize = responseJSON.hasPrize;
            console.log(responseJSON);
            let tableOfScores = "<table>";

            console.log(size);


            for (let i=0; i < size; i++ )
            {
                tableOfScores += "<tr>" +
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

//document.getElementById('testBtn').addEventListener("click", function() {

    testingLeaderboard();
//})




