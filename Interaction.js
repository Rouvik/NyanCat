class Button
{
    static paintModes = { // these are bitfields
        stroke: 1,
        fill: 2
    };

    static cxt = null;
    constructor(px, py, w, h, text, callback, options)
    {
        this.pos = {
            x: px, y: py
        };

        this.dimention = {
            w: width, h: height
        };

        if (typeof callback != 'function') {
            throw new Error("[TexButton Error] Bad callback: " + callback);
        }

        this.callback = callback;

        const opt = Object.assign({
            bevel: 10,
            frameSkip: 15
        }, options);

        this.frames = 0;
        this.frameSkip = opt.frameSkip;
        this.bevel = opt.bevel;

        this.text = text;
        this.font = '24px sans';

        this.paintMode = Button.paintModes.stroke | Button.paintModes.fill;
        this.borderColor = 'rgb(255, 255, 255)';
        this.borderWidth = 5;
        this.fontColor = 'rgb(255, 255, 255)';
        this.fillColor = 'rgb(255, 255, 0)';
        this.clickedFillColor = 'rgb(255, 255, 128)';
        this.setFillColor = this.fillColor;
        
        this.path = new Path2D();
        this.generateRenderPath();

        this.sc = Button.cxt.canvas;

        this.handleClick = this.handleClick.bind(this);
    }
    
    addListener()
    {
        this.sc.addEventListener(window.isMobile() ? 'touchdown' : 'mousedown', this.handleClick);
    }

    removeListener()
    {
        this.sc.removeEventListener(window.isMobile() ? 'touchdown' : 'mousedown', this.handleClick);
    }

    handleClick(evt)
    {
        const cx = evt.clientX - this.sc.hwidth;
        const cy = evt.clientY - this.sc.hheight;

        if (cx > this.pos.x && cx < this.pos.x + this.dimention.w &&
            cy > this.pos.y && cy < this.pos.y + this.dimention.h) {
            this.callback();
            this.setFillColor = this.clickedFillColor;
        }
    }

    static setContext(cxt)
    {
        if (!(cxt instanceof CanvasRenderingContext2D)) {
            throw new Error("[Game title error] Bad canvas context " + cxt);
        }

        Button.cxt = cxt;
    }

    generateRenderPath()
    {
        this.path.arc(this.pos.x + this.bevel, this.pos.y + this.bevel, this.bevel, Math.PI, -Math.PI / 2);
        this.path.arc(this.pos.x + this.dimention.w - this.bevel, this.pos.y + this.bevel, this.bevel, -Math.PI / 2, 0);
        this.path.arc(this.pos.x + this.dimention.w - this.bevel, this.pos.y + this.dimention.h - this.bevel, this.bevel, 0, Math.PI / 2);
        this.path.arc(this.pos.x + this.bevel, this.pos.y + this.dimention.h - this.bevel, this.bevel, Math.PI / 2, -Math.PI);
        this.path.lineTo(this.pos.x, this.pos.y + this.bevel);
    }
    
    update()
    {
        Button.cxt.beginPath();

        if (this.paintMode & Button.paintModes.stroke == Button.paintModes.stroke) {
            Button.cxt.lineWidth = this.borderWidth;
            Button.cxt.strokeStyle = this.borderColor;
            Button.cxt.stroke(this.path);
            Button.cxt.lineWidth = 1;
        }
        
        if (this.paintMode & Button.paintModes.fill == Button.paintModes.fill) {
            Button.cxt.fillStyle = this.setFillColor;
            Button.cxt.fill(this.path);
        }
        
        Button.cxt.fillStyle = this.fontColor;
        Button.cxt.textAlign = 'center';
        Button.cxt.font = this.font;
        Button.cxt.fillText(this.text, (this.pos.x + this.dimention.w / 2), (this.pos.y + this.dimention.h / 2));

        if (this.frames++ > this.frameSkip) {
            this.frames = 0;
            this.setFillColor = this.fillColor;
        }
    }
}

class TexButton
{
    static cxt = null;
    constructor(img, px, py, width, height, sw, sh, callback, frameSkip = 15)
    {
        this.pos = {
            x: px, y: py
        };

        this.dimention = {
            w: width, h: height
        };

        if (typeof callback != 'function') {
            throw new Error("[TexButton Error] Bad callback: " + callback);
        }

        this.callback = callback;
        
        this.sprite = new Sprite(img, sw, sh, 2, {frameSkip: -1}); // disable frameskip for button sprites with -1
        this.sc = TexButton.cxt.canvas;

        this.frames = 0;
        this.frameSkip = frameSkip;

        this.handleClick = this.handleClick.bind(this);
        this.handleTouch = this.handleTouch.bind(this);
    }

    addListener()
    {
        if (window.isMobile()) {
            this.sc.addEventListener('touchstart', this.handleTouch);
        } else {
            this.sc.addEventListener('mousedown', this.handleClick);
        }
    }

    removeListener()
    {
        if (window.isMobile()) {
            this.sc.removeEventListener('touchstart', this.handleTouch);
        } else {
            this.sc.removeEventListener('mousedown', this.handleClick);
        }
    }

    handleClick(evt)
    {
        const cx = evt.clientX - this.sc.hwidth;
        const cy = evt.clientY - this.sc.hheight;

        if (cx > this.pos.x && cx < this.pos.x + this.dimention.w &&
            cy > this.pos.y && cy < this.pos.y + this.dimention.h) {
                this.callback(this);
            this.frames = 0;
            this.sprite.index = 1; // hardcode to next button image
        }
    }

    handleTouch(evt)
    {
        const cx = evt.touches[0].clientX - this.sc.hwidth;
        const cy = evt.touches[0].clientY - this.sc.hheight;

        if (cx > this.pos.x && cx < this.pos.x + this.dimention.w &&
            cy > this.pos.y && cy < this.pos.y + this.dimention.h) {
                this.callback(this);
            this.frames = 0;
            this.sprite.index = 1; // hardcode to next button image
        }
    }

    static setContext(cxt)
    {
        if (!(cxt instanceof CanvasRenderingContext2D)) {
            throw new Error("[Interaction Texture Button] Bad canvas context " + cxt);
        }

        TexButton.cxt = cxt;
    }

    update()
    {
        this.sprite.drawImage(this.pos.x, this.pos.y, this.dimention.w, this.dimention.h);

        if (this.frames++ > this.frameSkip) {
            this.frames = 0;
            this.sprite.index = 0;
        }
    }
}