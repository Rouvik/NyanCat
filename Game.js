// extend the damage class tailored for use in game to implement state based animation
class NyanDamage extends Sprite {
    constructor(img, sprite_width, sprite_height, max_sprites, optional, game) {
        super(img, sprite_width, sprite_height, max_sprites, optional);
        this.game = game;
    }

    drawImageAndUpdate(px, py, w, h) {
        // hardcoded changes to pair up with the damage sprites
        Sprite.cxt.drawImage(this.image, this.sw * this.index + this.xOffset, this.yOffset, this.sw, this.sh, px, py - 10, w, h * 1.2);

        if (this.frame++ > this.frameSkip) {
            this.frame = 0;

            if (this.index++ > this.max) {
                this.index = 0;
                this.game.playerRenderSprite = this.game.nyanPlayerSprite;
            }
        }
    }
}

class PersistentText {
    static cxt = null;
    static textObjects = [];
    static textColorPalette = ['rgb(148, 0, 211)', 'rgb(75, 0, 130)', 'rgb(0, 0, 255)', 'rgb(0, 255, 0)', 'rgb(255, 255, 0)', 'rgb(255, 127, 0)', 'rgb(255, 0, 0)'];
    constructor(x, y, rotation, text, time = 2000) {
        this.x = x;
        this.y = y;
        this.color = PersistentText.textColorPalette[~~((PersistentText.textColorPalette.length - 1) * Math.random())];
        this.rotatation = rotation;
        this.text = text;

        PersistentText.textObjects.push(this);

        setTimeout(() => {
            PersistentText.textObjects.splice(PersistentText.textObjects.indexOf(this), 1);
        }, time);
    }

    static setContext(cxt) {
        if (!(cxt instanceof CanvasRenderingContext2D)) {
            throw new Error("[Persistent Text Error] Bad canvas context: " + cxt);
        }

        PersistentText.cxt = cxt;
    }

    static updateTexts() {
        for (let i = 0; i < PersistentText.textObjects.length; i++) {
            PersistentText.cxt.save();
            PersistentText.cxt.fillStyle = PersistentText.textObjects[i].color;
            PersistentText.cxt.translate(PersistentText.textObjects[i].x, PersistentText.textObjects[i].y);
            PersistentText.cxt.rotate(PersistentText.textObjects[i].rotatation);
            PersistentText.cxt.fillText(PersistentText.textObjects[i].text, 0, 0);
            PersistentText.cxt.restore();
        }
    }
}

class Game {
    static cxt = null;
    constructor(screen, gameHandler) {
        // system handlers
        this.sc = screen;
        this.gameHandler = gameHandler;

        // game metrics
        this.score = 0;
        this.health = 3;

        // audio
        this.audio = ASSETS.gameAudio;

        // framerate
        this.frames = 0;
        this.frameSkip = 50;
        this.frameSkipDecrementIntervalID = null;

        // player sprite
        this.pos = { x: -70, y: -40 }; // to adjust for nyan cat dimentions
        this.nyanPlayerSprite = new Sprite(ASSETS.nyanImg, 71, 41, 5, { xOffset: -2.5, yOffset: 146, frameSkip: 3 });
        this.nyanPlayerSprite.rainbowOffset = 0;

        // player sprite dmg
        this.nyanPlayerDamageSprite = new NyanDamage(ASSETS.nyanImg, 63, 50, 6, { xOffset: 441.5, yOffset: 140, frameSkip: 5 }, this);
        this.painTexts = ['Ouch!', 'Meowww', 'Nyannnn!', 'Ugh!'];

        // player sprite super cat
        this.nyanSuperPlayerSprite = new Sprite(ASSETS.nyanImg, 79, 39, 4, { xOffset: 3, yOffset: 223, frameSkip: 3 });

        this.checkDamage = true;
        this.objSpeed = 5;

        // cat collectible bonus text
        this.bonuxTexts = ['Rainbows!', 'HP + 1', 'Cats!', 'Whisker Booster 101'];

        // actual rendered sprite
        this.playerRenderSprite = this.nyanPlayerSprite;

        // collectable sprites
        this.donutSprite = ASSETS.donutImg;
        this.catSprite = ASSETS.catImage;
        this.powerUpSprite = ASSETS.powerUpImg;
        this.obstacle = [];
        this.bonus = [];
        this.powerUp = [];

        // game evt listeners
        window.addEventListener('keydown', this.handleKeyboard.bind(this));
    }

