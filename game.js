class Laundromat {
	constructor(){
		this.money = 0;
		this.rent = 0;
		this.machines = {
			"washers": [],
			"dryers" : [],
			"changeMachines": []
		};
		// this.layout = Laundromat.newEmptyLayout(50, 50);
	}

	// static newEmptyLayout(width, height){
	// 	var layout = [];
	// 	for (var i = 0; i < width; i++){
	// 		var column = [];
	// 		for (var j = 0; j < height; j++){
	// 			column.push(-1);
	// 		}
	// 		layout.push(column);
	// 	}

	// 	return layout;
	// }

	payRent(){
		// let player go into the negatives for now, will implement debt handling later
		this.money -= this.rent;
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
		}
		if (!laundromat.machines.washers[0].wash(laundromat, this, this.loads[0])){
			this.leave("couldn't wash clothes");
		}
		if (!laundromat.machines.dryers[0].dry(laundromat, this, this.loads[0])){
			this.leave("couldn't dry clothes");
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

var idCounter = 0;

class Machine {
	constructor(){
		this.objectId = Machine.newId();
		this.name = "";
		this.cost = 0;
		this.working = true;
		this.timeUntilFree = 0;
		this.duration = 0;
	}

	static newId(){
		idCounter++;
		return idCounter;
	}

	payMachine(laundromat, customer){
		if (customer.usableMoney >= this.cost){
			customer.usableMoney -= this.cost;
			laundromat.usableMoney += this.cost;
			return true;
		}else{
			return false;
		}
	}

	passTime(time){
		if (this.duration == 0 || this.timeUntilFree == 0){
			return;
		}
		this.timeUntilFree -= time;
	}
}

class Washer extends Machine {
	constructor(){
		super();
		this.name = "washer";
		this.duration = 3;
		this.cost = 2;
	}

	wash(laundromat, customer, load){
		if (this.working && this.timeUntilFree == 0 && super.payMachine(laundromat, customer)){
			load.washed = true;
			this.timeUntilFree = this.duration;
			return true;
		}else{
			return false;
		}
	}
}

class Dryer extends Machine {
	constructor(){
		super();
		this.name = "dryer";
		this.duration = 3;
		this.cost = 2;
	}

	dry(laundromat, customer, load){
		if (!load.washed){
			return false;
		}

		if (this.working && this.timeUntilFree == 0 && super.payMachine(laundromat, customer)){
			load.dried = true;
			this.timeUntilFree = this.duration;
			return true;
		}else{
			return false;
		}
	}
}

class ChangeMachine extends Machine {
	constructor(){
		super();
		this.name = "change machine";
		this.capacity = 500;
		this.currentChange = 0;
	}

	addChange(laundromat, change){
		if (change <= laundromat.money){
			laundromat.money -= change;
			this.currentChange += change;
			if (this.currentChange > 0){
				this.working = true;
			}
			return true;
		}else{
			return false;
		}
	}

	giveChange(customer, change){
		if (change <= this.currentChange){
			this.currentChange -= change;
			customer.usableMoney += change;
			return true;
		}else{
			this.working = false;
			return false;
		}
	}

}

class Game {
	constructor(){
		this.month = 1;
		this.day = 1;
		this.hour = 8;
		this.minute = 0;

		this.laundromat = new Laundromat();
		this.laundromat.money = 6000;
		this.laundromat.rent = 500;
		this.laundromat.machines.changeMachines.push(new ChangeMachine());
		this.laundromat.machines.changeMachines[0].addChange(this.laundromat, 50);
		this.laundromat.machines.washers.push(new Washer());
		this.laundromat.machines.dryers.push(new Dryer());
		this.customers = [];

		console.log("Congrats, you now own a laundromat! Your rent is $500/month, and you own 3 machines: a change machine, a washer, and a dryer. You have $6,000 saved up just for this laundromat. Good luck!");

		this.speed = 100;

		var _this = this;
		this.interval = window.setInterval(function(){
			_this.gameLoop();
		}, this.speed);
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

		// Pay rent
		if (this.day == 1 && this.hour == 8 && this.minute == 0){
			this.laundromat.payRent();
			console.log("Rent paid on " + this.month + "/" + this.day);
		}

		// Pass time on machines
		var machines = this.laundromat.machines.washers.concat(this.laundromat.machines.dryers);
		for (var i = 0; i < machines.length; i++){
			machines[i].passTime(tickSize);
			console.log(machines[i]);
		}

		// Add customers
		if (this.hour % 2 == 0){
			this.customers.push(new Customer(this.laundromat));
		}

		this.customers = this.customers.filter(function(c){
			return !c.hasLeft;
		});

		console.log(this.month + "/" + this.day + ": You have $" + this.laundromat.money);
	}

}

function initGame(){
	var game = new Game();
}








