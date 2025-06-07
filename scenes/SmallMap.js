export default class SmallMap extends Phaser.Scene {
  constructor() {
      super('SmallMap');
  }

  preload() {
      this.load.image('tiles', './public/assets/tileset.png');
      this.load.tilemapTiledJSON('map', './public/assets/tilesetCHICO.json');
      this.load.image('collectible', './public/assets/diamond.png');
      this.load.image('player', './public/assets/Ninja.png');
      this.load.image('goal', './public/assets/triangle.png');
    }
    
    create() {
    this.lights.enable().setAmbientColor(0x000000);
    // MAPA Y TILESET
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('tileset', 'tiles');
    const groundLayer = map.createLayer('Ground', tileset);
    const wallsLayer = map.createLayer('Walls', tileset);
    const objectLayer = map.getObjectLayer('Objects');
    wallsLayer.setCollisionByProperty({ collides: true });

    groundLayer.setPipeline('Light2D');
    wallsLayer.setPipeline('Light2D');

    // JUGADOR
    this.spawnPoint = map.findObject("Objects", (obj) => obj.type === "spawn")
    this.player = this.physics.add.sprite(this.spawnPoint.x, this.spawnPoint.y, 'player')
    .setScale(.02)
    .refreshBody()
    .setPipeline('Light2D');    // <- aquí
    // Crea una luz de radio 200px que siga al jugador
    this.playerLight = this.lights.addLight(
      this.player.x,
      this.player.y,
      100      // radio en píxeles
    ).setIntensity(1);

    // Establece los límites del mundo al tamaño del tilemap
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Y restringe la cámara al mismo tamaño
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Esto mantiene al jugador dentro del mundo
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

    objectLayer.objects.forEach((obj) => {
      if(obj.type === "item"){
        const item1 = this.physics.add.sprite(obj.x, obj.y, "collectible").setScale(.2).refreshBody()
        this.collectibles.add(item1);
      }

    })

    this.collectibles.children.iterate(item => {
      item.setPipeline('Light2D');
    });

    this.physics.add.overlap(this.player, this.collectibles, (player, item) => {
      item.destroy();
      this.collected++;
    });

    // META / OBJETIVO
    this.endPoint = map.findObject("Objects", (obj) => obj.type === "end")
    this.goal = this.physics.add.sprite(this.endPoint.x, this.endPoint.y, 'goal').setScale(.2);
    // Flag para no spamear el warning
    this.shownWarning = false;

    // Collider con la meta
    this.goalCollider = this.physics.add.overlap(this.player, this.goal, () => {
      if (this.collected >= 4) {
        this.add.text(this.cameras.main.centerX/2, this.cameras.main.centerY/2, '¡Ganaste!', {
          fontSize: '24px', fill: '#fff'
        }).setOrigin(0.5).setPipeline('Texture');;
        this.physics.pause();
        this.scene.start("MediumMap")

      } else if (!this.shownWarning) {
        // Solo entra aquí la primera vez
        this.shownWarning = true;

        // Muestra el texto
        this.warningText = this.add.text(
          this.cameras.main.centerX/2,
          this.cameras.main.centerY/2,
          'Te faltan objetos!',
          { fontSize: '16px', fill: '#f00' }
        ).setOrigin(0.5).setPipeline('Texture');;

        // Opcional: lo borrás al cabo de 2 segundos
        this.time.delayedCall(2000, () => {
          this.warningText.destroy();
          this.shownWarning = false
        });
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
