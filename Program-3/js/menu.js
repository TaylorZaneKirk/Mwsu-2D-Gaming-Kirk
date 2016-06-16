var menuState = {
    create: function() {
        // If 'bestScore' is not defined
        // It means that this is the first time the game is played
        if (!localStorage.getItem('bestScore')) {
            // Then set the best score to 0
            localStorage.setItem('bestScore', 0);
        }
        // If the score is higher than the best score
        if (game.global.score > localStorage.getItem('bestScore')) {
            // Then update the best score
            localStorage.setItem('bestScore', game.global.score);
        }
        
        // Add a background image
        game.add.image(0, 0, 'background');
        
        // Display the name of the game
        var nameLabel = game.add.text(game.width/2, 80, 'Killer Clown Simulator', { font: '50px Arial', fill: '#FFFFFF' });
        game.add.tween(nameLabel).to({angle: -2}, 500).to({angle: 2}, 1000).to({angle: 0}, 500).loop().start();
        nameLabel.anchor.setTo(0.5, 0.5);
        
        // Show the score at the center of the screen
        var text = 'score: ' + game.global.score + '\nbest score: ' + localStorage.getItem('bestScore');
        if (game.device.desktop) {
            text = 'press the up arrow key to start';
        }
        else {
            text = 'touch the screen to start';
        }
        var scoreLabel = game.add.text(game.width/2, game.height/2, text, { font: '25px Arial', fill: '#FFFFFF', align: 'center' });
        scoreLabel.anchor.setTo(0.5, 0.5);
        
        // Explain how to start the game
        var startLabel = game.add.text(game.width/2, game.height-80,
            'press the up arrow key to start',
            { font: '25px Arial', fill: '#FFFFFF' });
        startLabel.anchor.setTo(0.5, 0.5);
        
        var difficultyLabel = game.add.text(game.width/2, game.height-25,
            "press to change difficulty: EASY",
            { font: '20px Arial', fill: '#FFFFFF' });
        difficultyLabel.anchor.setTo(0.5, 0.5);
        difficultyLabel.inputEnabled = true;
        difficultyLabel.events.onInputUp.add(this.toggleDifficulty, this);
        
        // Add the button that calls the 'toggleSound' function when pressed
        this.muteButton = game.add.button(20, 20, 'mute', this.toggleSound,this);
        
        // Create a new Phaser keyboard variable: the up arrow key
        // When pressed, call the 'start' function once
        var upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        upKey.onDown.add(this.start, this);
        
        if (!game.device.desktop) {
            game.input.onDown.add(this.start, this);
        }
    },
    
    start: function() {
        // Start the actual game
        // If we tap in the top left corner of the game on mobile
        if (!game.device.desktop && (game.input.y < 50 && game.input.x < 60) || game.input.y > 400) {
            // It means we want to mute the game, so we don't start the game
            return;
        }
        
        game.state.start('play');
    },
    
    toggleDifficulty: function(difLabel) {
        if (game.global.difficulty == 1000){
            difLabel.text = "press to change difficulty: NORMAL"
            game.global.difficulty = 500;
            return;
        }
        else if (game.global.difficulty == 500){
            difLabel.text = "press to change difficulty: HARD"
            game.global.difficulty = 250;
            return;
        }
        else if (game.global.difficulty == 250){
            difLabel.text = "press to change difficulty: EASY"
            game.global.difficulty = 1000;
            return;
        }
    },
    
    // Function called when the 'muteButton' is pressed
    toggleSound: function() {
        // Switch the variable from true to false, or false to true
        // When 'game.sound.mute = true', Phaser will mute the game
        game.sound.mute = !game.sound.mute;
        
        // Change the frame of the button
        this.muteButton.frame = game.sound.mute ? 1 : 0;
    }
};