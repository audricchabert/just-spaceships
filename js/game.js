Number.prototype.mod = function(n) {
	return ((this%n)+n)%n;
}

/**
 * If this number represents an angle; what is its difference to another angle?
 */
Number.prototype.angleDiff = function(target) {
	var diff = target - this;
	if (Math.abs(diff) > Math.PI) { diff += (diff < 0 ? 1 : -1) * 2 * Math.PI; }
	return diff;
}

Array.prototype.clone = function() {
	var c = [];
	var len = this.length;
	for (var i=0;i<len;i++) { c.push(this[i]); }
	return c;
}

var Game = OZ.Class();
Game.prototype.init = function() {
	this._port = [0, 0];
	this._offset = [0, 0];
	this._size = [3000, 3000];
	this._images = {};
	this._ships = [];
	
	this._initEngine();
	this._initShips();
	
	/* */
	var monitor1 = new HAF.Monitor.Sim(this._engine, [220, 100], {textColor:"#aaa"}).getContainer();
	monitor1.style.position = "absolute";
	monitor1.style.left = "0px";
	monitor1.style.top = "0px";
	document.body.appendChild(monitor1);
	var monitor2 = new HAF.Monitor.Draw(this._engine, [220, 100], {textColor:"#aaa"}).getContainer();
	monitor2.style.position = "absolute";
	monitor2.style.left = "0px";
	monitor2.style.top = monitor1.offsetHeight + "px";
	document.body.appendChild(monitor2);
	/* */
	
	this._engine.start();
	Game.Audio.play("neointro");
}

Game.prototype.getEngine = function() {
	return this._engine;
}

Game.prototype.getSize = function() {
	return this._size;
}

Game.prototype.getPort = function() {
	return this._port;
}

Game.prototype.getOffset = function() {
	return this._offset;
}

Game.prototype.getMap = function() {
	return this._map;
}

Game.prototype.setOffset = function(offset) {
	this._offset[0] = offset[0].mod(this._size[0]);
	this._offset[1] = offset[1].mod(this._size[1]);
	this._engine.setDirty("bg");
	this._engine.setDirty("ships");
	this._engine.setDirty("map");
	return this._offset;
}

Game.prototype.getShips = function() {
	return this._ships;
}

/**
 * Detect if given coordinates are within a certain distance from the viewport
 */
Game.prototype.inPort = function(coords, distance) {
	for (var i=0;i<2;i++) {
		var first = (this._offset[i] - distance).mod(this._size[i]);
		var second = (this._offset[i] + this._port[i] + distance).mod(this._size[i]);

		if (first < second) { /* normal port position */
			if (coords[i] < first || coords[i] > second) { return false; }
		} else { /* wrapped port */
			if (coords[i] < first && coords[i] > second) { return false; }
		}
	}
	
	return true;
}

Game.prototype._initEngine = function() {
	this._engine = new HAF.Engine(this._port);
	document.body.appendChild(this._engine.getContainer());
	this._engine.addCanvas("bg");
	this._engine.addCanvas("ships");
	this._engine.addCanvas("map").style.opacity = 0.75;
	this._engine.addCanvas("fx");
	this._resize();

	this._offset[0] = Math.round((this._size[0]-this._port[0])/2);
	this._offset[1] = Math.round((this._size[1]-this._port[1])/2);

	this._map = new Map(this, [100, 100]);
	this._engine.addActor(this._map, "map");
	this._engine.addActor(new Background(this), "bg");
	OZ.Event.add(window, "resize", this._resize.bind(this));
}

Game.prototype._resize = function() {
	var win = OZ.DOM.win();
	for (var i=0;i<win.length;i++) {
		this._port[i] = Math.min(win[i], this._size[i]);
	}
	this._engine.setSize(this._port);
}

Game.prototype._shipDeath = function(e) {
	var index = this._ships.indexOf(e.target);
	this._ships.splice(index, 1);
}

Game.prototype._initShips = function() {
	OZ.Event.add(null, "ship-death", this._shipDeath.bind(this));

	var player = new Ship.Player(this);
	this._ships.push(player);

	var ai = new Ship(this, {type:"purple"});
	this._ships.push(ai);
	ai._phys.position[1] += -200;
	ai.getPilot().setTarget(player);
	
	var ai = new Ship(this, {type:"green"});
	this._ships.push(ai);
	ai._phys.mass = 2;
	ai._phys.position[1] += 200;
	ai.getPilot().setTarget(player);

	var ai = new Ship(this, {type:"red"});
	this._ships.push(ai);
	ai._phys.position[1] += 300;
	ai._phys.orientation = -Math.PI/8;
	ai.getPilot().setTarget(player);

	var ai = new Ship(this, {type:"blue"});
	this._ships.push(ai);
	ai._phys.position[1] += -300;
	ai._phys.mass = 2;
	ai._phys.orientation = Math.PI/8;
	ai.getPilot().setTarget(player);

}
