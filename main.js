const config = {

    type: Phaser.AUTO,

    width: 1280,
    height: 720,

    physics: {
        default: 'arcade',

        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },

    scene: [Intro, MainScene, Win, Lose]
};

// START GAME
new Phaser.Game(config);