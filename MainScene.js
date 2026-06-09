class MainScene extends Phaser.Scene {
    
    

    constructor() {
        super('MainScene');

        this.levelOrder = ['level1', 'level2', 'level3', 'level4'];
        this.currentIndex = 0;
    }

    preload() {
        // TILEMAP
        this.load.tilemapTiledJSON('level1', 'assets/maps/level1.json');
        this.load.tilemapTiledJSON('level2', 'assets/maps/level2.json');
        this.load.tilemapTiledJSON('level3', 'assets/maps/level3.json');
        this.load.tilemapTiledJSON('level4', 'assets/maps/level4.json');

        // TILESETS
        this.load.image('platformTiles', 'assets/tiles/pixel-platformer.png');
        this.load.image('industrialTiles', 'assets/tiles/industrial.png');
        this.load.image('foodTiles', 'assets/tiles/food.png');

        // IMAGES
        this.load.image('player', 'assets/images/player.png');
        this.load.image('lollipop', 'assets/images/lollipop.png');
        this.load.image('pizza', 'assets/images/pizza.png');
        this.load.image('whipped', 'assets/images/whipped.png');
        this.load.image('runEffect', 'assets/images/flame_01.png');
        this.load.image('jumpEffect', 'assets/images/muzzle_02.png');
        
        //AUDIO
        this.load.audio('jumpSfx', 'assets/audio/jump.ogg');
        this.load.audio('collectSfx', 'assets/audio/collect.ogg');
        
    }

    create(data = {}) {
        // CREATE TILEMAP
        const levelKey = data.levelKey || 'level1';
        this.currentIndex = this.levelOrder.indexOf(levelKey);
        const map = this.make.tilemap({
            key: levelKey
        });

        this.add.rectangle(0, 0, map.widthInPixels, map.heightInPixels, 0xffb36b).setOrigin(0);

        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // CONNECT TILESETS
        const platformSet = map.addTilesetImage('tileset-tiles', 'platformTiles');
        const industrialSet = map.addTilesetImage('Industrial', 'industrialTiles');
        const foodSet = map.addTilesetImage('Collectibles', 'foodTiles');

        // CREATE LAYERS
        this.platformLayer = map.createLayer('Platforms', [platformSet, industrialSet, foodSet], 0, 0);
        this.decorationLayer = map.createLayer('Decorations', [platformSet, industrialSet, foodSet], 0, 0);
        this.deadlyLayer = map.createLayer('Deadly', [platformSet, industrialSet, foodSet], 0, 0);

        // ENABLE PLATFORM COLLISION
        this.platformLayer.setCollisionByExclusion([-1]);
        this.deadlyLayer.setCollisionByExclusion([-1]);
        
        // FIND PLAYER SPAWN
        const objectsLayer = map.getObjectLayer('Objects');
        console.log(objectsLayer);
        console.log(map.getObjectLayer('Objects').objects);

        const spawnPoint = objectsLayer.objects.find(
            obj => obj.properties?.find(p => p.name === 'type')?.value === 'PlayerSpawn'
        );

        this.spawnX = spawnPoint.x;
        this.spawnY = spawnPoint.y;

        // CREATE PLAYER
        this.player = this.physics.add.sprite(
            this.spawnX,
            this.spawnY,
            'player'
        );

        //this.player.setCollideWorldBounds(true);

        // PLAYER COLLISION
        this.physics.add.collider(this.player, this.platformLayer);
        this.physics.add.collider(this.player, this.deadlyLayer, 
            () => {
                this.playerDie();
            }
        );

        this.platformGroup = this.physics.add.group();
        this.fallingPlatforms = [];

        map.getObjectLayer('Objects').objects.forEach(obj => {

            const type = obj.properties?.find(p => p.name === 'type')?.value;

            // ── Only falling platforms ─────────────────────────────
            if (type !== 'Falling') return;

            const platform = this.add.rectangle(
                obj.x + obj.width / 2,
                obj.y + obj.height / 2,
                obj.width,
                obj.height,
                0xC8A060
            );

            this.physics.add.existing(platform);
            this.platformGroup.add(platform);

            platform.body.setImmovable(true);
            platform.body.setAllowGravity(false);

            this.physics.add.collider(this.player, platform);

            this.fallingPlatforms.push({
                sprite: platform,
                triggered: false
            });
        });

        // PARTICLES
        this.runParticles =  this.add.particles(-100, 0, 'runEffect', {
            speed: 15,
            lifespan: 200,
            scale: { start: 0.05, end: 0},
            quantity: 1,
            on: false
        });

        this.jumpParticles =  this.add.particles(-100, 0, 'jumpEffect', {
            speed: {min: -100, max: 100},
            lifespan: 250,
            scale: { start: 0.10, end: 0},
            quantity: 8,
            on: false
        });

        // SOUNDS
        this.jumpSound = this.sound.add('jumpSfx');
        this.collectSound = this.sound.add('collectSfx');

        // CAMERA
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setZoom(2);

        // LIVES
        this.lives = this.scene.settings.data?.lives ?? 3;
        this.livesText = this.add.text (350, 240, `Lives: ${this.lives} / 3`, 
            {
                fontSize: '24px',
                fill: '#fff4dd'
            }
        );
        

        // SCORE
        this.score = this.scene.settings.data?.score ?? 0;
        this.scoreText = this.add.text(350, 200, `Score: ${this.score}`, 
            {
                fontSize: '24px',
                fill: '#2b2b2b'
            }
        );

        this.livesText.setScrollFactor(0);
        this.scoreText.setScrollFactor(0);

        this.collectibles = this.physics.add.group();

        map.getObjectLayer('Objects').objects.forEach(obj => {
            
            const type = obj.properties?.find(p => p.name === 'type')?.value;
            const value = obj.properties?.find(p => p.name === 'score')?.value ?? 1;

            if(type !== 'Lollipop' && type !== 'Pizza' && type !== 'Whipped') return;

            let texture = 'lollipop';
            if (type === 'Pizza') texture = 'pizza';
            if (type === 'Whipped') texture = 'whipped';

            const item = this.collectibles.create(obj.x, obj.y, texture);

            item.itemType = type;
            item.value = value;

            item.body.setAllowGravity(false);
            item.body.setImmovable(true);
        });
        
        this.physics.add.overlap(
            this.player,
            this.collectibles,
            (player, item) => {

                if (item.itemType === 'Whipped') {
                    this.lives = Math.min(this.lives + 1, 3);
                    this.livesText.setText(`Lives: ${this.lives} / 3`);
                } else {
                    this.score += item.value;
                    this.scoreText.setText(`Score: ${this.score}`);
                }

                item.destroy();
                this.collectSound.play();

            }
        );


        map.getObjectLayer('Objects').objects.forEach(obj => {

            if (obj.name !== 'Flag1') return;

            const flagZone = this.add.zone(obj.x, obj.y, obj.width, obj.height);
            this.physics.add.existing(flagZone, true);

            this.physics.add.overlap(this.player, flagZone, () => {
                console.log("Touched Flag");
                const nextLevel = this.levelOrder[this.currentIndex + 1];

                if (nextLevel) {
                    this.scene.start('MainScene', { 
                        levelKey: this.levelOrder[this.currentIndex+1],
                        score: this.score,
                        lives: this.lives
                    });
                } else {
                    this.scene.start('Win', {
                        score: this.score,
                        lives: this.lives
                    });
                }
            });
        });

        this.fallingPlatforms.forEach(p => {

            this.physics.add.collider(this.player, p.sprite, () => {

                if (p.triggered) return;
                p.triggered = true;

                this.time.delayedCall(10, () => {

                    p.sprite.body.setAllowGravity(true);
                    p.sprite.body.setImmovable(false);
                    p.sprite.setFillStyle(0xAA7030);

                });

            });

        });

        // CONTROLS
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D
        });

    }

    update() {
        const speed = 150; //150
        const jumpPower = -300; //300

        // LEFT
        if (this.keys.A.isDown) {
            this.player.setVelocityX(-speed);
        }
        // RIGHT
        else if (this.keys.D.isDown) {
            this.player.setVelocityX(speed);
        }
        // IDLE
        else {
            this.player.setVelocityX(0);
        }

        // JUMP
        if (
            Phaser.Input.Keyboard.JustDown(this.cursors.space) &&
            this.player.body.blocked.down
        ) {

            this.player.setVelocityY(jumpPower);

            //Jump Audio
            this.jumpSound.play();

            this.jumpParticles.emitParticleAt(this.player.x+100, this.player.y);
        }

        if (this.player.body.blocked.down && this.player.body.velocity.x !==0) {
            this.runParticles.emitParticleAt(this.player.x+100, this.player.y + 10);
        }
    }

    playerDie() {
        this.lives--;

        this.livesText.setText(`Lives: ${this.lives} / 3`);
        if (this.lives <= 0) {
            this.scene.start('Lose');
            return;
        }

        this.respawnPlayer();
    }

    respawnPlayer(){
        this.player.setPosition(this.spawnX, this.spawnY);
        this.player.setVelocity(0, 0);
    }


}