var mainState = {
	preload: function () {
        game.load.image('player', 'images/wabbit.png');
        game.load.image('clown', 'images/clown.png');
        game.load.image('wallV', 'images/wallVertical.png');
        game.load.image('wallH', 'images/wallHorizontal.png');
        game.load.image('diamond', 'images/diamond.png');
	},

	create: function () {
        //Game Stuff-------------------------------------------------------------
        //background color
		game.stage.backgroundColor = '#3498db';
        
        //physics engine
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        //crip pixels
        game.renderer.renderSession.roundPixels = true;
        
        //Arrow-Key input
        this.cursor = game.input.keyboard.createCursorKeys();
        
        //Display the score/deaths
        this.scoreLabel = game.add.text(30, 30, 'score: 0', { font: '18px Arial', fill: '#ffffff' });
        this.deathsLabel = game.add.text(380, 300, 'deaths: 0', { font: '18px Arial', fill: '#ffffff' });
        this.timeLabel = game.add.text(370, 30, 'time left: 120', { font: '18px Arial', fill: '#ffffff' });
        
        // Initialize the score & deaths variables
        this.score = 0;
        this.deaths = 0;
        this.time = 120;
        
        //Generate Walls, player, items, and enemies
        this.createWorld();
        
        //Start timer
        game.time.events.loop(Phaser.Timer.SECOND, this.updateTime, this);
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

        // Call the 'playerDie' function when the player and an enemy overlap
        game.physics.arcade.overlap(this.player, this.enemies, this.playerDie, null, this);
	},
    
    //Keep track of how much time player has remaining
    updateTime: function () {
        this.time -= 1; //One second
        this.timeLabel.text = 'time left: ' + this.time;
        
        //Once time runs out, restart the game
        if (this.time <= 0)
           game.state.start('main'); 
    },
    
    movePlayer: function () {
        // If the left arrow key is pressed
        if (this.cursor.left.isDown) {
            // Move the player to the left
            // The velocity is in pixels per second
            this.player.body.velocity.x = -200;
        }
        // If the right arrow key is pressed
        else if (this.cursor.right.isDown) {
        // Move the player to the right
            this.player.body.velocity.x = 200;
        }
        // If neither the right or left arrow key is pressed
        else {
            // Stop the player
            this.player.body.velocity.x = 0;
        }
        
        // If the up arrow key is pressed and the player is on the ground
        if (this.cursor.up.isDown && this.player.body.touching.down) {
            // Move the player upward (jump)
            this.player.body.velocity.y = -320;
        }
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
    },
    
    takeDiamond: function (player, diamond) {
        // Update the score
        this.score += 5;
        this.scoreLabel.text = 'score: ' + this.score;
        // Change the diamond position
        this.updateDiamondPosition();
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
    },
    
    playerDie: function() {
        if (this.playerTakeDamage == false)
            return;
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
        this.deathTimer = game.time.events.add(500, function(){
            this.player.tint = 0xFFFFFF;
            this.playerTakeDamage = true;
         }, this);
        
        //respawn player in random preset location
        var spawnPosition = [{x: 135, y: 60}, {x: 365, y: 300}]
        var newPosition = game.rnd.pick(spawnPosition);
        this.player.reset(newPosition.x, newPosition.y);
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
    }
};

var game = new Phaser.Game(500, 340, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');