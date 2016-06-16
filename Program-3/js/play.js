var playState = {
    preload: function() {
        //Load sounds
        this.jumpSound = game.add.audio('jump');
        this.diamondSound = game.add.audio('diamond');
        this.deadSound = game.add.audio('dead');

        //Background music
        this.music = game.add.audio('music'); // Add the music
    },

    create: function () {
        //Game Stuff-------------------------------------------------------------
        //Background music
        this.music.loop = true; // Make it loop
        this.music.play(); // Start the music
        
        if (!game.device.desktop) {
            // Call 'orientationChange' when the device is rotated
            game.scale.onOrientationChange.add(this.orientationChange, this);
            
            // Create an empty label to write the error message if needed
            this.rotateLabel = game.add.text(game.width/2, game.height/2, '',
                { font: '30px Arial', fill: '#fff', backgroundColor: '#000' });
            this.rotateLabel.anchor.setTo(0.5, 0.5);
            
            // Call the function at least once
            this.orientationChange();
            this.addMobileInputs();
        }
        //this.addMobileInputs();
        //Arrow-Key input
        this.cursor = game.input.keyboard.createCursorKeys();
        game.input.keyboard.addKeyCapture([Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT]);
        this.wasd = {
            up: game.input.keyboard.addKey(Phaser.Keyboard.W),
            left: game.input.keyboard.addKey(Phaser.Keyboard.A),
            right: game.input.keyboard.addKey(Phaser.Keyboard.D)
        };

        //Display the score/deaths
        this.scoreLabel = game.add.text(30, 30, 'score: 0', { font: '18px Arial', fill: '#ffffff' });
        this.deathsLabel = game.add.text(380, 300, 'deaths: 0', { font: '18px Arial', fill: '#ffffff' });
        this.timeLabel = game.add.text(370, 30, 'time left: 120', { font: '18px Arial', fill: '#ffffff' });

        // Initialize the score & deaths variables
        game.global.score = 0;
        this.deaths = 0;
        this.time = 120;

        //Generate Walls, player, items, and enemies
        this.createWorld();

        //Start timer
        game.time.events.loop(Phaser.Timer.SECOND, this.updateTime, this);

        //Animation
        // Create the 'right' animation by looping the frames 1 and 2
        this.player.animations.add('right', [1, 2], 8, true);
        // Create the 'left' animation by looping the frames 3 and 4
        this.player.animations.add('left', [3, 4], 8, true);

        // Create the emitter with 15 particles. We don't need to set the x y
        // Since we don't know where to do the explosion yet
        this.emitter = game.add.emitter(0, 0, 15);

        // Set the 'pixel' image for the particles
        this.emitter.makeParticles('pixel');

        // Set the x and y speed of the particles between -150 and 150
        // Speed will be randomly picked between -150 and 150 for each particle
        this.emitter.setYSpeed(-150, 150);
        this.emitter.setXSpeed(-150, 150);
        
        // Scale the particles from 2 time their size to 0 in 800ms
        // Parameters are: startX, endX, startY, endY, duration
        this.emitter.setScale(2, 0, 2, 0, 800);
        
        // Use no gravity
        this.emitter.gravity = 0;
    },
    
    update: function () {
        
        // Tell Phaser that the player and the walls should collide
        // Replaced 'this.walls' by 'this.layer'
        game.physics.arcade.collide(this.player, this.layer);
        
        this.movePlayer();
        
        if (!this.player.inWorld) {
            this.playerDie();
        }
        
        game.physics.arcade.overlap(this.player, this.diamond, this.takeDiamond, null, this);
        
        //Enemy Stuff------------------------------------------------
        // Make the enemies and walls collide
        game.physics.arcade.collide(this.enemies, this.layer);
        game.physics.arcade.collide(this.enemies, this.enemies);
        
        // Call the 'playerDie' function when the player and an enemy overlap
        game.physics.arcade.overlap(this.player, this.enemies, this.playerDie, null, this);
    },
    
    addMobileInputs: function() {
        // Add the jump button (no changes)
        var jumpButton = game.add.sprite(400, 240, 'jumpButton');
        jumpButton.inputEnabled = true;
        jumpButton.alpha = 0.6;
        jumpButton.events.onInputDown.add(this.jumpPlayer, this);

        // Movement variables
        this.moveLeft = false;
        this.moveRight = false;

        // Add the move left button
        var leftButton = game.add.sprite(25, 240, 'leftButton');
        leftButton.inputEnabled = true;
        leftButton.alpha = 0.5;
        leftButton.events.onInputOver.add(this.setLeftTrue, this);
        leftButton.events.onInputOut.add(this.setLeftFalse, this);
        leftButton.events.onInputDown.add(this.setLeftTrue, this);
        leftButton.events.onInputUp.add(this.setLeftFalse, this);

        // Add the move right button
        var rightButton = game.add.sprite(25, 100, 'rightButton');
        rightButton.inputEnabled = true;
        rightButton.alpha = 0.5;
        rightButton.events.onInputOver.add(this.setRightTrue, this);
        rightButton.events.onInputOut.add(this.setRightFalse, this);
        rightButton.events.onInputDown.add(this.setRightTrue, this);
        rightButton.events.onInputUp.add(this.setRightFalse, this);
    },
    
    setLeftTrue: function() {
        this.moveLeft = true;
    },
    setLeftFalse: function() {
        this.moveLeft = false;
    },
    setRightTrue: function() {
        this.moveRight = true;
    },
    setRightFalse: function() {
        this.moveRight = false;
    },
    
    jumpPlayer: function() {
        // If the player is touching the ground
        if (this.player.body.onFloor()) {
            // Jump with sound
            this.player.body.velocity.y = -320;
            this.jumpSound.play();
        }
    },
    
    //Keep track of how much time player has remaining
    updateTime: function () {
        this.time -= 1; //One second
        this.timeLabel.text = 'time left: ' + this.time;
        
        //Once time runs out, restart the game
        if (this.time <= 0){
            game.state.start('menu');
            this.music.fadeOut(3000);
            this.music.stop();
        }
    },

    movePlayer: function () {
        // If 0 finger are touching the screen
        if (game.input.totalActivePointers == 0) {
            // Make sure the player is not moving
            this.moveLeft = false;
            this.moveRight = false;
        }
        
        // Player moving left
        if (this.cursor.left.isDown || this.wasd.left.isDown || this.moveLeft) {
            this.player.body.velocity.x = -200;
            this.player.animations.play('left');
        }
        
        // Player moving right
        else if (this.cursor.right.isDown || this.wasd.right.isDown || this.moveRight) {
            this.player.body.velocity.x = 200;
            this.player.animations.play('right');
        }
        
        else {
            this.player.body.velocity.x = 0;
            this.player.animations.stop(); // Stop animations
            this.player.frame = 0; // Change frame (stand still)
        }
        
        // If the up arrow key is pressed and the player is on the ground
        if (this.cursor.up.isDown || this.wasd.up.isDown) {
            this.jumpPlayer();
        }
    },
    
    orientationChange: function() {
        // If the game is in portrait (wrong orientation)
        if (game.scale.isPortrait) {
            // Pause the game and add a text explanation
            game.paused = true;
            this.rotateLabel.text = 'rotate your device in landscape';
        }
        // If the game is in landscape (good orientation)
        else {
            // Resume the game and remove the text
            game.paused = false;
            this.rotateLabel.text = '';
        }
    },
    
    takeDiamond: function (player, diamond) {
        // Update the score
        game.global.score += 5;
        this.scoreLabel.text = 'score: ' + game.global.score;
        
        // Change the diamond position
        this.updateDiamondPosition();
        
        //play sound
        this.diamondSound.play();

        //YoYo Player
        game.add.tween(this.player.scale).to({x: 1.3, y: 1.3}, 100).yoyo(true).start();
    },
    
    updateDiamondPosition: function () {
        // Randomly select a position from the spawnPoints group
        var newPosition = this.spawnPoints.getRandom(0, (this.spawnPoints.length - 1));
        
        // Set the new position of the diamond
        this.diamond.reset(newPosition.x, newPosition.y);
        
        //scaling
        this.diamond.scale.setTo(0, 0);
        game.add.tween(this.diamond.scale).to({x: 1, y: 1}, 300).start();
    },
    
    addEnemy: function() {
        // Get the first dead enemy of the group
        var enemy = this.enemies.getFirstDead();
        
        // If there isn't any dead enemy, do nothing
        if (!enemy) {
            return;
        }
        // Initialize the enemy
        
        // Set the anchor point centered at the bottom
        enemy.anchor.setTo(0.5, 1);
        
        // Put the enemy above the top hole
        enemy.reset(game.width/2, 0);
        
        // Add gravity to see it fall
        enemy.body.gravity.y = 500;
        
        //Randomly choose to move left or right when dropped into the game
        enemy.body.velocity.x = 100 * game.rnd.pick([-1, 1]);
        
        //Turning on bounce makes the enemies change direction when they hit a wall
        enemy.body.bounce.x = 1;
        
        //Kill the sprite when it's no longer in the world
        enemy.checkWorldBounds = true;
        enemy.outOfBoundsKill = true;
    },
    
    createWorld: function () {
        //Walls Stuff
        
        // Create the tilemap
        this.map = game.add.tilemap('map');
        
        // Add the tileset to the map
        this.map.addTilesetImage('tileset');
        
        // Create the layer by specifying the name of the Tiled layer
        this.layer = this.map.createLayer('Tile Layer 1');
        
        // Set the world size to match the size of the layer
        this.layer.resizeWorld();
        
        // Enable collisions for the first tilset element (the blue wall)
        this.map.setCollision(1);
        
        //--------------------------------------------------------------------
        //Items Stuff
        // Display the diamond
        this.spawnPoints = game.add.group();
        this.map.createFromObjects('DiamondSpawns', 2, '', 0, true, false, this.spawnPoints);
        this.spawnPoints.forEach(function(loc){
            console.log(loc.x + "," + loc.y);
        }, this);
        
        var spawn = this.spawnPoints.getFirstExists();
        this.diamond = game.add.sprite(spawn.x, spawn.y, 'diamond');
        
        // Add Arcade physics to the diamond
        game.physics.arcade.enable(this.diamond);
        
        // Set the anchor point to its center
        this.diamond.anchor.setTo(0, 0);
        
        // --------------------------------------------------------------------
        //Player Stuff
        // Using predefined vars to center the image
        this.playerRespawn = game.add.group();
        this.map.createFromObjects('PlayerSpawns', 3, '', 0, true, false, this.playerRespawn);
        var respawn = this.playerRespawn.getFirstExists();
        this.player = game.add.sprite(respawn.x, respawn.y, 'player');
        
        //anchor point
        this.player.anchor.setTo(0.5, 0.5);
        
        // Tell Phaser that the player will use the Arcade physics engine in the create function
        game.physics.arcade.enable(this.player);
        
        // Add vertical gravity to the player
        this.player.body.gravity.y = 500;
        
        //Allow player to take damage
        this.playerTakeDamage = true;
        
        //--------------------------------------------------------------------
        //Enemies Stuff
        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        this.enemies.createMultiple(10, 'clown');
        
        // Call 'addEnemy' every 2.2 seconds
        game.time.events.loop((4.2 * game.global.difficulty), this.addEnemy, this);

        //Enemy Behavior check timer
        game.time.events.loop(game.global.difficulty, this.updateEnemies, this);
    },

    updateEnemies: function() {
        //Enemy behavior controller
        this.enemies.forEachAlive(function(enemy){
            //Use bitwise OR operator to trim the decimal points
            if(Math.abs((this.player.y | 0) - enemy.y) <= 25){

                //Player and Enemy share a y-value, enemy sees player
                if (Math.abs((this.player.x | 0) - enemy.x) <= 75){

                    // Enemy is close to the player; jump
                    if (enemy.body.touching.down){

                        // Move the enemy upward (jump)
                        enemy.body.velocity.y = -300;

                        //play sounds
                        this.jumpSound.play();
                    }
                }
                else if (Math.abs((this.player.x | 0) - enemy.x) <= 100){
                    //Not close enough to jump, boost speed for 1 second
                    if(this.player.x - enemy.x < 0){
                        //boost left
                        enemy.body.velocity.x = -200;
                        game.time.events.add(1000, function(){
                            //return to previous velocity
                            enemy.body.velocity.x = -100;
                        }, this); 
                    }
                    else{
                        //boost right
                        enemy.body.velocity.x = 200;
                        game.time.events.add(1000, function(){
                            //return to previous velocity
                            enemy.body.velocity.x = 100;
                        }, this);  
                    }
                }
            }
        }, this);
    },

    playerDie: function(victim, killer) {

        //If the player just died -- within half of a second -- and the
        //  cause of death was an enemy, do not acknowledge deaths.
        //  Deaths by falling will still count.       
        if (killer != null && this.playerTakeDamage == false && killer.key == 'clown'){
            console.log(deathTimer.delay);
            this.player.tint = 0xFF0000;
            this.playerTakeDamage = false;
            timer.stop(false);  //Stop the deathTimer
            timer.start(250);   //Restart DeathTimer w/ 250ms delay
            return;
        }

        // Flash the color white for 300ms
        game.camera.flash(0xFFFFFF, 300);

        // Shake for 300ms with an intensity of 0.02
        game.camera.shake(0.02, 300);

        // Set the position of the emitter on top of the player
        this.emitter.x = this.player.x;
        this.emitter.y = this.player.y;

        // Start the emitter by exploding 15 particles that will live 800ms
        this.emitter.start(true, 800, null, 15);

        //Play sound on death
        this.deadSound.play();

        //triggered when player collides with enemy
        this.deaths += 1;
        this.deathsLabel.text = 'deaths: ' + this.deaths;

        //5 second penalty on death
        this.time -= 4;
        this.updateTime();

        //On death turn player red to tell the player that they
        //  died, and to highlight the player sprite which will
        //  make it easier to find after respawn
        this.player.tint = 0xFF0000;
        this.playerTakeDamage = false;
        timer = game.time.create(false);
        timer.start();
        deathTimer = timer.add(1250, function(){
            this.player.tint = 0xFFFFFF;
            this.playerTakeDamage = true;
            console.log("ded");
        }, this);

        //respawn player in random preset location
        var newPosition = this.playerRespawn.getRandom();
        this.player.reset(newPosition.x, newPosition.y);
    }
}