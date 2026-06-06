class Lose extends Phaser.Scene {
    constructor() {
        super('Lose');
    }

    create() {

        this.add.text(650, 250, 'GAME OVER', {
            fontSize: '50px',
            fill: '#ff0000'
        }).setOrigin(0.5);

        this.add.text(650, 320, 'Press R to Retry', {
            fontSize: '30px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-R', () => {
            this.scene.start('Intro');
        });
    }
}