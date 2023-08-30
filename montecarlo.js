const ITERATIONS = 2000
const WIN_FAVORABILITY_CONSTANT = 3 // wins are values c times more than draws
const EXPLORATION_PARAMETER = Math.sqrt(2)

class MCTNode {
    constructor(boardIndex, tileIndex, parent=null) {
        this.boardIndex = boardIndex;
        this.tileIndex = tileIndex;
        this.wins = 0
        this.draws = 0
        this.total = 0
        this.children = [];
        this.parent = parent;
    }

    addWin(){
        this.wins += 1
        this.total += 1
    }

    addDraw(){
        this.draws += 1
        this.total += 1
    }
}

 
function aiMove(){
    //randomAI()
    johnBot()
}

function randomAI(){
    var move = randomMove(game)
    playMove(move.boardIndex, move.tileIndex)
}

function johnBot(){
    var move = monteCarloSim(game)
    playMove(move.boardIndex, move.tileIndex)
}

function possibleMoves(currGame){
    var res = []
    var possibleBoards = []
    if (currGame.currSubBoard == -1){
        var possibleBoards = []
        for(var i = 0; i < 9; i++){
            if (currGame.metaBoard[i] == Tile.Empty) possibleBoards.push(i);
        }
    }
    else{
        possibleBoards = [currGame.currSubBoard]
    }
    for(var tileIndex = 0; tileIndex < 9; tileIndex++){
        for (var j = 0; j < possibleBoards.length ; j++){
            if (currGame.board[possibleBoards[j]][tileIndex] == Tile.Empty)
            res.push({
                boardIndex: possibleBoards[j],
                tileIndex: tileIndex
            })
        }
    }
    return res;

}

function randomMove(currGame){
    var allMoves = possibleMoves(currGame)
    var randomInd = Math.floor(Math.random() * allMoves.length)
    return allMoves[randomInd]
}

function simulateGame(currentGame){
    for (var i = 0; i < 81; i++){

        var move = randomMove(currentGame);
        //No move can be made this means the game ended in draw
        if (move == null){
            return Tile.Invalid
        }   
        simulateMove(currentGame, move.boardIndex, move.tileIndex)
    
        var gameResult = evalBoard(currentGame.metaBoard)
        if (gameResult != Tile.Empty)
            return gameResult
    }

    throw new console.error("Game simulation took over 81 moves (what)");
}

function simulateMove(currentGame, boardIndex, tileIndex){
    if (currentGame.gameState == GameState.XTurn){
        currentGame.board[boardIndex][tileIndex] = Tile.X
        currentGame.gameState = GameState.OTurn
    }
    else{
        currentGame.board[boardIndex][tileIndex] = Tile.O
        currentGame.gameState = GameState.XTurn
    }

    currentGame.metaBoard[boardIndex] = evalBoard(currentGame.board[boardIndex])
    currentGame.currSubBoard = currentGame.metaBoard[tileIndex] == Tile.Empty ? tileIndex : -1
}


function monteCarloSim(currentGameState){
    var root = new MCTNode(-1, -1)

    for (var i = 0; i < ITERATIONS; i++){
        var newGame = structuredClone(currentGameState)
        //Selection
        var curr = root
        while (curr.children.length > 0){
            curr = selectPath(curr)
            simulateMove(newGame, curr.boardIndex, curr.tileIndex)
        }

        //Expansion
        var newMoves = possibleMoves(newGame)
        var wins = 0
        var draws = 0
        newMoves.forEach(move => {
            var newChild = new MCTNode(move.boardIndex, move.tileIndex, curr)
            newChild.total = 1
            curr.children.push(newChild)
            //Simulation

            var branchedGame = structuredClone(newGame)
            simulateMove(branchedGame, move.boardIndex, move.tileIndex)
            var result = simulateGame(branchedGame)

            switch(result){
                case Tile.O:
                    wins += 1
                    newChild.addWin()
                    break;
                case Tile.Invalid:
                    draws += 1
                    newChild.addDraw()
                    break;
            }

            //

        })

        //Backpropegation
        
        while (curr != null){
            curr.wins += wins
            curr.draws += draws
            curr.total += newMoves.length
            curr = curr.parent
        }
    }

    //Pick best option
    var bestNode = root.children.reduce((max, n) => calcScore(n) > calcScore(max) ? n : max, root.children[0]);
    return {
        boardIndex: bestNode.boardIndex,
        tileIndex: bestNode.tileIndex
    }
}

function calcScore(node){
    return (node.wins + node.draws * (1/WIN_FAVORABILITY_CONSTANT)) / node.total
}

function explore(node){
    return calcScore(node) + EXPLORATION_PARAMETER * Math.sqrt(Math.log(node.parent.total)/node.total)
}

function selectPath(root){
    return root.children.reduce((max, n) => explore(n) > explore(max) ? n : max, root.children[0]);
}

