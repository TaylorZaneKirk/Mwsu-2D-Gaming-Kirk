// Initialize Phaser
var game = new Phaser.Game(500, 340, Phaser.AUTO, '');

// Define our global variable
game.global = {
    score: 0,
    
    //Difficulty settings: 1000 = easy / 500 = normal / 250 = hard
    difficulty: 500
};

// Add all the states
game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('play', playState);

// Start the 'boot' state
game.state.start('boot');