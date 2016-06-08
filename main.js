// JavaScript source code

var mainState = {
    //state functions
    preload: function () {
        //load assets; first executed
        game.load.image('logo', 'logo.png');
    },
    create: function () {
        //after preload; set up game assets
        this.spite = game.add.sprite(200, 150, 'logo');
    },
    update: function () {
        //called 60 times/s
        this.sprite.angle += 1;
    },
    render: function () {

    }
};

var game = new Phaaser.Game(400, 300, Phaser.Auto, 'gameDiv');

game.state.add('main', mainState);
game.state.state('main');