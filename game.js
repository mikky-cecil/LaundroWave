class Laundromat {
	constructor(){
		this.money = 0;
		this.rent = 0;
		this.machines = {
			"washers": [],
			"dryers" : [],
			"changeMachines": []
		};
		this.layout = Laundromat.newEmptyLayout(20, 20);
	}

	static newEmptyLayout(width, height){
		var layout = [];
		for (var i = 0; i < width; i++){
			var column = [];
			for (var j = 0; j < height; j++){
				column.push(-1);
			}
			layout.push(column);
		}

		return layout;
	}

	setMoney(money){
		this.money = money;
		game.ui.updateFundsDisplay();
	}

	addMachineToLayout(machine, x, y){
		// First check to make sure nothing else is in the way
		var blocked = false;
		for (var i = x; i < x + machine.width; i++){
			for (var j = y; j < y + machine.height; j++){
				if (this.layout[i][j] != -1){
					blocked = true;
					return false;
				}
			}
		}

		// If no block, place the object
		this.layout[x][y] = machine.objectId;
		// Add blocks if object is larger than 1x1
		for (var i = x + 1; i < x + machine.width; i++){
			for (var j = y + 1; j < y + machine.height; j++){
				this.layout[i][j] = 1;
			}
		}
		return true;
	}

	payRent(){
		// let player go into the negatives for now, will implement debt handling later
		this.setMoney(this.money - this.rent);
	}

	findMachine(machineId){
		var list = [];
		if (machineId.startsWith("W")){
			list = this.machines.washers;
		}else if (machineId.startsWith("D")){
			list = this.machines.dryers;
		}else if (machineId.startsWith("C")){
			list = this.machines.changeMachines;
		}

		return list.find(function(machine){
			return (machine.objectId == machineId);
		});
	}

	// findMachineCoordinates(machineId){
	// 	for (var i = 0; i < this.layout.length){
	// 		for (var j = 0; j < this.layout[0].length){
	// 			if (this.layout[i][j] == machineId){
	// 				return new Point(i, j);
	// 			}
	// 		}
	// 	}
	// }

	addMachine(list, newMachine){
		list.push(newMachine);
		return newMachine.objectId;
	}

	addChangeMachine(){
		return this.addMachine(this.machines.changeMachines, new ChangeMachine(this));
	}

	addWasher(){
		return this.addMachine(this.machines.washers, new Washer(this));

	}

	addDryer(){
		return this.addMachine(this.machines.dryers, new Dryer(this));
	}	
}

class Customer {
	constructor(laundromat){
		this.money = 20;
		this.usableMoney = 0;
		this.loads = [];
		this.loads.push(new Load());
		this.loads.push(new Load());
		this.hasLeft = false;
		
		this.doLaundry(laundromat);
	}

	doLaundry(laundromat){
		if (!laundromat.machines.changeMachines[0].giveChange(this, 4)){
			this.leave("couldn't get change");
			return;
		}
		if (!laundromat.machines.washers[0].wash(this, this.loads[0])){
			this.leave("couldn't wash clothes");
			return;
		}
		if (!laundromat.machines.dryers[0].dry(this, this.loads[0])){
			this.leave("couldn't dry clothes");
			return;
		}
		console.log("Customer is happy!");
		this.hasLeft = true;
	}

	leave(message){
		console.log("Customer has left. " + message);
		this.hasLeft = true;
	}
}

class Load {
	constructor(){
		this.washed = false;
		this.dried = false;
	}
}

class Game {
	constructor(){
		this.month = 1;
		this.day = 1;
		this.hour = 8;
		this.minute = 0;
		this.speed = 1000; //milliseconds per hour

		this.laundromat = new Laundromat();
		this.setupGame();
		this.startTime();

		this.ui = new UI(this);
		this.ui.initUI("demoCanvas");
		this.ui.updateGrid();
		this.ui.updateFundsDisplay(this);
	}

	setupGame(){
		this.laundromat.money = 6000;
		this.laundromat.rent = 500;
		
		var changeMachineId = this.laundromat.addChangeMachine();
		var changeMachine = this.laundromat.findMachine(changeMachineId);
		changeMachine.addChange(50);
		this.laundromat.addMachineToLayout(changeMachine, 0, 0);
		// this.laundromat.machines.changeMachines[0].addChange(this.laundromat, 50);
		
		var washerId = this.laundromat.addWasher();
		var washer = this.laundromat.findMachine(washerId);
		this.laundromat.addMachineToLayout(washer, 0, 2);
		var dryerId = this.laundromat.addDryer();
		var dryer = this.laundromat.findMachine(dryerId);
		this.laundromat.addMachineToLayout(dryer, 0, 5);
		// this.laundromat.machines.washers.push(new Washer(this.laundromat));
		// this.laundromat.machines.dryers.push(new Dryer(this.laundromat));
		
		this.customers = [];

		console.log("Congrats, you now own a laundromat! Your rent is $500/month, and you own 3 machines: a change machine, a washer, and a dryer. You have $6,000 saved up just for this laundromat. Good luck!");
		console.log(this.laundromat.machines.washers[0]);
		console.log(this.laundromat.machines.dryers[0]);
		console.log(this.laundromat.machines.changeMachines[0]);
	}

	startTime(){
		var _this = this;
		this.interval = window.setInterval(function(){
			_this.gameLoop();
		}, this.speed);
	}

	pauseTime(){
		window.clearInterval(this.interval);
	}

	adjustTimeSpeed(speed){
		this.speed = speed;
		this.pauseTime();
		this.startTime();
	}

	passTime(tickSize){
		// this.minute += 10;
		// if (this.minute == 60){
		// 	this.hour++;
		// 	this.minute = 0;
		// }
		this.hour += tickSize;
		if (this.hour == 22){
			this.day++;
			this.hour = 8;
		}
		if (this.day == 31){
			this.month++;
			this.day = 1;
		}
	}

	gameLoop(){
		var tickSize = 1; // hr
		this.passTime(tickSize);
		this.ui.updateTimeDisplay();

		// Pay rent once a month
		if (this.day == 1 && this.hour == 8 && this.minute == 0){
			this.laundromat.payRent();
			this.ui.addAlertToAlertSpace(
				"Rent paid on " + this.month + "/" + this.day + " (-$" + this.laundromat.rent + ")", 
				"alert-info");
		}

		// Pass time on machines
		var machines = this.laundromat.machines.washers.concat(this.laundromat.machines.dryers);
		for (var i = 0; i < machines.length; i++){
			machines[i].passTime(tickSize);
		}

		// Add customers
		if (this.hour % 2 == 0){
			this.customers.push(new Customer(this.laundromat));
		}

		// Remove customers that have left
		this.customers = this.customers.filter(function(c){
			return !c.hasLeft;
		});

		// Debug
		console.log(this.month + "/" + this.day + ": You have $" + this.laundromat.money);
	}

}






