var playState = {
    
    preload: function() {  
        this.loadPlayerAssets();
        this.loadElements();
    },
    
    create: function() {
        this.createPlayer();
        this.setWorldBounds();
        this.setCamera();
        this.setControls();
        this.createStars('#444');
        this.createStars('#fff');
        this.createMountain();
        this.createCargo();
        this.createExplosion();
        this.createEnemies();
        
        this.setupTiming();
    },
    
    update: function() {
        this.playerInput();
        this.updateMountain();
        this.moveEnemies();
        
        //bullet hit cargo
        game.physics.arcade.overlap(this.bullets, this.cargoes, this.collisionHandler, null, this);
        game.physics.arcade.overlap(this.player, this.cargoes, this.playerCollideCargo, null, this);
    },
    
    // PLAYER //
    createPlayer: function() {
        this.player = game.add.sprite(100, 300, 'player');
        this.player.speed = 8;
        this.player.direction = 1; //0=LEFT 1=RIGHT
        this.player.isMoving = false;
        this.player.anchor.setTo(0.5);
        game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.body.collideWorldBounds = true;     //prevent the player from leaving the game area
        this.createBullets();
    },
    loadPlayerAssets: function() {
        game.load.image('player', 'assets/images/player.png');
        game.load.image('bullet', 'assets/images/bullet.png');
    },
    createBullets: function() {
        this.bulletTime = 0;
        this.bullet_speed = 550;
        this.bullets = game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.createMultiple(50, 'bullet');
        this.bullets.setAll('anchor.x', 0.5);
        this.bullets.setAll('anchor.y', 0.5);
        this.bullets.setAll('outOfBoundsKill', true);
        this.bullets.setAll('checkWorldBounds', true);
    },
    playerInput: function() {
      
        if(cursors.left.isDown) {
            this.player.isMoving = true;
            //player left direction
            this.player.direction = 0;
            this.player.x -= this.player.speed;
            this.player.scale.x = -1;
            this.updateMountain();
        } else if(cursors.right.isDown) {
            this.player.isMoving = true;
            this.player.direction = 1;
            this.player.x += this.player.speed;
            this.player.scale.x = 1;
        }
        
        if(cursors.up.isDown)
            this.player.y -= this.player.speed;
        else if(cursors.down.isDown)
            this.player.y += this.player.speed;
        if(!cursors.left.isDown && !cursors.right.isDown)
            this.player.isMoving = false;
            
        if(fireButton.isDown)
            this.fire();
    },
    fire: function() {
        
            bullet = this.bullets.getFirstExists(false);
            
            if(bullet) {
                
                //if the player is holding down the right/left key
                if(cursors.right.isDown) {
                    
                    //position the bullet
                    bullet.reset(this.player.x + 42, this.player.y);
                    
                    //set the speed * 2 because we are already travelling in +x
                    bullet.body.velocity.x += this.bullet_speed * 2;
                }
                else if (cursors.left.isDown) {
                    //position the bullet to the left of the player
                    bullet.reset(this.player.x - 42, this.player.y);
                    
                    //set the speed to * 2 because we are travelling
                    bullet.body.velocity.x -= this.bullet_speed * 2;
                }
                
                //if the player is stationary and facing left
                if(!cursors.right.isDown && !cursors.left.isDown && this.player.direction === 0) {
                    bullet.reset(this.player.x - 42, this.player.y);
                    bullet.body.velocity.x -= this.bullet_speed;
                }
                else if(!cursors.right.isDown && !cursors.left.isDown && this.player.direction === 1) {
                    bullet.reset(this.player.x + 42, this.player.y);
                    bullet.body.velocity.x += this.bullet_speed;
                }
            }
    },
    playerCollideCargo: function(player, cargo) {
          //TODO: display explosition
          cargo.kill();
        this.explode(player);
    },
    setupTiming: function() {
        game.time.events.loop(1000, this.updateEnemyDirection, this);
    },
    
    // GAME ELEMENTS //
    loadElements: function() {
        game.load.image('cargo', 'assets/images/cargo.png');
        game.load.image('mountain', 'assets/images/mountain.png');
        game.load.spritesheet('explosion', 'assets/images/explosion.png', 64, 64, 26);
        game.load.image('enemy', 'assets/images/enemy.png');
    },
    
    // CARGO //
    createCargo: function() {
        this.cargoes = game.add.group();
        this.cargoes.enableBody = true;
        this.cargoes.physicsBodyType = Phaser.Physics.ARCADE;
        
        for(x=0; x<5; x++) {
            var cargo = this.cargoes.create(Math.floor(Math.random() * (800*6)), Math.floor(Math.random() * (game.world.height - 32)), 'cargo');
        }
    },
    collisionHandler: function(bullet, cargo) {
        bullet.kill();
        cargo.kill();
    },
    createExplosion: function() {
        this.explosions = game.add.group();
        this.explosions.createMultiple(30, 'explosion');
    },
    explode: function(player) {
        var sprite = game.add.sprite(player.x, player.y, 'explosion');
        sprite.animations.add('explosion');
        sprite.animations.play('explosion', 40, false);
        this.flash();
    },
    flash: function() {
        //flash screen
        game.camera.flash(0xfffff0, 250);
    },  
    
    // GAME WORLD //
    setWorldBounds: function() {
        game.world.setBounds(0, 0, 800*6, 600);   
    },
    setCamera: function() {
        game.camera.follow(this.player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
    },
    setControls: function() {
        cursors = game.input.keyboard.createCursorKeys();
        fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    },
    createStars: function(color) {
        var bmStar = game.add.bitmapData(1, 1);
        bmStar.ctx.beginPath();
        bmStar.ctx.rect(0, 0, 1, 1);
        bmStar.ctx.fillStyle = color;
        bmStar.ctx.fill();
        stars = game.add.group();
        
        for(var x=0; x<128; x++)
            stars.create(game.world.randomX, game.world.randomY, bmStar);
    },
    createMountain: function() {
        this.mountain = game.add.tileSprite(0, game.height - 100, 4800, 100, 'mountain');   
    },
    updateMountain: function() {
        if(this.player.isMoving) {
            if(this.player.direction === 0)
                this.mountain.tilePosition.x += 4;
            if(this.player.direction === 1)
                this.mountain.tilePosition.x -= 8;
        }
    },
    
    // ENEMIES //
    createEnemies: function() {
        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        this.enemies.physicsBodyType = Phaser.Physics.ARCADE;
        
        for(var x=0; x<8; x++) {
            var enemy = this.enemies.create(Math.floor(Math.random() * 4800), Math.floor(Math.random() * 500), 'enemy');
            enemy.anchor.setTo(0.5, 0.5);
            enemy.body.collideWorldBounds = true;
        }
    },
    moveEnemies: function() {
        
        switch(this.enemy_direction) {
            case 0:
                this.enemies.forEach((enemy) => {
                    enemy.x++;
                });
                    break;
            case 1:
                this.enemies.forEach((enemy) => {
                    enemy.x--;
                });
                    break;                    
            case 2:
                this.enemies.forEach((enemy) => {
                    enemy.y++;
                });
                    break;
            case 3:
                this.enemies.forEach((enemy) => {
                    enemy.y--;
                });
                break;
            case 4:
                this.enemies.forEach((enemy) => {
                    enemy.x++;
                    enemy.y--;
                });
                break;
            case 5:
                this.enemies.forEach((enemy) => {
                    enemy.x--;
                    enemy.y++;
                });
                    break;
            case 6:
                this.enemies.forEach((enemy) => {
                    enemy.x--;
                    enemy.y--;
                });
                    break;
            case 7:
                this.enemies.forEach((enemy) => {
                    enemy.x++;
                    enemy.y++;
                });
                    break;
                default:
                    this.enemies.forEach((enemy) => {
                        enemy.x++;
                    });
        }
    },
    updateEnemyDirection: function() {   
        this.enemy_direction = Math.floor(Math.random() * 8);
    }
};


//initialize phaser
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameDiv');

game.state.add('play', playState);
game.state.start('play');