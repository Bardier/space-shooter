// * ------------------------------------------------------------
// * Общий класс
// * ------------------------------------------------------------
class Entity extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, key, type) {
    super(scene, x, y, key);

    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.world.enableBody(this, 0);

    this.setData("type", type);
    this.setData("isDead", false);
  }

  explode(canDestroy) {
    if (!this.getData("isDead")) {
      // устанавливаем анимацию взрыва для текстуры
      this.setTexture("sprExplosion"); // это относится к тому же ключу анимации, котрый мы добавляли в this.anims.create ранее
      this.play("sprExplosion"); // запускаем анимацию
      // использовать случайный звук взрыва который мы определили в this.sfx в SceneMain
      this.scene.sfx.explosions[
        Phaser.Math.Between(0, this.scene.sfx.explosions.length - 1)
      ].play();
      if (this.shootTimer !== undefined) {
        if (this.shootTimer) {
          this.shootTimer.remove(false);
        }
      }
      this.setAngle(0);
      this.body.setVelocity(0, 0);
      this.on(
        "animationcomplete",
        function () {
          if (canDestroy) {
            this.destroy();
          } else {
            this.setVisible(false);
          }
        },
        this
      );
      this.setData("isDead", true);
    }
  }
}

// * ------------------------------------------------------------
// * Класс игрока
// * ------------------------------------------------------------
class Player extends Entity {
  constructor(scene, x, y, key) {
    super(scene, x, y, key, "Player");

    this.setData("speed", 200);

    this.play("sprPlayer");

    this.setData("isShooting", false);
    this.setData("timerShootDelay", 10);
    this.setData("timerShootTick", this.getData("timerShootDelay") - 1);
  }

  // * 	перемещение игрока
  moveUp() {
    this.body.velocity.y = -this.getData("speed");
  }

  moveDown() {
    this.body.velocity.y = this.getData("speed");
  }

  moveLeft() {
    this.body.velocity.x = -this.getData("speed");
  }

  moveRight() {
    this.body.velocity.x = this.getData("speed");
  }

  onDestroy() {
    this.scene.time.addEvent({
      // go to game over scene
      delay: 1000,
      callback: function () {
        this.scene.scene.start("SceneGameOver");
      },
      callbackScope: this,
      loop: false,
    });
  }

  update() {
    this.body.setVelocity(0, 0);

    // * не позволит игроку выходить за экран
    this.x = Phaser.Math.Clamp(this.x, 0, this.scene.game.config.width);
    this.y = Phaser.Math.Clamp(this.y, 0, this.scene.game.config.height);

    if (this.getData("isShooting")) {
      if (this.getData("timerShootTick") < this.getData("timerShootDelay")) {
        // каждое обновление игры увеличивайте timerShootTick на единицу, пока мы не достигнем значения timerShootDelay
        this.setData("timerShootTick", this.getData("timerShootTick") + 1);
      } else {
        // когда "ручной таймер" срабатывает:
        const laser = new PlayerLaser(this.scene, this.x, this.y);
        this.scene.playerLasers.add(laser);

        this.scene.sfx.laser.play(); // воспроизвести звуковой эффект лазера
        this.setData("timerShootTick", 0);
      }
    }
  }
}

// * ------------------------------------------------------------
// * Класс лазеря игрока
// * ------------------------------------------------------------

class PlayerLaser extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "sprLaserPlayer");
    this.body.velocity.y = -200;
  }
}

// * ------------------------------------------------------------
// * Класс вражеского лазеря
// * ------------------------------------------------------------

class EnemyLaser extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "sprLaserEnemy0");
    this.body.velocity.y = 200;
  }
}

// * ------------------------------------------------------------
// * Класс врага ChaserShip / приследователь
// * ------------------------------------------------------------
class ChaserShip extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "sprEnemy1", "ChaserShip");

    this.body.velocity.y = Phaser.Math.Between(50, 100);

    this.states = {
      MOVE_DOWN: "MOVE_DOWN",
      CHASE: "CHASE",
    };
    this.state = this.states.MOVE_DOWN;
  }

  update() {
    if (!this.getData("isDead") && this.scene.player) {
      if (
        Phaser.Math.Distance.Between(
          this.x,
          this.y,
          this.scene.player.x,
          this.scene.player.y
        ) < 320
      ) {
        this.state = this.states.CHASE;
      }

      if (this.state === this.states.CHASE) {
        const dx = this.scene.player.x - this.x;
        const dy = this.scene.player.y - this.y;

        const angle = Math.atan2(dy, dx);

        const speed = 100;
        this.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      }
    }
  }
}

// * ------------------------------------------------------------
// * Класс врага GunShip / боевой корабль
// * ------------------------------------------------------------
class GunShip extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "sprEnemy0", "GunShip");

    this.body.velocity.y = Phaser.Math.Between(50, 100);
    this.play("sprEnemy0");

    // * вражеская стрельба
    this.shootTimer = this.scene.time.addEvent({
      delay: 1000,
      callback: function () {
        var laser = new EnemyLaser(this.scene, this.x, this.y);
        laser.setScale(this.scaleX);
        this.scene.enemyLasers.add(laser);
      },
      callbackScope: this,
      loop: true,
    });

    // * уничтожение врага
    this.onDestroy = () => {
      if (this.shootTimer !== undefined) {
        if (this.shootTimer) {
          this.shootTimer.remove(false);
        }
      }
    };
  }
}

// * ------------------------------------------------------------
// * Класс врага CarrierShip / Корабль-носитель
// * ------------------------------------------------------------
class CarrierShip extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "sprEnemy2", "CarrierShip");

    this.body.velocity.y = Phaser.Math.Between(50, 100);
    this.play("sprEnemy2");
  }
}

// * ------------------------------------------------------------
// * Класс сцены
// * ------------------------------------------------------------
class ScrollingBackground {
  constructor(scene, key, velocityY) {
    this.scene = scene;
    this.key = key;
    this.velocityY = velocityY;

    this.layers = this.scene.add.group();

    this.createLayers();
  }

  createLayers() {
    for (let i = 0; i < 2; i++) {
      const layer = this.scene.add.sprite(0, 0, this.key);
      layer.y = layer.displayHeight * i;
      const flipX = Phaser.Math.Between(0, 10) >= 5 ? -1 : 1;
      const flipY = Phaser.Math.Between(0, 10) >= 5 ? -1 : 1;
      layer.setScale(flipX * 2, flipY * 2);
      layer.setDepth(-5 - (i - 1));
      this.scene.physics.world.enableBody(layer, 0);
      layer.body.velocity.y = this.velocityY;

      this.layers.add(layer);
    }
  }

  update() {
    if (this.layers.getChildren()[0].y > 0) {
      for (let i = 0; i < this.layers.getChildren().length; i++) {
        const layer = this.layers.getChildren()[i];
        layer.y = -layer.displayHeight + layer.displayHeight * i;
      }
    }
  }
}
