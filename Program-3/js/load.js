var loadState = {
    preload: function () {
        // Add a 'loading...' label on the screen
        var loadingLabel = game.add.text(game.width/2, 150, 'loading...', { font: '30px Arial', fill: '#ffffff' });
        loadingLabel.anchor.setTo(0.5, 0.5);
        
        // Display the progress bar
        var progressBar = game.add.sprite(game.width/2, 200, 'progressBar');
        progressBar.anchor.setTo(0.5, 0.5);
        game.load.setPreloadSprite(progressBar);
        
        // Load all our assets
        //Images------------------------------------------------------------------
        //game.load.image('player', 'assets/wabbit.png');
        game.load.spritesheet('player', 'assets/player2.png', 20, 20);
        game.load.spritesheet('mute', 'assets/muteButton.png', 28, 22);
        
        // Load the tileset information
        game.load.image('tileset', 'assets/tileset.png');
        game.load.tilemap('map', 'assets/map.json', null, Phaser.Tilemap.TILED_JSON);
        
        game.load.image('clown', 'assets/clown.png');
        game.load.image('diamond', 'assets/diamond.png');
        game.load.image('pixel', 'assets/pixel.png');
        
        game.load.image('jumpButton', 'assets/jumpButton.png');
        game.load.image('rightButton', 'assets/rightButton.png');
        game.load.image('leftButton', 'assets/leftButton.png');
        
        // Load a new asset that we will use in the menu state
        game.load.image('background', 'assets/background.png');
        
        //Sounds----------------------------------------------------------------
        // Sound when the player jumps
        game.load.audio('jump', ['assets/jump.ogg', 'assets/jump.mp3']);
        // Sound when the player takes a coin
        game.load.audio('diamond', ['assets/diamond.ogg', 'assets/diamond.mp3']);
        // Sound when the player dies
        game.load.audio('dead', ['assets/dead.ogg', 'assets/dead.mp3']);
        // Background music
        game.load.audio('music', ['assets/music.ogg', 'assets/music.mp3']);
    },
    
    create: function() {
        // Go to the menu state
        game.state.start('menu');
    }
};