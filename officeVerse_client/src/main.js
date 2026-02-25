/*
import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js';
import Game from './game/Game.js';

window.onload = () => {
  new Game();
}; 
*/


import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js';
import BootScene from './game/scenes/BootScene.js';
import OfficeScene from './game/scenes/OfficeScene.js';
import UIScene from './game/scenes/UIScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: '100%',
    height: '100%',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [BootScene, OfficeScene, UIScene]
};

const game = new Phaser.Game(config);

// Manual resize listener removed to allow Phaser Scale.RESIZE to handle it seamlessly
