//Stuff to handle weapons and bullets
/////////////////////////////////////
var aBullet = aBullet || {};
var gamePlayer = gamePlayer || {};

//Bullet Class for Weapon plugin
//constructor
var aBullet = function (game, key) {

    //what image?
    Phaser.Sprite.call(this, game, 0, 0, key);
    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

    this.anchor.set(0.5);

    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.exists = false;
};
//Listeners?
aBullet.prototype = Object.create(Phaser.Sprite.prototype);
aBullet.prototype.constructor = aBullet;

//All weapons use this; fire a bullet of the current weapon
aBullet.prototype.fire = function (player, bulletSpeed = 400, bulletDuration = 2000, bulletScale = 1) {
    //bullet invisible at first, scales to full size after 300(ms)
    //  might need to change this as more weapon types added
    this.scale.setTo(0, 0);
    this.reset(player.body.x, player.body.y + 16);
    this.game.add.tween(this.scale).to({x: bulletScale, y: bulletScale}, 300).start();
    this.lifespan = bulletDuration;
    this.rotation = player.rotation; //match player sprite rotation
    
    //match the player
    this.game.physics.arcade.velocityFromRotation(player.rotation, bulletSpeed, this.body.velocity);
};

var Weapon = {};
//first(only) weapon type constructor; single bullet
Weapon.SingleBullet = function (game) {
    //create a new group for this weapon type
    Phaser.Group.call(this, game, game.world, 'Single Bullet', false, true, Phaser.Physics.ARCADE);
    this.nextFire = 0;  //how long until we can shoot?
    this.bulletSpeed = 600;
    this.fireRate = 500; //delay between shots
    
    //load the ammo
    for (var i = 0; i < 64; i++)
    {
        this.add(new aBullet(game, 'bullet'), true);
    }
    
    return this;
};
//Listener
Weapon.SingleBullet.prototype = Object.create(Phaser.Group.prototype);
Weapon.SingleBullet.prototype.constructor = Weapon.SingleBullet;

//Try to shoot the weapon!
Weapon.SingleBullet.prototype.fire = function (source) {
    //nah, we just did that; calm down
    if (this.game.time.time < this.nextFire) { return; }
    
    //bullet location offset
    var x = source.x + 10;
    var y = source.y + 10;
    
    //take from the group of this weapon type, shoot it
    this.getFirstExists(false).fire(source, this.bulletSpeed);
    
    //update the cooldown
    this.nextFire = this.game.time.time + this.fireRate;
};

Weapon.formShield = function (game) {
    //create a new group for this weapon type
    Phaser.Group.call(this, game, game.world, 'Basic Shield', false, true, Phaser.Physics.ARCADE);
    this.nextFire = 0;  //how long until we can shoot?
    this.bulletSpeed = 0;
    this.fireRate = 5001; //delay between shots
    this.bulletDuration = 5000;
    this.bulletScale = 3;
    this.alpha = 0.5;

    //load the ammo
    this.add(new aBullet(game, 'shield'), true);

    return this;
};
//Listener
Weapon.formShield.prototype = Object.create(Phaser.Group.prototype);
Weapon.formShield.prototype.constructor = Weapon.formShield;

//Try to shoot the weapon!
Weapon.formShield.prototype.fire = function (source) {
    //nah, we just did that; calm down
    if (this.game.time.time < this.nextFire) { return; }

    //bullet location offset
    var x = source.x;
    var y = source.y;

    //take from the group of this weapon type, shoot it
    this.getFirstExists(false).fire(source, this.bulletSpeed, this.bulletDuration, this.bulletScale);
    this.getFirstExists().setHealth(3);
    this.getFirstExists().body.bounce.setTo(3, 3);

    //update the cooldown
    this.nextFire = this.game.time.time + this.fireRate;
};

Weapon.formShield.prototype.update = function (){
    if(this.alive){
        var shield = this.getFirstExists();
        if(shield){
            shield.x = gamePlayer.x;
            shield.y = gamePlayer.y;
        }
    }
};
