class BackgroundGenerator
{
    static cxt = null;
    constructor()
    {

    }

    static setContext(cxt)
    {
        if (!(cxt instanceof CanvasRenderingContext2D)) {
            throw new Error("[Background Generator Error] Bad canvas context: " + cxt);
        }

        BackgroundGenerator.cxt = cxt;
    }

    
}