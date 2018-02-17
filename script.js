var player;

function init(){
	var stage = new createjs.Stage("demoCanvas");

	player = new createjs.Shape();
	player.graphics.beginFill("Violet")
		.drawCircle(0, 0, 50);
	player.x = 200;
	player.y = 100;

	stage.addChild(player);

	stage.update();
	
	createjs.Ticker.setFPS(60);
	createjs.Ticker.addEventListener("tick", stage);
	
}

function go(){
	initGame();
	
	createjs.Tween.get(player, { loop: false })
		.to({ x: 400 }, 1000, createjs.Ease.getPowInOut(4))
		.to({ x: 200, y: 250 }, 500, createjs.Ease.getPowInOut(4))
		.to({ x: 100, y: 200 }, 500, createjs.Ease.getPowInOut(2))
		.to({ x: 200, y: 100 }, 1000, createjs.Ease.getPowInOut(2));
}