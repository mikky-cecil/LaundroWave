var game;

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

	static createAlert(message, colorClass){
		var closeX = $( document.createElement("span") );
		closeX.attr({
			"aria-hidden": "true"
		}).text("\u02DF");

		var button = $( document.createElement("button") );
		button.addClass("button")
			.addClass("close")
			.addClass("fade")
			.attr({
				"data-dismiss": "alert",
				"aria-label": "close"
			})
			.append(closeX);

		var alert = $( document.createElement("div") );
		alert.addClass("alert")
			.addClass(colorClass)
			.addClass("alert-dismissable")
			.text(message)
			.append(button);

		return alert;
	}

	gridWidth(){
		return this.grid.length;
	}
	gridHeight(){
		return this.grid[0].length;
	}

	initUI(canvasId){
		this.gameScreen = new createjs.Stage(canvasId);

		// Create laundromat grid
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

		// Create 

		this.gameScreen.update();
		
		// createjs.Ticker.setFPS(60);
		// createjs.Ticker.addEventListener("tick", stage);
		
	}

	createObjectShape(objectId, top, left, working = true){
		var obj = this.game.laundromat.findMachine(objectId);
		var objShape = new GridObjectShape(objectId);
		objShape.working = working;
		var _this = this;
		objShape.addEventListener("click", function(event){
			_this.displayObjectInfo(objectId);
		});

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
		objShape.x = left;
		objShape.y = top;

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
		this.grid = this.game.laundromat.layout;

		for (var i = 0; i < this.gridWidth(); i++){
			for (var j = 0; j < this.gridHeight(); j++){
				// no object or blocked
				if (this.grid[i][j] == -1 || this.grid[i][j] == 1){
					continue;
				}
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
	}

	isObjectDisplayed(objectId){
		var machine = this.game.laundromat.findMachine(objectId);

		if ($("#displayInfo").data("objectId") == objectId){
			return true;
		}
		return false;
	}

	displayObjectInfo(machineId){
		var machine = this.game.laundromat.findMachine(machineId);

		$("#displayInfo>.card-body>p").text(machineId);
		$("#displayInfo").data("objectId", machineId);

		if (machine.objectId.startsWith("C")){
			$("#displayInfo>.card-body>.card-title").text("Change Machine");
			$("#displayInfo>.card-body>p").html("<b>Current Change:</b> " + machine.currentChange);
			$("#objectActionButton").text("Add Change").show().click(function(){
				 $("#addChangeModal").modal("show");
				 $("#addChangeModal form #machineId").val(machineId);
			});
		}else if (machine.objectId.startsWith("W")){
			$("#displayInfo>.card-body>.card-title").text("Washing Machine");
			$("#objectActionButton").hide();
		}else if (machine.objectId.startsWith("D")){
			$("#displayInfo>.card-body>.card-title").text("Dryer");
			$("#objectActionButton").hide();
		}

		$("#displayInfo").show();
	}

	updateFundsDisplay(game){
		$("#currentFunds").text(game.laundromat.money);
	}
}

function initGameAndUI(){
	game = new Game();
	$("#startButton").hide();
	$("#pauseButton").show();
}

function pauseGame(){
	game.pauseTime();
	$("#pauseButton").hide();
	$("#continueButton").show();
}

function continueGame(){
	game.startTime();
	$("#pauseButton").show();
	$("#continueButton").hide();
}

function addChangeButton(){
	var change = parseFloat($("#addChangeForm #changeToAdd").val());
	var machineId = $("#addChangeForm #machineId").val();

	if (game.laundromat.findMachine(machineId).addChange(change)){
		$("#addChangeModal").modal("hide");
		// $("#addChangeResultModal").modal("show");
		// $("#addChangeResultModal .modal-body").text("Success!");
		$("#alertSpace").prepend(UI.createAlert("Added $" + change + " to the change machine.", "alert-success"));
		game.ui.displayObjectInfo(machineId);
	}else{
		$("#addChangeModal").modal("hide");
		// $("#addChangeResultModal").modal("show");
		// $("#addChangeResultModal .modal-body").text("Not enough cash!");
	}

}