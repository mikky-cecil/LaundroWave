var idCounter = 0;

class Machine {
	constructor(laundromat){
		this.laundromat = laundromat;
		this.objectId = 0;

		// Stats
		this.cost = 0;
		this.duration = 0;
		this.width = 1;
		this.height = 1;
		this.capacity = 0;
		this.currentChange = 0;

		// Displayed on the UI
		this.name = "";
		this.working = true;
		this.timeUntilFree = 0;
	}

	static newId(typeId){
		idCounter++;
		return typeId + idCounter;
	}

	setWorking(working){
		this.working = working;

		if (game != undefined){
			if(game.ui.isObjectDisplayed(this.objectId)){
				game.ui.displayObjectInfo(this.objectId);
			}
			game.ui.updateMachine(this);
		}
	}

	setTimeUntilFree(timeUntilFree){
		this.timeUntilFree = timeUntilFree;

		if (game != undefined){
			if(game.ui.isObjectDisplayed(this.objectId)){
				game.ui.displayObjectInfo(this.objectId);
			}
			// Eventually: toggle the washing animation
		}
	}

	payMachine(customer){
		if (customer.usableMoney >= this.cost){
			customer.usableMoney -= this.cost;
			this.setChange(this.currentChange + this.cost);

			if (game != undefined && game.ui.isObjectDisplayed(this.objectId)){
				game.ui.displayObjectInfo(this.objectId);
			}

			return true;
		}else{
			return false;
		}
	}

	setChange(currentChange){
		this.currentChange = currentChange;
		if (game != undefined && game.ui.isObjectDisplayed(this.objectId)){
			game.ui.displayObjectInfo(this.objectId);
		}
	}

	passTime(time){
		if (this.duration == 0 || this.timeUntilFree == 0){
			return;
		}
		this.setTimeUntilFree(this.timeUntilFree - time);
	}
}

class LaundryMachine extends Machine{
	constructor(laundromat, type){
		super(laundromat);
		this.objectId = LaundryMachine.newId(type);

		// Stats
		this.duration = 0;
		this.cost = 0;
		this.capacity = 100;
		this.width = 2;
		this.height = 2;
	}

	static newId(prefix){
		return super.newId(prefix);
	}

	doAction(action, customer, load){
		if (this.working && this.timeUntilFree == 0 && super.payMachine(customer)){
			load[action] = true;
			this.setTimeUntilFree(this.duration);
			return true;
		}else{
			return false;
		}
	}

	collectChange(){
		var change = this.currentChange;
		this.laundromat.setMoney(this.laundromat.money + this.currentChange);
		this.setChange(0);
		return change;
	}
}

class Washer extends LaundryMachine {
	constructor(laundromat){
		super(laundromat, "W");
		this.name = "Standard Washer";

		// Stats
		this.duration = 3;
		this.cost = 2;
	}

	wash(customer, load){
		return super.doAction("washed", customer, load);
	}
}

class Dryer extends LaundryMachine {
	constructor(laundromat){
		super(laundromat, "D");
		this.name = "Standard Dryer";

		// Stats
		this.duration = 3;
		this.cost = 2;
	}

	dry(customer, load){
		if (!load.washed){
			return false;
		}
		return super.doAction("dried", customer, load);
	}
}

class ChangeMachine extends Machine {
	constructor(laundromat){
		super(laundromat);
		this.objectId = ChangeMachine.newId();
		this.name = "Change Machine";

		// Stats
		this.capacity = 500;
	}

	static newId(){
		return super.newId("C");
	}

	addChange(change){
		if (change <= this.laundromat.money){
			this.laundromat.money -= change;
			this.setChange(this.currentChange + change);
			if (this.currentChange > 0){
				this.setWorking(true);
			}
			return true;
		}else{
			return false;
		}
	}

	giveChange(customer, change){
		if (change <= this.currentChange){
			this.setChange(this.currentChange - change);
			customer.usableMoney += change;
			return true;
		}else{
			this.setWorking(false);
			return false;
		}
	}

}