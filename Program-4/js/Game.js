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
        //this.player.scale.setTo(2);
        //this.player.animations.add('fly', [0, 1, 2, 3], 5, true);
        //this.player.animations.play('fly');


        //player initial score of zero
        this.playerScore = 0;

        //enable player physics
        this.game.physics.arcade.enable(this.player);
        this.playerSpeed = 120;
        //this.player.body.collideWorldBounds = true;
        this.player.body.drag.set(100);
        this.player.body.maxVelocity.set(200);

        //the camera will follow the player in the world
        this.game.camera.follow(this.player);

        //generate game elements
        this.generateCollectables();
        this.generateAsteriods();
        this.asteroids.setAll('body.collideWorldBounds', true);
        this.asteroids.setAll('body.bounce.x', 1);
        this.asteroids.setAll('body.bounce.y', 1);

        this.bullets = this.game.add.group();
        //enable physics in them
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

        //  All 40 of them
        this.bullets.createMultiple(40, 'bullet');
        this.bullets.setAll('anchor.x', 0);
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
        this.game.physics.arcade.overlap(this.bullets, this.asteroids, this.destoryAsteroid, null, this);
        this.game.physics.arcade.collide(this.asteroids);
        
        //overlapping between player and collectables
        this.game.physics.arcade.overlap(this.player, this.collectables, this.collect, null, this);
        
        this.screenWrap(this.player);
        this.bullets.forEachExists(this.screenWrap, this);
    },
    
    fireBullet: function () {
        
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
                this.bulletTime = this.game.time.now + 50;
            }
        }
    },
    
    screenWrap: function (sprite) {
        if (sprite.x < 0){
            sprite.x = 1920;
        }
        else if (sprite.x > 1920)
        {
            sprite.x = 0;
        }
        
        if (sprite.y < 0)
        {
            sprite.y = 1920;
        }
        
        else if (sprite.y > 1920)
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
        this.asteroids = this.game.add.physicsGroup(Phaser.Physics.ARCADE);
        
        //enable physics in them
        this.asteroids.enableBody = true;
        
        //phaser's random number generator
        var numAsteroidsSmall = this.game.rnd.integerInRange(this.game.global.asteroidSize, this.game.global.skillLevel.y) / 3
        var numAsteroidsLarge = this.game.rnd.integerInRange(this.game.global.asteroidSize, this.game.global.skillLevel.x) / 3
        var asteriod;
        
        for (var i = 0; i < numAsteroidsSmall; i++) {
            this.generateAsteroid(this.game.global.skillLevel.y);
        }
        for (var i = 0; i < numAsteroidsLarge; i++) {
            this.generateAsteroid(this.game.global.skillLevel.x);
        }
    },

    generateAsteroid: function(scalar){
        var asteroid;
        var asteroidScale;
        var asteroidVeloc;
        var difScale;
        var whichImage;
        
        difScale = this.game.global.skillLevel.x / this.game.global.skillLevel.y;
        
        whichImage = this.game.rnd.integerInRange(1, 3);
        if (whichImage == 1)
            asteroid = this.asteroids.create(this.game.world.randomX, this.game.world.randomY, 'asteroid1');
        if (whichImage == 2)
            asteroid = this.asteroids.create(this.game.world.randomX, this.game.world.randomY, 'asteroid2');
        if (whichImage == 3)
            asteroid = this.asteroids.create(this.game.world.randomX, this.game.world.randomY, 'asteroid3');
        
        //Scale = PICK RND BETWEEN(50 - 50, 50 + 150), / 150 for small, 50 for large, * (.3*5)
        asteroidScale = (((this.game.rnd.integerInRange( this.game.global.asteroidSize -
                            this.game.global.skillLevel.x,this.game.global.asteroidSize + 
                            this.game.global.skillLevel.y) / scalar) * (5 * difScale)));
        
        if (asteroidScale < .5)
            asteroidScale = this.game.rnd.integerInRange(.5, 1.0);
        asteroid.scale.setTo(asteroidScale);
        asteroidVeloc_x = (this.game.rnd.integerInRange(-40, 40) * scalar) / 
            this.game.global.asteroidSize - this.game.rnd.integerInRange(0, 15);
        asteroidVeloc_y = (this.game.rnd.integerInRange(-40, 40) * scalar) / 
            this.game.global.asteroidSize - this.game.rnd.integerInRange(0, 15);
        
        asteroid.body.velocity.x = asteroidVeloc_x;
        asteroid.body.velocity.y = asteroidVeloc_y;
    },
    
    hitAsteroid: function(player, asteroid) {
        //play explosion sound
        this.explosionSound.play();
        
        //make the player explode
        var emitter = this.game.add.emitter(this.player.x, this.player.y, 100);
        emitter.makeParticles('playerParticle');
        emitter.minParticleSpeed.setTo(-200, -200);
        emitter.maxParticleSpeed.setTo(200, 200);
        emitter.gravity = 0;
        emitter.start(true, 1000, null, 100);
        this.player.kill();
        
        this.game.time.events.add(800, this.gameOver, this);
    },
    
    destoryAsteroid: function(bullet, asteroid){
        this.explosionSound.play();
        
        var emitter = this.game.add.emitter(asteroid.x, asteroid.y, 100);
        emitter.makeParticles('playerParticle');
        emitter.minParticleSpeed.setTo(-200, -200);
        emitter.maxParticleSpeed.setTo(200, 200);
        emitter.gravity = 0;
        emitter.start(true, 1000, null, 100);
        asteroid.kill();
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
    }
};

/*
TODO

-audio
-asteriod bounch
*/
