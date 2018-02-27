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

	get alertSpace(){
		return $("#alertSpace");
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

		var card = "#displayInfo";
		var title = "#displayInfo>.card-header .card-title";
		var info = "#displayInfo>.card-body";
		var footer = "#displayInfo>.card-footer";
		var actionButton = "#objectActionButton";
		var actionButtonContainer = "#displayInfo>.card-footer";

		// Clear old stuff
		$("#needsServiceBadge, #inUseBadge").hide();
		$(actionButton).off("click");

		// Every machine needs this
		$(title).text(machine.name);
		$(card).data("objectId", machineId);
		$(info).html("<b>Current Change:</b> " + machine.currentChange);
		if (!machine.working){
			$("#needsServiceBadge").show();
		}

		// Different for each type of machine
		if (machine.objectId.startsWith("C")){
			$(actionButtonContainer).show();
			$(actionButton).text("Add Change").show().click(function(){
				 $("#addChangeModal").modal("show");
				 $("#addChangeModal form #machineId").val(machineId);
			});
			$(actionButton).attr({disabled: false});
		}else if (machine.objectId.startsWith("W") || machine.objectId.startsWith("D")){
			if (machine.timeUntilFree > 0){
				$("#inUseBadge").text(machine.timeUntilFree + ":00").show();
				// $(info).append("<br><b>Time left:</b> " + machine.timeUntilFree);
			}
			var _this = this;
			$(actionButton).text("Collect Change").show().click(function(){
				var change = machine.collectChange();
				_this.addAlertToAlertSpace("Collected $" + change + " from " + machine.name, "alert-success");
				console.log("Collecting change!");
			});
			if (machine.currentChange < 1){
				$(actionButton).attr({disabled: true});
			}else{
				$(actionButton).attr({disabled: false});
			}
		}

		$(card).show();
	}

	updateFundsDisplay(){
		$("#currentFunds").text(this.game.laundromat.money);
	}

	updateTimeDisplay(){
		$("#displayDate").text(this.game.month + "/" + this.game.day);
		var timeText;
		var hour;
		var minute = (this.game.minute < 10) ? "0" + this.game.minute : this.game.minute;
		var suffix;
		if (this.game.hour < 10){
			suffix = "AM";
			hour = " " + this.game.hour;
		}else if(this.game.hour < 12){
			suffix = "AM";
			hour = this.game.hour;
		}else if (this.game.hour == 12){
			suffix = "PM";
			hour = this.game.hour;
		}else if(this.game.hour < 22){
			suffix = "PM";
			hour = " " + this.game.hour % 12;
		}else{
			suffix = "PM";
			hour = this.game.hour % 12;
		}
		timeText = hour + ":" + minute + suffix;

		var newTimeText = timeText.replace("0", "O");
		while (newTimeText != timeText){
			timeText = newTimeText;
			newTimeText = newTimeText.replace("0", "O");
		}
		$("#displayTime").text(newTimeText);
	}

	addAlertToAlertSpace(message, colorClass){
		this.alertSpace.prepend(UI.createAlert(message, colorClass));
	}
}

var speedButtons = ["#pauseButton", "#continueButton", "#fastButton", "#fasterButton"];

function showAllSpeedButtons(){
	for (var i = 0; i < speedButtons.length; i++){
		console.log("showing button: " + speedButtons[i]);
		$(speedButtons[i]).show();
	}
}

function disableOnlyOneSpeedButton(buttonId){
	for (var i = 0; i < speedButtons.length; i++){
		var disabled = false;
		if (speedButtons[i] == buttonId){
			disabled = true;
		}
		$(speedButtons[i]).attr('disabled', disabled);
	}
}

function initGameAndUI(){
	game = new Game();
	$("#startButton").hide();
	showAllSpeedButtons();
	disableOnlyOneSpeedButton("#continueButton");
	$("#displayDate, #displayTime, #displayMoney").show();
}

function pauseGame(){
	game.pauseTime();
	disableOnlyOneSpeedButton("#pauseButton");
}

function fastForward(){
	adjustGameSpeed(300);
	disableOnlyOneSpeedButton("#fastButton");
}

function fasterForward(){
	adjustGameSpeed(100);
	disableOnlyOneSpeedButton("#fasterButton");
}

function continueGame(){
	game.speed = 1000;
	game.startTime();
	disableOnlyOneSpeedButton("#continueButton");
}

function adjustGameSpeed(speed){
	game.adjustTimeSpeed(speed);
}

function addChangeButton(){
	var change = parseFloat($("#addChangeForm #changeToAdd").val());
	var machineId = $("#addChangeForm #machineId").val();

	if (game.laundromat.findMachine(machineId).addChange(change)){
		$("#addChangeModal").modal("hide");
		game.ui.addAlertToAlertSpace("Added $" + change + " to the change machine.", "alert-success");
		game.ui.displayObjectInfo(machineId);
	}else{
		$("#addChangeModal").modal("hide");
		game.ui.addAlertToAlertSpace("Couldn't add change. Not enough funds.", "alert-danger");
	}

}