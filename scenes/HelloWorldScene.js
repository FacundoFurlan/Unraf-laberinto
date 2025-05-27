export default class GameScene extends Phaser.Scene {
  constructor() {
      super('GameScene');
  }

  preload() {
      this.load.image('tiles', 'public/assets/tileset.png');
      this.load.tilemapTiledJSON('map', 'public/assets/tileset.json');
      this.load.image('collectible', 'public/assets/diamond.png');
      this.load.image('player', 'public/assets/Ninja.png');
      this.load.image('goal', 'public/assets/triangle.png');
    }
    
    create() {
    this.lights.enable().setAmbientColor(0x000000);
    // MAPA Y TILESET
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('4 BigSet', 'tiles');
    const groundLayer = map.createLayer('Ground', tileset);
    const wallsLayer = map.createLayer('Walls', tileset);
    wallsLayer.setCollisionByProperty({ collides: true });

    groundLayer.setPipeline('Light2D');
    wallsLayer.setPipeline('Light2D');

    // JUGADOR
    this.player = this.physics.add.sprite(250, 300, 'player')
    .setScale(.02)
    .refreshBody()
    .setPipeline('Light2D');    // <- aquí
    // Crea una luz de radio 200px que siga al jugador
    this.playerLight = this.lights.addLight(
      this.player.x,
      this.player.y,
      100      // radio en píxeles
    ).setIntensity(1);

    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, wallsLayer);

    // CAMARA
    this.cameras.main.setZoom(2);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player);

    // CONTROLES
    this.cursors = this.input.keyboard.createCursorKeys();

    // RECOLECTABLES
    this.collected = 0;
    this.collectibles = this.add.group();

    const item1 = this.physics.add.sprite(250, 250, "collectible").setScale(.2).refreshBody()
    const item2 = this.physics.add.sprite(250, 215, "collectible").setScale(.2).refreshBody()
    const item3 = this.physics.add.sprite(250, 185, "collectible").setScale(.2).refreshBody()
    const item4 = this.physics.add.sprite(250, 153, "collectible").setScale(.2).refreshBody()
    const item5 = this.physics.add.sprite(250, 120, "collectible").setScale(.2).refreshBody()
    this.collectibles.add(item1);
    this.collectibles.add(item2);
    this.collectibles.add(item3);
    this.collectibles.add(item4);
    this.collectibles.add(item5);

    this.collectibles.children.iterate(item => {
      item.setPipeline('Light2D');
    });

    this.physics.add.overlap(this.player, this.collectibles, (player, item) => {
      item.destroy();
      this.collected++;
    });

    // META / OBJETIVO
    this.goal = this.physics.add.sprite(20, 40, 'goal').setScale(.2);
    this.physics.add.overlap(this.player, this.goal, () => {
        if (this.collected >= 5) {
            this.add.text(this.player.x - 100, this.player.y - 40, '¡Ganaste!', { fontSize: '24px', fill: '#fff' });
            this.physics.pause();
        } else {
            this.add.text(this.player.x - 120, this.player.y - 40, 'Te faltan objetos!', { fontSize: '16px', fill: '#f00' });
        }
    });


  }

  update() {
    const speed = 150;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
    else if (this.cursors.right.isDown) this.player.setVelocityX(speed);

    if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
    else if (this.cursors.down.isDown) this.player.setVelocityY(speed);

    // mueve la luz para que siga siempre al jugador
    this.playerLight.x = this.player.x;
    this.playerLight.y = this.player.y;
  }
}
