var SpaceHipster = SpaceHipster || {};

//title screen
SpaceHipster.Game = function(){};
SpaceHipster

SpaceHipster.Game.prototype = {
    create: function() {
        //set world dimensions
        this.game.world.setBounds(0, 0, 1920, 1920);
        
        //background
        this.background = this.game.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'space');
        
        //create player
        this.player = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'playership');
        this.player.anchor.setTo(0, 0.5);
        
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
        this.asteroids.setAll('body.collideWorldBounds', true);
        this.asteroids.setAll('body.bounce.x', 1);
        this.asteroids.setAll('body.bounce.y', 1);
        this.asteroids.setAll('anchor.x', 0.5)
        this.asteroids.setAll('anchor.y', 0.5)
        
        //Bullet Stuff
        this.bullets = this.game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.createMultiple(10, 'bullet');
        this.bullets.setAll('anchor.x', 0.5);
        this.bullets.setAll('anchor.y', 0.5);
        this.bulletTime = 0;
        
        //show score
        this.showLabels();
        
        //sounds
        this.explosionSound = this.game.add.audio('explosion');
        this.collectSound = this.game.add.audio('collect');
        
        //Controls
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);
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
            this.fireBullet();
        }
        
        //collision between player and asteroids
        this.game.physics.arcade.collide(this.player, this.asteroids, this.hitAsteroid, null, this);
        this.game.physics.arcade.collide(this.bullets, this.asteroids, this.destoryAsteroid, null, this);
        this.game.physics.arcade.collide(this.asteroids, this.asteroids, this.collideAsteroids, null, this);
        
        //overlapping between player and collectables
        this.game.physics.arcade.overlap(this.player, this.collectables, this.collect, null, this);
        
        //Wrap-around for player and bullets
        this.screenWrap(this.player);
        this.bullets.forEachExists(this.screenWrap, this);
        
        //clean-up bounding boxes after sprite has been killed
        //  (mostly useful for debugging?)
        //this.asteroids.forEachDead(function(asteroid){asteroid.destroy();});
    },
    
    fireBullet: function () {
        //Spaces between bullets
        if (this.game.time.now > this.bulletTime)
        {
            bullet = this.bullets.getFirstExists(false);
            
            if (bullet)
            {
                bullet.scale.setTo(0, 0);
                bullet.reset(this.player.body.x, this.player.body.y + 16);
                this.game.add.tween(bullet.scale).to({x: 1, y: 1}, 300).start();
                bullet.lifespan = 2000;
                bullet.rotation = this.player.rotation;
                this.game.physics.arcade.velocityFromRotation(this.player.rotation, 400, bullet.body.velocity);
                this.bulletTime = this.game.time.now + 250; //Bullet delay
                
                /*bullet.body.setSize(
                    bullet.body.width * .5,
                    bullet.body.height,
                    bullet.body.width * .5,
                    0
                );*/
            }
        }
    },
    
    screenWrap: function (sprite) {
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
        var numCollectables = this.game.rnd.integerInRange(100, 150)
        var collectable;
        
        for (var i = 0; i < numCollectables; i++) {
            //add sprite
            collectable = this.collectables.create(this.game.world.randomX, this.game.world.randomY, 'power');
            collectable.animations.add('fly', [0, 1, 2, 3], 5, true);
            collectable.animations.play('fly');
        }
    },
    
    generateAsteriods: function() {
        var asteriod;
        var lastMade = {};
        this.asteroids = this.game.add.physicsGroup(Phaser.Physics.ARCADE);
        
        //enable physics in them
        this.asteroids.enableBody = true;
        
        //phaser's random number generator
        var numAsteroidsSmall = this.game.rnd.integerInRange(this.game.global.asteroidSize, this.game.global.skillLevel.y) / 2.5
        var numAsteroidsLarge = this.game.rnd.integerInRange(this.game.global.asteroidSize, this.game.global.skillLevel.x) / 3
        
        //generate some number of 'small' scale asteroids
        for (var i = 0; i < numAsteroidsSmall; i++) {
            this.generateAsteroid(this.game.global.skillLevel.y);
            lastMade = this.asteroids.getTop();
            lastMade.name = "asteroid" + i;
        }
        //generate some number of 'large' scale asteroids
        for (var i = 0; i < numAsteroidsLarge; i++) {
            this.generateAsteroid(this.game.global.skillLevel.x);
            lastMade = this.asteroids.getTop();
            lastMade.name = "asteroid" + (i + (numAsteroidsSmall | 0));
        }
        
        //Add a new asteroid every 5 seconds
        //  scalar will be picked at random to pass
        //  to the same generate singular asteroid function
        this.game.time.events.loop(this.game.rnd.integerInRange(5000, 10000), 
            function(){
                var whichScalar = this.game.rnd.pick([this.game.global.skillLevel.x,
                                                        this.game.global.skillLevel.y]);
                this.generateAsteroid(whichScalar);
            }, this);
    },
    
    //Create and add one asteroid to the asteroids group.
    //Scale and velocity based on the scalar (big or small)[based on difficulty], the difficulty itself,
    //  predefined asteroid size, and a whole bunch of random ranges.
    generateAsteroid: function(scalar){
        var asteroid;
        var asteroidScale;
        var asteroidVeloc;
        var difScale;
        var rotationSpeed;
        var whichImage;
        
        difScale = this.game.global.skillLevel.x / this.game.global.skillLevel.y;
        
        //three different images for asteroids, pick one
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
        
        //If asteroid is too small, force it scale scale between .5 and 1.0
        if (asteroidScale < .5)
            asteroidScale = this.game.rnd.integerInRange(.5, 1.0);
        
        //scale the asteroid to its unique size
        asteroid.scale.setTo(asteroidScale);
        
        //Bounding box stuff, more forgiving collision boxes
        asteroid.body.setSize(
            asteroid.body.width * .8,
            asteroid.body.height * .8,
            asteroid.body.width * .025,
            asteroid.body.height * .025
        );
        
        //Calculate velocity
        asteroidVeloc_x = (this.game.rnd.integerInRange(-40, 40) * (scalar * 1.5)) / 
            this.game.global.asteroidSize - this.game.rnd.integerInRange(0, 20);
        asteroidVeloc_y = (this.game.rnd.integerInRange(-40, 40) * (scalar * 1.5)) / 
            this.game.global.asteroidSize - this.game.rnd.integerInRange(0, 20);
        
        asteroid.body.velocity.x = asteroidVeloc_x;
        asteroid.body.velocity.y = asteroidVeloc_y;
        
        //Allow each asteroid to have a unique RPM value
        rotationSpeed = this.game.rnd.integerInRange((1500 + scalar), (scalar * scalar));
        this.game.add.tween(asteroid).to({angle: (this.game.rnd.pick([-1, 1]) * 359)}, rotationSpeed, Phaser.Easing.Linear.None, true, 0, Infinity);
    },
    
    collideAsteroids: function(asteroid1, asteroid2){
        //when two asteroids collide, increase the size of the 
        //  bigger one by some factor of the smaller asteroid,
        //  velocity of the big asteroid is adjusted if the
        //  smaller asteroid  has a higher velocity (it usually will)
        
        var bigAsteroid = {};
        var smallAsteroid = {};
        
        //Which one is the big asteroid?
        if(asteroid1.scale > asteroid2.scale){
            bigAsteroid = asteroid1;
            smallAsteroid = asteroid2;
        }
        else{
            bigAsteroid = asteroid2;
            smallAsteroid = asteroid1;
        }
        
        //Find the velocity to augment the velocity of the big asteroid
        if (bigAsteroid.body.velocity.x < smallAsteroid.body.velocity.x){
            var overage = (smallAsteroid.body.velocity.x - bigAsteroid.body.velocity.x) / 2
            bigAsteroid.body.velocity.x += overage;
        }
        if (bigAsteroid.body.velocity.y < smallAsteroid.body.velocity.y){
            var overage = (smallAsteroid.body.velocity.y - bigAsteroid.body.velocity.y) / 2
            bigAsteroid.body.velocity.y += overage;
        }
        
        //Animate the size increase
        this.game.add.tween(bigAsteroid.scale).to(
            {x: bigAsteroid.scale.x + (smallAsteroid.scale.x % 1.0), 
            y: bigAsteroid.scale.y + (smallAsteroid.scale.y % 1.0)}, 300).start();
        
        //Show the impact of the small Asteroid, then kill it
        this.explodeThing(smallAsteroid, true);
    },
    
    explodeThing: function(thing, doConserveVelocity = false){
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
        if (doConserveVelocity == true){
            emitter.width = 100;
            emitter.setXSpeed(-200, (2 * thing.body.velocity.x));
            emitter.setYSpeed(-200, (2 * thing.body.velocity.y));
        }
        
        emitter.gravity = 0;
        emitter.start(true, 1000, null, 100);
        
        //destroy the thing
        thing.kill();
    },
    
    hitAsteroid: function(player, asteroid) {
        this.explodeThing(player);
        this.game.time.events.add(800, this.gameOver, this);
    },
    
    destoryAsteroid: function(bullet, asteroid){
        this.explodeThing(asteroid);
        bullet.kill();
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
        //Show bounding-boxes for the player and all asteroids
        //this.game.debug.body(this.player);
        //this.bullets.forEach(function(bullet){this.game.debug.body(bullet);}, this);
        //this.asteroids.forEach(function(asteroid){this.game.debug.body(asteroid);}, this);
    }
};
