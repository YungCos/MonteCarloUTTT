class Game {
	constructor(gameType) {
		this.board = newBoard();
		this.metaBoard = Array(9).fill(Tile.Empty)
		this.currSubBoard = -1 //-1 for all, -2 for none, otherwise this represents board index
		this.gameType = gameType
		this.gameState = GameState.XTurn;
	}
  }

const Tile = {
	Empty: 0,
	X: 1,
	O: 2,
	Draw: 3
};

const GameType = {
	TwoPlayer: 0,
	EasyAI: 1,
	HardAI: 2,
}

const GameState = {
	XTurn: 0,
	OTurn: 1,
	XWin: 2,
	OWin: 3,
	Draw: 4
}

let MetaColor = {}
let isWaiting = false

// const CANVAS_SIZE = 450
const CANVAS_SIZE = Math.min(window.innerWidth - 50, 500);

const third = CANVAS_SIZE/3
const ninth = CANVAS_SIZE/9

let game = new Game(GameType.TwoPlayer)


function newBoard(){
	var arr = Array(9);
	for (var i = 0; i < 9; i++) {
		arr[i] = Array(9).fill(Tile.Empty);
	}
	return arr
}

function drawBoard(){
	background(240);
	noFill();

	//Draw main board
	stroke(0, 0, 0);
	strokeWeight(4)
	line(third, 10, third, CANVAS_SIZE - 10);
	line(2*third, 10, 2*third, CANVAS_SIZE - 10);
	line(10, third, CANVAS_SIZE - 10, third);
	line(10, 2*third, CANVAS_SIZE - 10, 2*third);

	//Draw sub-boards
	for (var x=0; x<=CANVAS_SIZE; x+=third){
		for (var y=0; y<CANVAS_SIZE; y+=third){
			stroke(40, 40, 40);
			strokeWeight(2)
			line(x+ninth, y+10, x+ninth, y+third-10);
			line(x+ninth*2, y+10, x+ninth*2, y+third-10)
			line(x+10, y+ninth, x+third-10, y+ninth);
			line(x+10, y+ninth*2, x+third-10, y+ninth*2)
		}	
	}

	//Draw Xs and Os
	for (var boardIndex=0; boardIndex<9; boardIndex++){
		var boardX = (boardIndex % 3) * third
		var boardY = Math.floor(boardIndex/3) * third
		for (var tile=0; tile<9; tile++){
			var tileX = boardX + (tile % 3) * ninth
			var tileY = boardY + Math.floor(tile/3) * ninth
			var currTile = game.board[boardIndex][tile]
			switch(currTile){
				case Tile.X:
					stroke(0, 0, 255)
					line(tileX+15, tileY+15, tileX+ninth-15, tileY+ninth-15)
					line(tileX+15, tileY+ninth-15, tileX+ninth-15, tileY+15)
					break;
				case Tile.O:
					stroke(255, 0, 0)
					ellipse(tileX + ninth/2, tileY + ninth/2, ninth-20, ninth-20)
					break;
			}
		}
	}
	//Draw metaboard color overlays
	for (var metaIndex=0; metaIndex<9; metaIndex++){
		var metaTileColor = game.metaBoard[metaIndex]
		if (metaTileColor != Tile.Empty || game.currSubBoard == -1 || game.currSubBoard == metaIndex){
			var boardX = (metaIndex%3)*third
			var boardY = Math.floor(metaIndex/3)*third
			noStroke();
			switch (metaTileColor){
				case Tile.X:
					fill(color(0, 0, 255, 100))
					break;
				case Tile.O:
					fill(color(255, 0, 0, 100))
					break;
				case Tile.Default:
					fill(color(128, 128, 128, 100))
					break;
				default:
					fill(color(0, 255, 0, 100))
					break;
			}	
			square(boardX, boardY, third);
		}
	}

}

function evalBoard(board){
	

	for(let i = 0; i < 3; i++){
		//Horizontal check
		if(board[i*3] == board[i*3+1] && board[i*3+1] == board[i*3+2] && board[i*3] != Tile.Empty)
			return board[i*3]
		//Vertical check
		if(board[i] == board[i+3] && board[i+3] == board[i+6] && board[i] != Tile.Empty)
			return board[i]
	}
	//Diagonal checks
	if(board[0] == board[4] && board[4] == board[8] && board[0] != Tile.Empty)
		return board[0]
	if(board[2] == board[4] && board[4] == board[6] && board[2] != Tile.Empty)
		return board[2]
	if (!board.includes(Tile.Empty))
		return Tile.Invalid
	return Tile.Empty
}

function mouseClicked() {
	//Game is already over
	if (game.currSubBoard == -2) return;

	//O's turn and its not a two player game
	if (game.gameState == GameState.OTurn && game.gameType != GameType.TwoPlayer) return;

	//Mouse clicked outside of canvas
	if (mouseX < 0 || mouseX > CANVAS_SIZE || mouseY < 0 || mouseY > CANVAS_SIZE) return;

	//Calculate board and tile index
	var tileX = floor(mouseX/ninth)
	var tileY = floor(mouseY/ninth)
	var boardIndex = floor(tileX/3) + floor(tileY/3)*3
	var tileIndex = tileX % 3 + (tileY % 3)*3
	
	playMove(boardIndex, tileIndex)
}

function playMove(boardIndex, tileIndex){
	// Incorrect subboard
	if (game.currSubBoard != -1 && game.currSubBoard != boardIndex) return;

	// Tile already occupied
	if (game.board[boardIndex][tileIndex] != Tile.Empty) return;

	if (game.gameState == GameState.XTurn){
		game.board[boardIndex][tileIndex] = Tile.X
		game.gameState = GameState.OTurn
	}
	else{
		game.board[boardIndex][tileIndex] = Tile.O
		game.gameState = GameState.XTurn
	}

	game.metaBoard[boardIndex] = evalBoard(game.board[boardIndex])
	switch(evalBoard(game.metaBoard)){
		case Tile.X:
			game.gameState = GameState.XWin
			game.currSubBoard = -2
			break;
		case Tile.O:
			game.gameState = GameState.OWin
			game.currSubBoard = -2
			break;
		case Tile.Invalid:
			game.gameState = GameState.Draw
			game.currSubBoard = -2
	}
	
	//Game is still ongoing, update current subboard
	if (game.gameState == GameState.XTurn || game.gameState == GameState.OTurn ){
		game.currSubBoard = game.metaBoard[tileIndex] == Tile.Empty ? tileIndex : -1
	}

	updateUI(game);
	drawBoard();
	isWaiting = 1
}

function newGame(newType = game.gameType){
	game = new Game(newType)
	updateUI(game)
	drawBoard();
}

function setup() {
	createCanvas(CANVAS_SIZE, CANVAS_SIZE);
	drawBoard();
}

function draw() {
	//Janky solution to get around p5 not drawing until code is run
	//Wait one frame until we run aiMove() 
	if (game.gameType != GameType.TwoPlayer && game.gameState == GameState.OTurn && !isWaiting){
		aiMove();
	}
	else if (isWaiting){
		isWaiting = false
	}
}