var mainState = {
	preload: function () {
        game.load.image('player', 'images/wabbit.png');
        game.load.image('wallV', 'images/wallVertical.png');
        game.load.image('wallH', 'images/wallHorizontal.png');
        game.load.image('diamond', 'images/diamond.png');
	},

	create: function () {
        //background color
		game.stage.backgroundColor = '#3498db';
        
        //physics engine
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        //crip pixels
        game.renderer.renderSession.roundPixels = true;

        // Using predefined vars to center the image
        this.player = game.add.sprite(game.width / 2, game.height / 2, 'player');
        
        // Set the anchor point to the top left of the sprite (default value)
        this.player.anchor.setTo(0, 0);
        // Set the anchor point to the top right
        this.player.anchor.setTo(1, 0);
        // Set the anchor point to the bottom left
        this.player.anchor.setTo(0, 1);
        // Set the anchor point to the bottom right
        this.player.anchor.setTo(1, 1);
        this.player.anchor.setTo(0.5, 0.5);
        
        // Tell Phaser that the player will use the Arcade physics engine in the create function
        game.physics.arcade.enable(this.player);
        
        // Add vertical gravity to the player
        this.player.body.gravity.y = 500;
        
        this.cursor = game.input.keyboard.createCursorKeys();
        
        this.createWorld();
        
        // Display the diamond
        this.diamond = game.add.sprite(60, 140, 'diamond');
        // Add Arcade physics to the diamond
        game.physics.arcade.enable(this.diamond);
        // Set the anchor point to its center
        this.diamond.anchor.setTo(0.5, 0.5);
        
        // Display the score
        this.scoreLabel = game.add.text(30, 30, 'score: 0', { font: '18px Arial', fill: '#ffffff' });
        
        // Initialize the score variable
        this.score = 0;
	},

	update: function () {
        // Tell Phaser that the player and the walls should collide
        game.physics.arcade.collide(this.player, this.walls);
        
        this.movePlayer();
        
        if (!this.player.inWorld) {
            this.playerDie();
        }
        
        game.physics.arcade.overlap(this.player, this.diamond, this.takeDiamond, null, this);
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
        game.state.start('main');
    }
};

var game = new Phaser.Game(500, 340, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');