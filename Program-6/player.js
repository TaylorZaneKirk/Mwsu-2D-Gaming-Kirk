var aPlayer = aPlayer || {};

var playState = {
    /**
    * Establish eureca client and setup some globals
    */
    init: function(){
        //Add the server client for multiplayer
        this.client = new Eureca.Client();

        game.global.ready = false;

        game.global.player = false;

    },

    /**
    * Calls the dude's update method
    */
    update: function() {
        if (!game.global.player)
            return;


        game.global.player.update();

    },

    /**
    * Initialize the multiPlayer methods
    * and bind some keys to variables
    */
    create: function(){
        this.initMultiPlayer(game,game.global);
    },

    /**
    * Handles communication with the server
    */
    initMultiPlayer: function(game,globals){

        // Reference to our eureca so we can call functions back on the server
        var eurecaProxy;

        /**
        * Fires on initial connection
        */
        this.client.onConnect(function (connection) {
            console.log('Incoming connection', connection);

        });
        /**
        * When the connection is established and ready
        * we will set a local variable to the "serverProxy"
        * sent back by the server side.
        */
        this.client.ready(function (serverProxy) {
            // Local reference to the server proxy to be
            // used in other methods within this module.
            eurecaProxy = serverProxy;

        });

        /**
        * This sets the players id that we get from the server
        * It creates the instance of the player, and communicates
        * it's state information to the server.
        */
        this.client.exports.setId = function(id){
            console.log("Setting Id:" + id);

            // Assign my new connection Id
            globals.myId = id;

            // Create new "dude"
            globals.player = new aPlayer(id, game, eurecaProxy);

            // Put instance of "dude" into list
            globals.playerList[id] = globals.player.state;

            //Send state to server
            eurecaProxy.initPlayer(id, globals.player.state);

            // debugging
            console.log(globals.playerList);

            // Were ready to go
            globals.ready = true;

            // Send a handshake to say hello to other players.
            eurecaProxy.handshake();

        }

        this.client.exports.setMap = function(map){
            globals.myMap = map;
        }

        /**
        * Called from server when another player "disconnects"
        */
        this.client.exports.kill = function(id){
            if (globals.playerList[id]) {
                globals.playerList[id].kill();
                console.log('killing ', id, globals.playerList[id]);
            }
        }

        /**
        * This is called from the server to spawn enemy's in the local game
        * instance.
        */
        this.client.exports.spawnEnemy = function(id, enemy_state){

            if (id == globals.myId){
                return; //this is me
            }

            //if the id doesn't exist in your local table
            // then spawn the enemy

            console.log('Spawning New Player');

            console.log(enemy_state);

            globals.playerList[id] = enemy_state;

            console.log(globals.playerList);

        }

        /**
        * This is called from the server to update a particular players
        * state.
        */
        this.client.exports.updateState = function(id,player_state){
            console.log(id,player_state);

            // Don't do anything if its me
            if(globals.myId == id){
                return;
            }

            // If player exists, update that players state.
            if (globals.playerList[id])  {
                globals.playerList[id].state = player_state;
            }

            //now how do we update everyone??
        }


    },
    /**
    * Not used
    */
    render: function(){

    },
    /**
    * Not used, but could be called to go back to the menu.
    */
    startMenu: function() {
        game.state.start('menu');
    },
};

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
