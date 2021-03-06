class SceneMainMenu extends Phaser.Scene {
  constructor() {
    super({ key: "SceneMainMenu" });
  }

  preload() {
    // * Подключаем изображения
    this.load.image("sprBtnPlay", "content/sprBtnPlay.png");
    this.load.image("sprBtnPlayHover", "content/sprBtnPlayHover.png");
    this.load.image("sprBtnPlayDown", "content/sprBtnPlayDown.png");
    this.load.image("sprBtnRestart", "content/sprBtnRestart.png");
    this.load.image("sprBtnRestartHover", "content/sprBtnRestartHover.png");
    this.load.image("sprBtnRestartDown", "content/sprBtnRestartDown.png");

    // * Подключаем аудио
    this.load.audio("sndBtnOver", "content/sndBtnOver.wav");
    this.load.audio("sndBtnDown", "content/sndBtnDown.wav");
  }

  create() {
    // * аудио
    this.sfx = {
      btnOver: this.sound.add("sndBtnOver"),
      btnDown: this.sound.add("sndBtnDown"),
    };

    // * кнопки
    this.btnPlay = this.add.sprite(
      this.game.config.width * 0.5,
      this.game.config.height * 0.5,
      "sprBtnPlay"
    );

    // * добавляем интерактив на кнопки
    this.btnPlay.setInteractive();

    this.btnPlay.on(
      "pointerover",
      function () {
        this.btnPlay.setTexture("sprBtnPlayHover"); // установка текстуры для кнопки
        this.sfx.btnOver.play(); // проигрывание звука при наведении на кнопку
      },
      this
    );

    this.btnPlay.on("pointerout", function () {
      this.setTexture("sprBtnPlay");
    });

    this.btnPlay.on(
      "pointerdown",
      function () {
        this.btnPlay.setTexture("sprBtnPlayDown");
        this.sfx.btnDown.play();
      },
      this
    );

    this.btnPlay.on(
      "pointerup",
      function () {
        this.btnPlay.setTexture("sprBtnPlay");
        this.scene.start("SceneMain");
      },
      this
    );

    this.title = this.add.text(
      this.game.config.width * 0.5,
      128,
      "SPACE SHOOTER",
      {
        fontFamily: "monospace",
        fontSize: 48,
        fontStyle: "bold",
        color: "#ffffff",
        align: "center",
      }
    );

    this.title.setOrigin(0.5);
  }
}
