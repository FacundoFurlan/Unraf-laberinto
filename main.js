import GameScene from "./scenes/HelloWorldScene.js";
import MediumMap from "./scenes/MediumMap.js";
import SmallMap from "./scenes/SmallMap.js";

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [SmallMap,MediumMap,GameScene],
    pixelArt: true
};

new Phaser.Game(config);