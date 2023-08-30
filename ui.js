function updateUI(game){
    const p1Badge = document.getElementById("p1win")
    const p2Badge = document.getElementById("p2win")
    const drawBadge = document.getElementById("draw")
    const turnDisplay = document.getElementById("turn-display")
    p1Badge.style.display = "none";
    p2Badge.style.display = "none";
    drawBadge.style.display = "none";
    switch(game.gameState){
        case GameState.XTurn:
            turnDisplay.innerHTML = "X's Turn"
            turnDisplay.classList.replace("text-bg-danger", "text-bg-primary")
            break;
        case GameState.OTurn:
            turnDisplay.innerHTML = "O's Turn"
            turnDisplay.classList.replace("text-bg-primary", "text-bg-danger")
            break;
        case GameState.XWin:
            p1Badge.style.display = "block";
            break;
        case GameState.OWin:
            p2Badge.style.display = "block";
            break;
        case GameState.Draw:
            drawBadge.style.display = "block";
            break;
    }
}

function changeGameType(info){
    switch(info.value){
        case "ai":
            newGame(GameType.HardAI)
            break;
        case "twoPlayer":
            newGame(GameType.TwoPlayer)
            break;
    }
}