    static setContext(cxt) {
        if (!(cxt instanceof CanvasRenderingContext2D)) {
            throw new Error("[Game title error] Bad canvas context " + cxt);
        }

        Game.cxt = cxt;
    }

    initGame() {
        document.body.style.animationPlayState = 'running';
        Game.cxt.font = "30px Tiny5";
        Game.cxt.fillStyle = 'rgb(255, 23, 116)';
        Game.cxt.textAlign = 'start';

        this.playerRenderSprite = this.nyanPlayerSprite;
        this.pos = { x: -70, y: -40 }; // to adjust for nyan cat dimentions
        this.score = 0;
        this.health = 3;
        this.checkDamage = true;
        this.obstacle = [];
        this.bonus = [];
        this.frames = 0;
        this.frameSkip = 50;
        this.audio.currentTime = 0;
        this.audio.play();

        this.frameSkipDecrementIntervalID = setInterval(() => {
            if (this.score > 2500) {
                this.frameSkip = 5;
            } else if (this.score > 2000) {
                this.frameSkip = 10;
            } else if (this.score > 1500) {
                this.frameSkip = 20;
            } else if (this.score > 1000) {
                this.frameSkip = 30;
            } else if (this.score > 500) {
                this.frameSkip = 40;
            }
        }, 5000);
    }

    cleanGame() {
        clearInterval(this.frameSkipDecrementIntervalID);
        this.audio.pause();
    }

    handleKeyboard(evt) {
        if (evt.key == 'ArrowUp' || evt.key == 'w') {
            if (this.pos.y > -this.sc.hheight) {
                this.pos.y -= 20;
            }
        } else if (evt.key == 'ArrowDown' || evt.key == 's') {
            if (this.pos.y + 100 < this.sc.hheight) {
                this.pos.y += 20;
            }
        }
    }

    checkPlayerCollision(arr, i, sprite, callback) {
        if (arr[i].x < -this.sc.hwidth) {
            arr.splice(i, 1); // remove the out of screen obstacle
            this.score += 30; // 30 score awarded on a successfull dodge
            return;
        }

        // update obstacle position and draw
        arr[i].x -= this.objSpeed;
        Game.cxt.drawImage(sprite, arr[i].x, arr[i].y, arr[i].size, arr[i].size);

        // check collisions
        if (this.checkDamage &&
            this.pos.x + 10 < arr[i].x + arr[i].size &&
            this.pos.x + 120 > arr[i].x &&
            this.pos.y < arr[i].y + arr[i].size &&
            this.pos.y + 78 > arr[i].y
        ) {
            callback();
        }
    }

