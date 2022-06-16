class SceneGameOver extends Phaser.Scene {
  constructor() {
    super({ key: "SceneGameOver" });
  }
  create() {
    this.playAgain = this.add
      .text(this.game.config.width * 0.5, 128, "Play Again", {
        fontFamily: "monospace",
        fontSize: 48,
        fontStyle: "bold",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    this.playAgain.setInteractive();

    this.playAgain.on(
      "pointerdown",
      function () {
        this.scene.start("SceneMain");
      },
      this
    );
  }
}
