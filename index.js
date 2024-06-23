const sc = document.querySelector('canvas');
const cxt = sc.getContext('2d');

const ASSETS = {
    nyanImg: document.getElementById('nyan_sprite'),
    playImg: document.getElementById('play_button_sprite'),
    returnImg: document.getElementById('return_button_sprite'),
    titleImg: document.getElementById('title_sprite'),

    gameAudio: document.getElementById('nyanAudio'),

    donutImg: document.getElementById('donut_sprite'),
    powerUpImg: document.getElementById('pwr_sprite'),
    catImage: document.getElementById('cat_sprite')
};


window.onresize = () => {
    sc.width = window.innerWidth;
    sc.height = window.innerHeight;
    sc.hwidth = sc.width / 2;
    sc.hheight = sc.height / 2;
    cxt.translate(sc.hwidth, sc.hheight);
};

window.onresize();

Sprite.setContext(cxt);
PersistentText.setContext(cxt);
Game.setContext(cxt);
Title.setContext(cxt);
ScoreCard.setContext(cxt);
System.setContext(cxt);
Button.setContext(cxt);
TexButton.setContext(cxt);

const system = new System(sc);

let prevT = 0;
function animate(t)
{
    cxt.clearRect(-sc.hwidth, -sc.hheight, sc.width, sc.height);
    system.update();

    requestAnimationFrame(animate);
}

animate();