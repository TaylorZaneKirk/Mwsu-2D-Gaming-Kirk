var SpaceHipster = SpaceHipster || {};
var gamePlayer = gamePlayer || {};

//title screen
SpaceHipster.Game = function(){};

SpaceHipster.Game.prototype = {
    create: function() {
        //set world dimensions
        this.game.world.setBounds(0, 0, 1920, 1920);

        //background
        this.background = this.game.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'space');

        //create player
        this.player = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'playership');
        this.player.anchor.setTo(0.5, 0.5);
        gamePlayer = this.player;

        //player initial score of zero
        this.playerScore = 0;

        //enable player physics
        this.game.physics.arcade.enable(this.player);
        this.playerSpeed = 120;
        this.player.body.drag.set(100);
        this.player.body.maxVelocity.set(200);

        //the camera will follow the player in the world
        this.game.camera.follow(this.player);

        //generate game elements
        this.generateCollectables();

        //Asteroid stuff
        this.generateAsteriods();

        //Bullet Stuff
        //this.bullets = this.game.add.group();
        this.weapons = [];
        this.currentWeapon = 0;
        this.weaponName = null;
        this.weapons.push(new Weapon.SingleBullet(this.game));

        //show score
        this.showLabels();

        //sounds
        this.explosionSound = this.game.add.audio('explosion');
        this.collectSound = this.game.add.audio('collect');

        //Controls
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

        //Add a new asteroid every 5-10 seconds
        //  scalar will be picked at random to pass
        //  to the same generate singular asteroid function
        this.game.time.events.loop(this.game.rnd.integerInRange(5000, 10000), 
                                   function(){
            var whichScalar = this.game.rnd.pick([this.game.global.skillLevel.x,
                                                  this.game.global.skillLevel.y]);
            this.generateAsteroid(whichScalar);
        }, this);
    },
    
    update: function() {
        //Player Controls
        if (this.cursors.up.isDown)
        {
            this.game.physics.arcade.accelerationFromRotation(this.player.rotation, 200, this.player.body.acceleration);
        }
        else
        {
            this.player.body.acceleration.set(0);
        }
        if (this.cursors.down.isDown){
            this.nextWeapon();
        }
        if (this.cursors.left.isDown)
        {
            this.player.body.angularVelocity = -300;
        }
        else if (this.cursors.right.isDown)
        {
            this.player.body.angularVelocity = 300;
        }
        else
        {
            this.player.body.angularVelocity = 0;
        }
        if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
        {
            this.weapons[this.currentWeapon].fire(this.player);
        }
        
        //collision between player and asteroids
        this.game.physics.arcade.collide(this.player, this.asteroids, this.hitAsteroid, null, this);
        //this.game.physics.arcade.collide(this.playerShield, this.asteroids, this.bumpAsteroid, null, this);
        this.game.physics.arcade.collide(this.weapons[this.currentWeapon], this.asteroids, this.destoryAsteroid, null, this);
        this.game.physics.arcade.collide(this.asteroids, this.asteroids, this.collideAsteroids, null, this);
        
        //overlapping between player and collectables
        this.game.physics.arcade.overlap(this.player, this.collectables, this.collect, null, this);
        
        //Wrap-around for player
        this.screenWrap(this.player);
        
        //wrap bullets(recommended: don't)
        //this.bullets.forEachExists(this.screenWrap, this);

        //clean-up bounding boxes after sprite has been killed
        //  (mostly useful for debugging?)
        //  Might also help with generating new asteroids outside of initial generation
        this.asteroids.forEachDead(function(asteroid){asteroid.destroy();});
    },
    
    nextWeapon: function () {

        //  Tidy-up the current weapon
        if (this.currentWeapon > 9)
        {
            this.weapons[this.currentWeapon].reset();
        }
        else
        {
            this.weapons[this.currentWeapon].visible = false;
            this.weapons[this.currentWeapon].callAll('reset', null, 0, 0);
            this.weapons[this.currentWeapon].setAll('exists', false);
        }

        //  Activate the new one
        this.currentWeapon++;

        if (this.currentWeapon === this.weapons.length)
        {
            this.currentWeapon = 0;
        }

        this.weapons[this.currentWeapon].visible = true;


    },

    screenWrap: function (sprite) {
        //A sprite went off the edge of the world, loop 'em around
        
        if (sprite.x < 0){
            sprite.x = this.game.world.bounds.width;
        }
        else if (sprite.x > this.game.world.bounds.width)
        {
            sprite.x = 0;
        }

        if (sprite.y < 0)
        {
            sprite.y = this.game.world.bounds.height;
        }
        else if (sprite.y > this.game.world.bounds.height)
        {
            sprite.y = 0;
        }
    },

    generateCollectables: function() {
        this.collectables = this.game.add.group();
        //enable physics in them
        this.collectables.enableBody = true;
        this.collectables.physicsBodyType = Phaser.Physics.ARCADE;

        //phaser's random number generator
        var numCollectables = this.game.rnd.integerInRange(100, 150);
        var collectable;

        for (var i = 0; i < numCollectables; i++) {
            //add sprite
            collectable = this.collectables.create(this.game.world.randomX, this.game.world.randomY, 'power');
            collectable.animations.add('fly', [0, 1, 2, 3], 5, true);
            collectable.animations.play('fly');
        }
    },
    
    bumpAsteroid: function(shield, asteroid){
        //Hit an asteroid while shields up; damage shield
        shield.damage(1);
        this.explodeThing(shield, true);
        shield.alpha -= 0.10;
    },
    
    //Controls the initial creation of asteroids
    generateAsteriods: function() {
        var asteriod;
        var lastMade = {};
        this.asteroids = this.game.add.physicsGroup(Phaser.Physics.ARCADE);

        //enable physics in them
        this.asteroids.enableBody = true;

        //how many 'small' scale asteroids?
        var numAsteroidsSmall = this.game.rnd.integerInRange(this.game.global.asteroidSize, this.game.global.skillLevel.y) / 2.5;
        
        //how many 'large' scale asteroids?
        var numAsteroidsLarge = this.game.rnd.integerInRange(this.game.global.asteroidSize, this.game.global.skillLevel.x) / 3;

        //generate some number of 'small' scale asteroids
        for (var i = 0; i < numAsteroidsSmall; i++) {
            this.generateAsteroid(this.game.global.skillLevel.y);
            lastMade = this.asteroids.getTop();
            lastMade.name = "asteroid" + i;
        }
        //generate some number of 'large' scale asteroids
        for (i = 0; i < numAsteroidsLarge; i++) {
            this.generateAsteroid(this.game.global.skillLevel.x);
            lastMade = this.asteroids.getTop();
            lastMade.name = "asteroid" + (i + (numAsteroidsSmall | 0));
        }
    },

    //Create and add one asteroid to the asteroids group.
    //Scale and velocity based on the scalar (big or small)[based on difficulty], the difficulty itself,
    //  predefined asteroid size, and a whole bunch of random ranges.
    generateAsteroid: function(scalar){
        var asteroid;
        var asteroidScale;  //size of the asteroid to be created
        var asteroidVeloc_x;  //speed of asteroid
        var asteroidVeloc_y;
        var difScale;   //used in Scale and Velocity calculations. Changes with global skill level
        var rotationSpeed;  //optional, asteroids should rotate, not slide
        var whichImage; //not all asteroids look alike
        
        //calculate how much to scale based on the difficulty selected
        difScale = this.game.global.skillLevel.x / this.game.global.skillLevel.y;

        //three different images for asteroids; pick one
        whichImage = this.game.rnd.integerInRange(1, 3);
        if (whichImage == 1)
            asteroid = this.asteroids.create(this.game.world.randomX, this.game.world.randomY, 'asteroid1');
        if (whichImage == 2)
            asteroid = this.asteroids.create(this.game.world.randomX, this.game.world.randomY, 'asteroid2');
        if (whichImage == 3)
            asteroid = this.asteroids.create(this.game.world.randomX, this.game.world.randomY, 'asteroid3');

        //Scale = PICK RND BETWEEN(50 - 50, 50 + 150), / 150 for small, 50 for large, * (.3*5.5)
        asteroidScale = (((this.game.rnd.integerInRange( this.game.global.asteroidSize -
                                                        this.game.global.skillLevel.x,this.game.global.asteroidSize + 
                                                        this.game.global.skillLevel.y) / scalar) * (5.5 * difScale)));

        //If asteroid is too small, force it scale scale between .75 and 0.99
        if (asteroidScale < 0.75)
            asteroidScale = this.game.rnd.integerInRange(0.75, 0.99);

        //scale the asteroid to its unique size
        asteroid.scale.setTo(asteroidScale);
        
        //mass = scale(rounded)
        //do not allow asteroids with a mass of 0, force a minimum
        if (asteroidScale < 1)
            asteroid.body.mass = 1;
        else
            asteroid.body.mass = (asteroidScale| 0);

        //Bounding box stuff, more forgiving collision boxes
        /*asteroid.body.setSize(
            asteroid.body.width * 0.8,
            asteroid.body.height * 0.8,
            asteroid.body.width * 0.025,
            asteroid.body.height * 0.025
        );*/

        //Health that scales with size
        asteroid.maxHealth = 5; //maximum of 5 hits to destroy
        asteroid.setHealth(asteroidScale | 0);

        //Calculate velocity
        asteroidVeloc_x = (this.game.rnd.integerInRange(-40, 40) * (scalar * 1.5)) / 
            this.game.global.asteroidSize - this.game.rnd.integerInRange(0, 20);
        asteroidVeloc_y = (this.game.rnd.integerInRange(-40, 40) * (scalar * 1.5)) / 
            this.game.global.asteroidSize - this.game.rnd.integerInRange(0, 20);

        //Speed limits
        asteroid.body.maxVelocity = (-270, 270);
        if (asteroidScale >= 3)
            asteroid.body.maxVelocity = (-180, 180);
        if (asteroidScale > 4)
            asteroid.body.maxVelocity = (-50, 50);
        
        //adjust actual velocity to new velocity
        asteroid.body.velocity.x = asteroidVeloc_x;
        asteroid.body.velocity.y = asteroidVeloc_y;

        //Allow each asteroid to have a unique RPM value
        rotationSpeed = this.game.rnd.integerInRange((1500 + scalar), (scalar * scalar));
        this.game.add.tween(asteroid).to(
            {angle: (this.game.rnd.pick([-1, 1]) * 359)}, //rotate to left or right?
            rotationSpeed, //how fast to rotate
            Phaser.Easing.Linear.None, 
            true, //autostart
            0, //delay (ms)
            Infinity //how many times?
        );

        //set anchor to avoid weird rotations on spawn
        asteroid.anchor.setTo(0.5, 0.5);

        //collide border & bounce
        asteroid.body.collideWorldBounds = true;
        asteroid.body.bounce.setTo(1, 1);
    },

    collideAsteroids: function(asteroid1, asteroid2){
        //when two asteroids collide, increase the size of the 
        //  bigger one by some factor of the smaller asteroid,
        //  velocity of the big asteroid is adjusted if the
        //  smaller asteroid  has a higher velocity (it usually will)

        var bigAsteroid = {};
        var smallAsteroid = {};
        var overage;

        //Which one is the big asteroid?
        if(asteroid1.body.mass > asteroid2.body.mass){
            bigAsteroid = asteroid1;
            smallAsteroid = asteroid2;
        }
        else if (asteroid1.body.mass < asteroid2.body.mass){
            bigAsteroid = asteroid2;
            smallAsteroid = asteroid1;
        }
        else{   //both asteroids have equal mass, take damage and bounce
            asteroid1.damage(1);
            this.explodeThing(asteroid1, true);
            asteroid2.damage(1);
            this.explodeThing(asteroid2, true);
            return;
        }

        //Smaller asteroid is more dense and is moving faster; destroy big asteroid
        if (smallAsteroid.body.mass > (bigAsteroid.body.mass * 0.75)){ 
            if ((smallAsteroid.body.velocity.x > bigAsteroid.body.velocity.x * 1.5 ||
                 smallAsteroid.body.velocity.y > bigAsteroid.body.velocity.y * 1.5)){
                this.explodeThing(bigAsteroid, true, true);
                return;
            }
            //nah, just bounce; damage bigAsteroid
            bigAsteroid.damage(1);
            return;
        }

        //Find the velocity to augment the velocity of the big asteroid
        if (bigAsteroid.body.velocity.x < smallAsteroid.body.velocity.x){
            overage = (smallAsteroid.body.velocity.x - bigAsteroid.body.velocity.x) / 2;
            bigAsteroid.body.velocity.x += overage;
        }
        if (bigAsteroid.body.velocity.y < smallAsteroid.body.velocity.y){
            overage = (smallAsteroid.body.velocity.y - bigAsteroid.body.velocity.y) / 2;
            bigAsteroid.body.velocity.y += overage;
        }

        //Animate the size increase
        this.game.add.tween(bigAsteroid.scale).to(
            {x: bigAsteroid.scale.x + (smallAsteroid.scale.x % 0.5), 
             y: bigAsteroid.scale.y + (smallAsteroid.scale.y % 0.5)}, 300).start();

        //Give more mass
        bigAsteroid.body.mass++;

        //Allow for heal
        bigAsteroid.heal(smallAsteroid.health);

        //Show the impact of the small Asteroid, then kill it
        this.explodeThing(smallAsteroid, true, true);
    },

    explodeThing: function(thing, doConserveVelocity = false, oneShot = false){
        //Function to explode and kill a sprite (thing)
        // if doConserveVelocity is true, the particles will
        // travel the same direction as the thing,
        // by default the particles will explode normally

        //play explosion sound
        this.explosionSound.play();

        //make the thing explode
        var emitter = this.game.add.emitter(thing.x, thing.y, 100);
        emitter.makeParticles('playerParticle');
        emitter.minParticleSpeed.setTo(-200, -200);
        emitter.maxParticleSpeed.setTo(200, 200);

        //Force particles to travel the same direction as thing
        if (doConserveVelocity === true){
            emitter.width = 100;
            emitter.setXSpeed(-200, (2 * thing.body.velocity.x));
            emitter.setYSpeed(-200, (2 * thing.body.velocity.y));
        }

        emitter.gravity = 0;
        emitter.start(true, 1000, null, 100);

        if(oneShot === true)
            thing.damage(thing.health);
    },

    hitAsteroid: function(player, asteroid) {
       
        this.explodeThing(player);
        player.kill();
        this.game.time.events.add(800, this.gameOver, this);
        
    },

    destoryAsteroid: function(bullet, asteroid){
        //If asteroid still has health, damage it,
        //  and resize it to .9 of its scale
        this.explodeThing(asteroid);
        asteroid.damage(1);
        
        //Animate resize
        this.game.add.tween(asteroid.scale).to(
            {x: asteroid.scale.x * 0.9, 
             y: asteroid.scale.y * 0.9},
            100
        ).start();
        
        bullet.damage(1);
        
        if (!asteroid.alive){
            this.collectables.create(asteroid.x, asteroid.y, 'powerupShield');
        }
    },

    gameOver: function() {    
        //pass it the score as a parameter 
        this.game.state.start('MainMenu', true, false, this.playerScore);
    },

    collect: function(player, collectable) {
        //play collect sound
        this.collectSound.play();

        //update score
        this.playerScore++;
        this.scoreLabel.text = this.playerScore;
        
        //Add new weapon
        if (collectable.key == 'powerupShield')
            this.weapons.push(new Weapon.formShield(this.game));

        //remove sprite
        collectable.destroy();
    },

    showLabels: function() {
        //score text
        var text = "0";
        var style = { font: "20px Arial", fill: "#fff", align: "center" };
        this.scoreLabel = this.game.add.text(this.game.width-50, this.game.height - 50, text, style);
        this.scoreLabel.fixedToCamera = true;
    },

    render: function(){
        //Debugging stuff
        //Show bounding-boxes for the player/asteroids/bullets/shield
        //this.game.debug.body(this.player);
        //this.game.debug.body(this.playerShield);
        //this.weapons[this.currentWeapon].forEach(function(bullet){this.game.debug.body(bullet);}, this);
        //this.asteroids.forEach(function(asteroid){this.game.debug.body(asteroid);}, this);
    }
};
