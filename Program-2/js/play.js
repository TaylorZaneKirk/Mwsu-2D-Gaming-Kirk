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
        
        //Arrow-Key input
        this.cursor = game.input.keyboard.createCursorKeys();
        
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
        game.physics.arcade.collide(this.player, this.walls);
        
        this.movePlayer();
        
        if (!this.player.inWorld) {
            this.playerDie();
        }
        
        game.physics.arcade.overlap(this.player, this.diamond, this.takeDiamond, null, this);
        
        //Enemy Stuff------------------------------------------------
        // Make the enemies and walls collide
        game.physics.arcade.collide(this.enemies, this.walls);
        game.physics.arcade.collide(this.enemies, this.enemies);

        // Call the 'playerDie' function when the player and an enemy overlap
        game.physics.arcade.overlap(this.player, this.enemies, this.playerDie, null, this);
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
        if (this.cursor.left.isDown) {
            this.player.body.velocity.x = -200;
            this.player.animations.play('left'); // Left animation
        }
        else if (this.cursor.right.isDown) {
            this.player.body.velocity.x = 200;
            this.player.animations.play('right'); // Right animation
        }
        else {
            this.player.body.velocity.x = 0;
            this.player.animations.stop(); // Stop animations
            this.player.frame = 0; // Change frame (stand still)
        }
        
        // If the up arrow key is pressed and the player is on the ground
        if (this.cursor.up.isDown && this.player.body.touching.down) {
            // Move the player upward (jump)
            this.player.body.velocity.y = -320;
            
            //play sounds
            this.jumpSound.play();
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
        // Store all the possible diamond positions in an array
        var diamondPosition = [
            {x: 140, y: 60}, {x: 360, y: 60}, // Top row
            {x: 60, y: 140}, {x: 440, y: 140}, // Middle row
            {x: 130, y: 300}, {x: 370, y: 300} // Bottom row
        ];
        
        // Remove the current diamond position from the array
        // Otherwise the diamond could appear at the same spot twice in a row
        for (var i = 0; i < diamondPosition.length; i++) {
            if (diamondPosition[i].x == this.diamond.x) {
                diamondPosition.splice(i, 1);
            }
        }
        
        // Randomly select a position from the array with 'game.rnd.pick'
        var newPosition = game.rnd.pick(diamondPosition);
        
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
        // Create our group with Arcade physics
        this.walls = game.add.group();
        this.walls.enableBody = true;
        
        // Create the 10 walls in the group
        game.add.sprite(0, 0, 'wallV', 0, this.walls); // Left
        game.add.sprite(480, 0, 'wallV', 0, this.walls); // Right
        game.add.sprite(0, 0, 'wallH', 0, this.walls); // Top left
        game.add.sprite(300, 0, 'wallH', 0, this.walls); // Top right
        game.add.sprite(0, 320, 'wallH', 0, this.walls); // Bottom left
        game.add.sprite(300, 320, 'wallH', 0, this.walls); // Bottom right
        game.add.sprite(-100, 160, 'wallH', 0, this.walls); // Middle left
        game.add.sprite(400, 160, 'wallH', 0, this.walls); // Middle right
        
        var middleTop = game.add.sprite(100, 80, 'wallH', 0, this.walls);
        middleTop.scale.setTo(1.5, 1);
        var middleBottom = game.add.sprite(100, 240, 'wallH', 0, this.walls);
        middleBottom.scale.setTo(1.5, 1);
        
        // Set all the walls to be immovable
        this.walls.setAll('body.immovable', true);
        
        // --------------------------------------------------------------------
        //Player Stuff
        // Using predefined vars to center the image
        this.player = game.add.sprite(game.width / 2, game.height / 2, 'player');
        
        //anchor point
        this.player.anchor.setTo(0.5, 0.5);
        
        // Tell Phaser that the player will use the Arcade physics engine in the create function
        game.physics.arcade.enable(this.player);
        
        // Add vertical gravity to the player
        this.player.body.gravity.y = 500;
        
        //Allow player to take damage
        this.playerTakeDamage = true;
        
        //--------------------------------------------------------------------
        //Items Stuff
        // Display the diamond
        this.diamond = game.add.sprite(60, 140, 'diamond');
        // Add Arcade physics to the diamond
        game.physics.arcade.enable(this.diamond);
        // Set the anchor point to its center
        this.diamond.anchor.setTo(0.5, 0.5);
        
        //--------------------------------------------------------------------
        //Enemies Stuff
        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        this.enemies.createMultiple(10, 'clown');
        
        // Call 'addEnemy' every 2.2 seconds
        game.time.events.loop(2200, this.addEnemy, this);
        
        //Enemy Behavior check timer
        game.time.events.loop(250, this.updateEnemies, this);
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
                        enemy.body.velocity.x = -200;
                        game.time.events.add(1000, function(){
                            enemy.body.velocity.x = -100;
                        }, this); 
                    }
                    else{
                        enemy.body.velocity.x = 200;
                        game.time.events.add(1000, function(){
                            enemy.body.velocity.x = 100;
                         }, this);  
                    }
                }
            }
        }, this);
    },
    
    startMenu: function() {
        game.state.start('menu');
    },

    playerDie: function(victim, killer) {
        
        //If the player just died -- within half of a second -- do not
        //  acknowledge deaths
        if (killer != null && this.playerTakeDamage == false && killer.key == 'clown'){
            this.deathTimer.start;
            return;
        }
        
        // Flash the color white for 300ms
        game.camera.flash(0xffffff, 300);
        
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
        this.deathTimer = game.time.events.add(1250, function(){
            this.player.tint = 0xFFFFFF;
            this.playerTakeDamage = true;
         }, this);
        
        //respawn player in random preset location
        var spawnPosition = [{x: 135, y: 60}, {x: 365, y: 300}]
        var newPosition = game.rnd.pick(spawnPosition);
        this.player.reset(newPosition.x, newPosition.y);
    }
}