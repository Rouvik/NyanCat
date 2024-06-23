class Sprite {
    static cxt = null;
    constructor(img, sprite_width, sprite_height, max_sprites, optional) {
        this.image = img;
        this.sw = sprite_width;
        this.sh = sprite_height;
        this.sx = 0;
        this.max = max_sprites;

        let refOptions = Object.assign({
            index: 0,
            frameSkip: 15,
            xOffset: 0,
            yOffset: 0
        }, optional);

        this.index = refOptions.index;
        this.frameSkip = refOptions.frameSkip;
        this.xOffset = refOptions.xOffset;
        this.yOffset = refOptions.yOffset;
        
        this.frame = 0;
    }

    static setContext(cxt) {
        if (!(cxt instanceof CanvasRenderingContext2D)) {
            throw new Error("[Sprite error] Bad canvas context " + cxt);
        }
        Sprite.cxt = cxt;
    }

    drawImageAndUpdate(px, py, w, h) {
        Sprite.cxt.drawImage(this.image, this.sw * this.index + this.xOffset, this.yOffset, this.sw, this.sh, px, py, w, h);

        if (this.frame++ > this.frameSkip) {
            this.frame = 0;
            this.index = (this.index + 1) % this.max;
        }
    }

    drawImage(px, py, w, h)
    {
        Sprite.cxt.drawImage(this.image, this.sw * this.index, 0, this.sw, this.sh, px, py, w, h);
    }
}

class GameImage extends HTMLImageElement
{

}