    update() {
        Game.cxt.fillText("Score: " + this.score, -this.sc.hwidth + 20, -this.sc.hheight + 25);
        Game.cxt.drawImage(this.catSprite, -this.sc.hwidth + 17, -this.sc.hheight + 25, 24, 24);
        Game.cxt.fillText(": " + this.health, -this.sc.hwidth + 43, -this.sc.hheight + 48);

        // add new obstacles
        if (this.frames++ > this.frameSkip) {
            this.frames = 0;

            const chance = ~~(Math.random() * 100);
            console.log(chance);
            if (chance > 95) {
                this.powerUp.push({ x: this.sc.hwidth, y: Math.random() * (-this.sc.height) + this.sc.hheight, size: 50 });
            }
            else if (chance > 80) {
                this.bonus.push({ x: this.sc.hwidth, y: Math.random() * (-this.sc.height) + this.sc.hheight, size: 50 });
            }
            else {
                this.obstacle.push({ x: this.sc.hwidth, y: Math.random() * (-this.sc.height) + this.sc.hheight, size: ~~(Math.random() * 50 + 50) });
            }
        }

        // collision for donuts
        for (let i = 0; i < this.obstacle.length; i++) {
            this.checkPlayerCollision(this.obstacle, i, this.donutSprite, () => {
                this.playerRenderSprite = this.nyanPlayerDamageSprite; // update to damage state
                this.obstacle.splice(i, 1); // remove the sprite

                // draw a random funny pain text
                const painTextIndex = ~~(this.painTexts.length * Math.random());
                new PersistentText(this.pos.x + 100, this.pos.y - 50, Math.PI / 2 * (Math.random() * 2 - 1), this.painTexts[painTextIndex]);

                if (this.health-- < 2) { // KILL! Nyannnn :(
                    this.cleanGame();
                    this.gameHandler.scoreCard.initScoreCard();
                    this.gameHandler.state = System.gameState.scoreCard;
                }
            });
        }

        // collision for cat health
        for (let i = 0; i < this.bonus.length; i++) {
            this.checkPlayerCollision(this.bonus, i, this.catSprite, () => {
                this.bonus.splice(i, 1); // cat consumed in NYAN
                this.health++; // +1 health awarded on collecting CAT

                // display silly nyan happy bonus text
                const bonuxTextIndex = ~~(this.bonuxTexts.length * Math.random());
                new PersistentText(this.pos.x + 100, this.pos.y - 50, Math.PI / 2 * (Math.random() * 2 - 1), this.bonuxTexts[bonuxTextIndex]);
            });
        }

        for (let i = 0; i < this.powerUp.length; i++) {
            this.checkPlayerCollision(this.powerUp, i, this.powerUpSprite, () => {
                this.powerUp.splice(i, 1);
                this.playerRenderSprite = this.nyanSuperPlayerSprite;
                this.checkDamage = false; // turn off damage !!!
                this.objSpeed = 10; // ultra speed

                // draw super text to show super power
                new PersistentText(this.pos.x + 100, this.pos.y - 50, Math.PI / 2 * (Math.random() * 2 - 1), 'Super Power Cat!!');
                setTimeout(() => {
                    this.playerRenderSprite = this.nyanPlayerSprite;
                    this.checkDamage = true;
                    this.objSpeed = 5;
                }, 5000);
            });
        }

        // render nyan cat
        if (this.playerRenderSprite.frame > this.playerRenderSprite.frameSkip) {
            this.playerRenderSprite.rainbowOffset ^= 1;
        }
        for (let i = 0; i < 12; i++) {
            Game.cxt.drawImage(ASSETS.nyanImg, 430, 154, 6, 29, this.pos.x - 22 * i + 25, this.pos.y + 3 + 3 * ((i + this.nyanPlayerSprite.rainbowOffset) % 2), 24, 58);
        }
        this.playerRenderSprite.drawImageAndUpdate(this.pos.x, this.pos.y, 140, 80);

        PersistentText.updateTexts(); // render persistent at last for overlay
    }
}

class Title {
    static cxt = null;
    constructor(screen, gameHandler) {
        this.sc = screen;
        this.gameHandler = gameHandler;
        this.titleNyanSprite = new Sprite(ASSETS.nyanImg, 149.8, 95, 6, { frameSkip: 10 });
        this.titleSprite = new Sprite(ASSETS.titleImg, 256, 128, 4, { frameSkip: 5 });
        this.playButton = new TexButton(ASSETS.playImg, -150, this.sc.hheight * 0.2, 300, 150, 128, 66, this.handOverToGame.bind(this));

        this.t = 0;
    }

    initTitle() {
        this.playButton.addListener();
        document.body.style.animationPlayState = 'paused';
    }

    cleanTitle() {
        this.playButton.removeListener();
    }

    static setContext(cxt) {
        if (!(cxt instanceof CanvasRenderingContext2D)) {
            throw new Error("[Game title error] Bad canvas context " + cxt);
        }

        Title.cxt = cxt;
    }

    handOverToGame() {
        setTimeout(() => { // wait for some time
            this.cleanTitle();
            this.gameHandler.game.initGame();
            this.gameHandler.state = System.gameState.play;
        }, 500);
    }

