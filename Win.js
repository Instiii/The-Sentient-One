class Win extends Phaser.Scene {
    constructor() {
        super('Win');
    }

    create(data = {}) {

        const finalScore = data.score || 0;
        const finalLives = data.lives || 0; 

        const healthBonus = finalLives * 100; // Each remaining life adds 100 points
        const totalScore = finalScore + healthBonus;    

        this.add.text(650, 250, 'YOU WIN!', {
            fontSize: '50px',
            fill: '#00ff00'
        }).setOrigin(0.5);

        this.add.text(650, 320, `Final Score: ${finalScore}`, {
            fontSize: '30px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(650, 390, `Health Bonus: +${healthBonus}`, {
            fontSize: '30px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(650, 460, `Total Score: ${totalScore}`, {
            fontSize: '30px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(650, 530, 'Press R to Restart', {
            fontSize: '30px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-R', () => {
            this.scene.start('Intro');
        });
    }
}