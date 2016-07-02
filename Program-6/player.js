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


    function init(index, game, proxyServer){

        player_id = index;

        proxy = proxyServer;

        player = game.add.sprite(x, y, 'player');
        upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT)

        alive = true;
        state.alive = true;
        startTime = game.time.time;
        player.anchor.setTo(0.5)
        game.physics.arcade.enable(player);
        player.enableBody = true;
        player.body.collideWorldBounds = true;
        player.body.immovable = false;
        player.body.bounce.setTo(0, 0);
        player.body.setSize(
            player.body.width * 0.6,
            player.body.height * 0.5,
            player.body.width * 0.2,
            player.body.height * 0.5
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

    function update(collisions){
        game.physics.arcade.collide(player, collisions);

        state.x = player.x;
        state.y = player.y;
        state.alive = alive;
        proxy.handleState(player_id,state);

        player.body.velocity.x = 0;
        player.body.velocity.y = 0;

        if (leftKey.isDown){
            player.body.velocity.x -= 100;
        }
        if (rightKey.isDown){
            player.body.velocity.x += 100;
        }
        if (upKey.isDown){
            player.body.velocity.y -= 100;
        }
        if (downKey.isDown){
            player.body.velocity.y += 100;
        }
    };

    function kill() {
        alive = false;
        player.kill();
    };

    function reset(x, y){
        player.reset(x, y);
    }

    function render() {};

    init(index, game, proxyServer);

    return {
        render : render,
        updateState : updateState,
        update : update,
        reset : reset,
        kill : kill,
        state: state
    };
};
