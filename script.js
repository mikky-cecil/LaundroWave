class GridObjectShape extends createjs.Shape {
	constructor(objId){
		super();
		this.objectId = objId;
		this.working = true;
	}
}

class UI{
	constructor(game){
		this.grid = Laundromat.newEmptyLayout(20, 20);
		this.game = game;
		this.gridShapes = [];
	}

	gridWidth(){
		return this.grid.length;
	}
	gridHeight(){
		return this.grid[0].length;
	}

	initUI(canvasId){
		this.gameScreen = new createjs.Stage(canvasId);

		this.gridSquareSize = (this.gameScreen.canvas.height * .9) / this.gridHeight();
		var gridTopMargin = this.gameScreen.canvas.height * .05;
		var gridLeftMargin = this.gameScreen.canvas.height * .05;
		var gridWidth = this.gridWidth() * this.gridSquareSize;
		var gridHeight = this.gridHeight() * this.gridSquareSize

		this.layoutSquare = new createjs.Shape();
		this.layoutSquare.setBounds(gridLeftMargin, gridTopMargin, gridWidth, gridHeight);
		this.layoutSquare.graphics.beginFill("Blue")
			.drawRect(gridLeftMargin, gridTopMargin, gridWidth, gridHeight);

		this.gameScreen.addChild(this.layoutSquare);

		this.gameScreen.update();
		
		// createjs.Ticker.setFPS(60);
		// createjs.Ticker.addEventListener("tick", stage);
		
	}

	createObjectShape(objectId, top, left, working = true){
		var obj = this.game.laundromat.findMachine(objectId);
		var objShape = new GridObjectShape(objectId);
		objShape.working = working;

		var color;
		if (!working){
			color = "Red";
		}else if (objectId.startsWith("C")){
			color = "Green";
		}else if (objectId.startsWith("W")){
			color = "Turquoise";
		}else if (objectId.startsWith("D")){
			color = "Purple";
		}
		objShape.graphics.beginFill(color);

		var gridBounds = this.layoutSquare.getBounds();
		console.log(gridBounds);
		objShape.x = left;
		objShape.y = top;

		console.log("Creating a shape with coordinates (" + objShape.x + ", " + objShape.y + ")");

		objShape.graphics.drawRect(
			gridBounds.x + (this.gridSquareSize * objShape.x), 
			gridBounds.y + (this.gridSquareSize * objShape.y), 
			this.gridSquareSize * obj.width, 
			this.gridSquareSize * obj.height);

		this.gridShapes.push(objShape);
		return objShape;
	}

	findObjectShape(objectId){
		return this.gridShapes.find(function(shape){
			return (shape.objectId == objectId);
		});
	}

	updateGrid(){
		console.log("layout has changed, need to update UI.");
		this.grid = this.game.laundromat.layout;

		for (var i = 0; i < this.gridWidth(); i++){
			for (var j = 0; j < this.gridHeight(); j++){
				// no object or blocked
				if (this.grid[i][j] == -1 || this.grid[i][j] == 1){
					continue;
				}
				console.log(this.gameScreen);
				this.gameScreen.addChild(this.createObjectShape(this.grid[i][j], i, j));
			}
		}
		this.gameScreen.update();
	}

	updateLayout(){
		console.log("UI has changed the layout, game needs to be updated.");
	}

	updateMachine(machine){
		var shape = this.findObjectShape(machine.objectId);

		if (shape.working && !machine.working){
			this.gameScreen.removeChild(shape);
			this.gridShapes = this.gridShapes.filter(function (shape){
				return shape.objectId != machine.objectId;
			});
			this.gameScreen.addChild(this.createObjectShape(machine.objectId, shape.x, shape.y, false));
			
			this.gameScreen.update();
		}else if (!shape.working && machine.working){
			this.gameScreen.removeChild(shape);
			this.gridShapes = this.gridShapes.filter(function(shape){
				return shape.objectId != machine.objectId;
			});
			this.gameScreen.addChild(this.createObjectShape(machine.objectId, shape.x, shape.y, true));
			
			this.gameScreen.update();
		}
		console.log(this.gridShapes);
	}

	handleChangeEvent(changeMachineId, change){
		this.game.laundromat.findMachine(changeMachineId).addChange(change);
	}
}
var game;

function initGameAndUI(){
	game = new Game();
}