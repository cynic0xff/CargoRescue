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
    },
    
    update: function() {
        this.playerInput();
        this.updateMountain();
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
        game.load.image('mountain', 'assets/images/mountain.png');
    },
    createBullets: function() {
        this.bulletTime = 0;
        this.bullet_speed = 550;
        bullets = game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;
        bullets.createMultiple(50, 'bullet');
        bullets.setAll('anchor.x', 0.5);
        bullets.setAll('anchor.y', 0.5);
        bullets.setAll('outOfBoundsKill', true);
        bullets.setAll('checkWorldBounds', true);
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
        
            bullet = bullets.getFirstExists(false);
            
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
    // GAME ELEMENTS */
    loadElements: function() {
        game.load.image('cargo', 'assets/images/cargo.png');
    },
    // GAME WORLD //
    setWorldBounds: function() {
        game.world.setBounds(0, 0, 800*6, 600);   
    },
    setCamera: function() {
        game.camera.follow(this.player, Phaser.Camera.FOLLOW_LOCKON, 0.1);
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
    // CARGO //
    createCargo: function() {
        cargoes = game.add.group();
        cargoes.enableBody = true;
        cargoes.physicsBodyType = Phaser.Physics.ARCADE;
        
        for(x=0; x<5; x++) {
            var cargo = cargoes.create(Math.floor(Math.random() * (800*6)), Math.floor(Math.random() * (game.world.height - 32)), 'cargo');
            //cargo.body.velocity.y = 50 + Math.random(50 + Math.random() * 200);
        }
    }
};


//initialize phaser
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameDiv');

game.state.add('play', playState);
game.state.start('play');