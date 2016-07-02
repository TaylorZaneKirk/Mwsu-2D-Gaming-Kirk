var aPlayer = aPlayer || {};

var aPlayer = function(index, game, proxyServer){
    var x = 0;
    var y = 0;
    var state = {};
    var startTime;              // starting game time
    var alive;
    var player_id;
    var proxy;
    var player;

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

    function init(index, game, proxyServer){

        player_id = index;

        proxy = proxyServer;

        player = game.add.sprite(x, y, 'player');
        alive = true;
        startTime = game.time.time;
        this.player.anchor.setTo(0.5)
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
        player.inputEnabled = true;
    };

    function updateState (enemy_id, state){
        if(game.time.time - startTime > 2000){
            console.log(game.time.time);
            for(s in state){
                console.log(state[s]);
            }
            startTime = game.time.time;
        }
    };

    function update(){
        for (var i in this.input) this.cursor[i] = this.input[i];

        console.log(this.cursor.left);
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

    function kill() {
        alive = false;
        player.kill();
    };

    function render() {};

    init(index, game, proxyServer);

    return {
        render : render,
        updateState : updateState,
        update : update,
        kill : kill
    };
};
