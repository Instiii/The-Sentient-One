class Win extends Phaser.Scene {
    constructor() {
        super('Win');
    }

    create() {

        this.add.text(650, 250, 'YOU WIN!', {
            fontSize: '50px',
            fill: '#00ff00'
        }).setOrigin(0.5);

        this.add.text(650, 320, 'Press R to Restart', {
            fontSize: '30px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-R', () => {
            this.scene.start('Intro');
        });
    }
}