var aPlayer = aPlayer || {};

var aPlayer = function(index, game, player){
    this.cursor = {
        left:false,
        right:false,
        up:false,
        down:false
    }

    this.input = {
        left:false,
        right:false,
        up:false,
        down:false
    }

    var x = 0;
    var y = 0;

    this.game = game;

    //player
    this.player = game.add.sprite(x, y, 'player', null, 'actors');
    this.player.anchor.setTo(0.5)
    //player physics
    game.physics.arcade.enable(this.player);
    this.player.enableBody = true;
    this.player.body.collideWorldBounds = true;
    this.player.body.immovable = false;
    this.player.body.bounce.setTo(0, 0);
    this.player.body.setSize(
        this.player.body.width * 0.6,
        this.player.body.height * 0.5,
        this.player.body.width * 0.2,
        this.player.body.height * 0.5
    );
    this.player.id = index;
    this.alive = true;
}

aPlayer.prototype.update = function (){
    console.log("hi");
    for (var i in this.input) this.cursor[i] = this.input[i];

    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;

    if (this.cursor.left){
        this.player.body.velocity.x -= 100;
    }
    if (this.cursor.right){
        this.player.body.velocity.x += 100;
    }
    if (this.cursor.up){
        this.player.body.velocity.y -= 100;
    }
    if (this.cursor.down){
        this.player.body.velocity.y += 100;
    }
};