    update() {
        this.titleSprite.drawImageAndUpdate(-150, -this.sc.hheight, 300, 180);
        this.titleNyanSprite.drawImageAndUpdate(-150, -this.sc.hheight * 0.5, 300, 180);
        this.playButton.update();
        Title.cxt.save();
        Title.cxt.font = '30px Tiny5';
        Title.cxt.fillStyle = 'rgb(255, 23, 116)';
        Title.cxt.textAlign = 'center';
        Title.cxt.translate(200, -this.sc.hheight * 0.6);
        Title.cxt.rotate(Math.PI / 4 * (Math.sin(this.t += 0.03) * -0.3 + 1));
        Title.cxt.fillText("Made by Rouvik Maji!", 0, 0);
        Title.cxt.restore();
        Title.cxt.save();
        Title.cxt.font = '30px Tiny5';
        Title.cxt.fillStyle = 'rgb(255, 23, 116)';
        Title.cxt.textAlign = 'center';
        Title.cxt.translate(-150, -this.sc.hheight * 0.6);
        Title.cxt.rotate(-Math.PI / 4 * (Math.cos(this.t += 0.02) * -0.3 + 1));
        Title.cxt.fillText("Nyan!", 0, 0);
        Title.cxt.restore();
    }
}

class ScoreCard {
    static cxt = null;
    static scoreMessages = ['Nyan?', 'Hmm, needs more Nyan', 'Nyan score!', 'Catnip deluxe!', 'Rainbow score!', 'Ultra deluxe super score!'];
    constructor(screen, gameHandler) {
        this.sc = screen;
        this.gameHandler = gameHandler;
        this.returnButton = new TexButton(ASSETS.returnImg, -150, ScoreCard.cxt.canvas.hheight * 0.5, 300, 149, 131, 65, this.handOverToTitle.bind(this));
    }

    static setContext(cxt) {
        if (!(cxt instanceof CanvasRenderingContext2D)) {
            throw new Error("[Game ScoreCard error] Bad canvas context " + cxt);
        }

        ScoreCard.cxt = cxt;
    }

    handOverToTitle() {
        setTimeout(() => {
            this.clearScoreCard();
            this.gameHandler.title.initTitle();
            this.gameHandler.state = System.gameState.title;
        }, 200);
    }

    initScoreCard() {
        ScoreCard.cxt.fillStyle = 'rgb(255, 23, 116)';
        ScoreCard.cxt.font = this.sc.width / 600 * 50 + "px Tiny5";
        ScoreCard.cxt.textAlign = 'center';

        this.returnButton.addListener();
        document.body.style.animationPlayState = 'paused';
    }

    clearScoreCard() {
        this.returnButton.removeListener();
    }

    update() {
        ScoreCard.cxt.fillText("Score: " + this.gameHandler.game.score, 0, 0);

        let scoreText;
        if (this.gameHandler.game.score > 2500) {
            scoreText = ScoreCard.scoreMessages[5];
        } else if (this.gameHandler.game.score > 2000) {
            scoreText = ScoreCard.scoreMessages[4];
        } else if (this.gameHandler.game.score > 1500) {
            scoreText = ScoreCard.scoreMessages[3];
        } else if (this.gameHandler.game.score > 1000) {
            scoreText = ScoreCard.scoreMessages[2];
        } else if (this.gameHandler.game.score > 500) {
            scoreText = ScoreCard.scoreMessages[1];
        } else {
            scoreText = ScoreCard.scoreMessages[0];
        }

        ScoreCard.cxt.fillText(scoreText, 0, this.sc.width / 600 * 35);
        this.returnButton.update();
    }
}

class System {
    static gameState = {
        title: 0,
        play: 1,
        scoreCard: 2
    };

    static cxt = null;
    constructor(screen) {
        if (!(screen instanceof HTMLCanvasElement)) {
            throw new Error("[Gama system error] Bad canvas element " + screen);
        }

        this.sc = screen;

        this.state = System.gameState.title;
        this.title = new Title(this.sc, this);
        this.game = new Game(this.sc, this);
        this.scoreCard = new ScoreCard(this.sc, this);

        this.title.initTitle();
    }

    static setContext(cxt) {
        if (!(cxt instanceof CanvasRenderingContext2D)) {
            throw new Error("[Game system error] Bad canvas context " + cxt);
        }
        System.cxt = cxt;
    }

    update() {
        if (this.state == System.gameState.title) {
            this.title.update();
        }
        else if (this.state == System.gameState.play) {
            this.game.update();
        }
        else if (this.state == System.gameState.scoreCard) {
            this.scoreCard.update();
        }
    }

}