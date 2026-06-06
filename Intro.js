class Intro extends Phaser.Scene {
    constructor() {
        super('Intro');
    }

    create() {

        this.add.text(650, 250, 'FOOD FACTORY ESCAPE', {
            fontSize: '50px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(650, 320, 'Press SPACE to Start', {
            fontSize: '30px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(650, 400, 'A and D for movement, Space to Jump', {
            fontSize: '30px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('MainScene');
        });
    }
}