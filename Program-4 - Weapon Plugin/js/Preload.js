var SpaceHipster = SpaceHipster || {};

//loading the game assets
SpaceHipster.Preload = function(){};

SpaceHipster.Preload.prototype = {
    preload: function() {
        //show loading screen
        this.splash = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
        this.splash.anchor.setTo(0.5);

        this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 128, 'preloadbar');
        this.preloadBar.anchor.setTo(0.5);

        this.load.setPreloadSprite(this.preloadBar);

        //load game assets
        this.load.image('space', 'assets/images/space.png');
        this.load.image('rock', 'assets/images/rock.png');
        this.load.image('asteroid1', 'assets/images/asteroid1.png');
        this.load.image('asteroid2', 'assets/images/asteroid2.png');
        this.load.image('asteroid3', 'assets/images/asteroid3.png');
        this.load.image('playership', 'assets/images/player.png');
        this.load.spritesheet('power', 'assets/images/power.png', 12, 12);
        this.load.image('playerParticle', 'assets/images/player-particle.png');
        this.load.image('bullet', 'assets/images/bullet.png');
        this.load.image('shield', 'assets/images/shield.png');
        this.load.image('powerupShield', 'assets/images/power_shield.png');
        this.load.audio('collect', 'assets/audio/collect.ogg');
        this.load.audio('explosion', 'assets/audio/explosion.ogg');
    },
    
    create: function() {
        this.state.start('MainMenu');
    }
};