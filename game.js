class Laundromat {
	constructor(){
		this.money = 0;
		this.rent = 0;
		this.machines = [];
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
	constructor(){
		this.money = 20;
		this.usableMoney = 0;
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
	}

	static newId(){
		idCounter++;
		return idCounter;
	}

	performAction(laundromat, customer){
		if (customer.usableMoney >= this.cost){
			customer.usableMoney -= this.cost;
			laundromat.usableMoney += this.cost;
			return true;
		}else{
			return false;
		}
	}
}

class Washer extends Machine {
	constructor(){
		super();
		this.name = "washer";
		this.timeUntilFree = 0;
		this.duration = 40;
	}

	performAction(laundromat, customer, load){
		if (super.performAction(laundromat, customer)){
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
		this.timeUntilFree = 0;
		this.duration = 60;
	}

	performAction(laundromat, customer, load){
		if (!load.washed){
			return false;
		}

		if (super.performAction(laundromat, customer)){
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
		this.laundromat.machines.push(new ChangeMachine());
		this.laundromat.machines.push(new Washer());
		this.laundromat.machines.push(new Dryer());

		console.log("Congrats, you now own a laundromat! Your rent is $500/month, and you own 3 machines: a change machine, a washer, and a dryer. You have $6,000 saved up just for this laundromat. Good luck!");

		this.speed = 100;

		var _this = this;
		this.interval = window.setInterval(function(){
			_this.gameLoop();
		}, this.speed);
	}

	passTime(){
		// this.minute += 10;
		// if (this.minute == 60){
		// 	this.hour++;
		// 	this.minute = 0;
		// }
		this.hour++;
		if (this.hour == 22){
			this.day++;
			this.hour = 8;
		}
		if (this.day == 31){
			this.laundromat.payRent();
			console.log("Rent paid on " + this.month + "/" + this.day);
			this.month++;
			this.day = 1;
		}
	}

	gameLoop(){
		this.passTime();
		console.log(this.month + "/" + this.day + ": You have $" + this.laundromat.money);
	}

}

function initGame(){
	var game = new Game();
}








