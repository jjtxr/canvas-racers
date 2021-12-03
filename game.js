var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var audio = document.getElementById("myAudio");
var mouseX, mouseY;
var buttons = [];
var then = Date.now();
var sound = true;
var now;
var delta;
var timer;
var bgReady = false;
var player1Ready = false;
var player2Ready = false;
var powerUpReady = false;
var buttonsReady = false;
var raceTimer = 0.00;

//Cria as sprites
var createSprites = function (src, type) {
    var spr = new Image();
    spr.onload = function () {
        switch(type)
        {
            //Background
            case 0:
                bgReady = true;
                break;

            //Player1
            case 1:
                player1Ready = true;
                break;

            //Player2
            case 2:
                player2Ready = true;
                break;

            //PowerUps
            case 3:
                powerUpReady = true;
                break;
            
            //Botoes
            case 4:
                buttonsReady = true;
                break;
        }
    }
    spr.src = src;
    return spr;    
};

//Da load ao logo
var imgLogo = createSprites("sprites/logo.png", 4);
buttonsReady = false;

//Da load ao botao play
var imgPlay = createSprites("sprites/btnPlay.png", 4);
buttonsReady = false;

//Da load ao botao opçoes
var imgOptn = createSprites("sprites/btnOptions.png", 4);
buttonsReady = false;

//Da load ao botao back
var imgBack = createSprites("sprites/btnBack.png", 4);
buttonsReady = false;

//Da load ao botao som
var imgSound = createSprites("sprites/Sound.png", 4);
buttonsReady = false;

//Da load ao botao mute
var imgMute = createSprites("sprites/Sound_Mute.png", 4);
buttonsReady = false;

//Da load ao background
var bgImage = createSprites("sprites/Track.jpg", 0);
bgReady = false;

//Player1 Sprite
var player1CarSprite;
player1CarSprite = createSprites("sprites/Car1.png", 1);
player1Ready = false;

//Player2 Sprite
var player2CarSprite;
player2CarSprite = createSprites("sprites/Car2.png", 2);
player2Ready = false;

//PowerUp speed up Sprite
var speedUpSprite = createSprites("sprites/speedUp.png", 2);
powerUpReady = false;

//PowerUp speed down Sprite
var speedDownSprite = createSprites("sprites/speedDown.png", 2);
powerUpReady = false;

//PowerUp freeze Sprite
var freezeSprite = createSprites("sprites/freeze.png", 2);
powerUpReady = false;

//Inicia o carro do player
var player1Car = new PlayerCar(player1CarSprite, 0, 0, 0, 0.1, 0.1, canvas.width / 2 - 18, canvas.height / 2 + 190, canvas.width / 2 - 18, canvas.height / 2 + 190, 32, 20, 0, 0, 4, null);
var player2Car = new PlayerCar(player2CarSprite, 0, 0, 0, 0.1, 0.1, canvas.width / 2 - 20, canvas.height / 2 + 225, canvas.width / 2 - 20, canvas.height / 2 + 225, 32, 20, 0, 0, 4, null);

//Controlos
var keysDown = {};

addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
}, false);

//Faz a parte da renderização ordenadamente
function RenderGameArea() {
    //Limpa a area de jogo
    ClearGameArea();
    //Background Color
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#014508";
    ctx.fill();
    ctx.closePath();

    // Background image
    if (bgReady) {
        ctx.beginPath();
        ctx.drawImage(bgImage, canvas.width / 2 - 400, canvas.height / 2 - 300);
        ctx.closePath();
    }

    if (player1Ready) {
        ctx.save();
        ctx.translate(player1Car.x - (player1Car.width/2), player1Car.y - (player1Car.height/2));
        ctx.rotate(-(player1Car.angle)); 
        ctx.drawImage(player1Car.sprite, -(player1Car.width/2), -(player1Car.height/2)); 
        ctx.restore();
    }

    if (player2Ready) {
        ctx.save();
        ctx.translate(player2Car.x - (player2Car.width/2), player2Car.y - (player2Car.height/2));
        ctx.rotate(-(player2Car.angle)); 
        ctx.drawImage(player2Car.sprite, -(player2Car.width/2), -(player2Car.height/2)); 
        ctx.restore();
    }

    DrawUI();
}

//Função para limpar a area de jogo
function ClearGameArea() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

//Cria um novo carro, ou seja um novo utilizador
function PlayerCar(sprite, time, lap, speed, accelaration, turnAccelaration, x, y, lx, ly, width, height, angle, minSpeed, maxSpeed, playerBox) {
    this.sprite = sprite;
    this.time = time;
    this.lap = lap;
    this.speed = speed;
    this.accelaration = accelaration;
    this.turnAccelaration = turnAccelaration;
    this.x = x;
    this.y = y;
    this.lx = lx;
    this.ly = ly;
    this.width = width;
    this.height = height;
    this.angle = angle;
    this.minSpeed = minSpeed;
    this.maxSpeed = maxSpeed;
    this.playerBox = playerBox;
}

//Cria um novo PowerUp
function PowerUp(sprite, id, x, y, width, height) {
    this.sprite = sprite;
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

//Deteta todas as colisoes do jogo
function GameCollisionDetection() {

    player1Car.playerBox = BoundingCarsDimensions(player1Car.angle, player1Car.width, player1Car.height);
    player2Car.playerBox = BoundingCarsDimensions(player2Car.angle, player2Car.width, player2Car.height);
    
    if((player1Car.x-32 + player1Car.playerBox.width) < player2Car.x-32 || 
    player1Car.x-32 > player2Car.x-32 + player2Car.playerBox.width ||
    player1Car.y-20 + player1Car.playerBox.height < player2Car.y-20 ||
    player1Car.y-20 > player2Car.y-20 + player2Car.playerBox.height)
    {  return; } else {       
        player1Car.x += (Math.cos(player1Car.angle)) + 20;
        player1Car.y -= (Math.sin(player1Car.angle)) + 20;
        player1Car.speed = 0;
        player2Car.x += (Math.cos(player2Car.angle)) - 20;
        player2Car.y -= (Math.sin(player2Car.angle)) - 20;
        player2Car.speed = 0;
    }
	
	if ((player1Car.x-32 + player1Car.playerBox.width) >= canvas.width) {
    player1Car.x = canvas.width - player1Car.width;
}
	if ((player1Car.x-32 + player1Car.playerBox.height) >= canvas.height) {
    player1Car.x = canvas.height - player1Car.height;
}
	
	if ((player2Car.x-32 + player2Car.playerBox.width) >= canvas.width) {
    player2Car.x = canvas.width - player2Car.width;
}
	if ((player2Car.x-32 + player2Car.playerBox.height) >= canvas.height) {
    player2Car.x = canvas.height - player2Car.height;
}

}

//Cria um collider atraves do agulo que o carro esta
function BoundingCarsDimensions(angle, width_, height_) {
    var c = Math.abs(Math.cos(angle));
    var s = Math.abs(Math.sin(angle));
    return({width: height_ * s + width_ * c, height: height_ * c + width_ * s});
}

//Toma conta de todo o UI
function DrawUI() {
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.font = '20pt Arial';
    ctx.fillText("Time: " + raceTimer.toFixed(2), 10, 30);
    ctx.fillText("Lap: 0/3", canvas.width - 120, 30);
    ctx.closePath();
}

//objeto dos botoes
function Button(sprite, type, x, y, w, h) {
	this.type = type; //ID do botão ([0] Play , [1] Options, [2] Som)
    this.x = x; //abcissa do canto superior direito
    this.y = y; //ordenada do canto superior direito
    this.w = w; //largura
    this.h = h; //altura

    this.draw = function () {
        ctx.beginPath();
        ctx.drawImage(sprite, x, y, w, h);
        ctx.closePath();
    }

    this.isInside = function (mx, my) {
        return (this.x <= mx) && (this.x + this.w >= mx) &&
          (this.y <= my) && (this.y + this.h >= my);
    }
}

//funcao de clicar
function mouseDown (e) {
    //obter as coordenas do rato
    var mX = e.pageX - canvas.offsetLeft;
    var mY = e.pageY - canvas.offsetTop;
    console.log(mX + " " + mY);
    for(var i = 0; i < buttons.length; i++)
    {
        if(buttons[i].isInside(mX, mY)){
			console.log("Click [] " + buttons[i].type);
			switch(buttons[i].type)
			{
				case 0:
					cancelAnimationFrame(DrawMenu);
					Main();
					break;
					
				case 1:
					// OPCOES
					break;
					
				case 2:
					SoundHandler();
					break;	
			}
        }
    }
}

canvas.addEventListener("mousedown", mouseDown);

//Controla o som do menu
function SoundHandler(){
    if(sound){
        sound = false;
        audio.pause();
    } else {
        sound = true;
        audio.play();
    }
}

var btnPlay = new Button(imgPlay, 0, canvas.width/2 - 274/2, 125*1.7, 274, 125);
var btnOptn = new Button(imgOptn, 1, canvas.width/2 - 274/2, 125*2.75, 274, 125);
var btnSound = new Button(imgSound, 2, canvas.width-125, 10, 75, 75);
var btnMute = new Button(imgMute, 2, canvas.width-125, 10, 75, 75);

buttons.push(btnPlay);
buttons.push(btnOptn);
buttons.push(btnSound);
buttons.push(btnMute);

//Desenha o menu
function DrawMenu(){

    //pinta o background
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#014508";
    ctx.fill();
    ctx.closePath();

    //titulo
    ctx.beginPath();
    ctx.drawImage(imgLogo, canvas.width/2 - imgLogo.width/2, 0);
    ctx.closePath();

    //Desenhar botoes
    for(var i = 0; i < buttons.length-2; i++)
    {
        buttons[i].draw();
    }
    if(sound){
        btnSound.draw();
    } else {
        btnMute.draw();
    }
    //btnSound
    
        
    requestAnimationFrame(DrawMenu);
}

//Controla o jogo todo
var Main = function () {
    now = Date.now();
    delta = now - then;
    timer = delta / (1000 / 60);
    Update(timer);
    RenderGameArea();
    then = now;
    //Desenha por frame
    timer = requestAnimationFrame(Main);
};

//Faz update ao jogo, controla o movimento do carro
var Update = function (modifier) {
	
    raceTimer += delta / 1000;

    //Player 1
    if (38 in keysDown) { // Cima
        player1Car.speed += player1Car.accelaration;
    } else { //
        player1Car.speed -= player1Car.accelaration;
    }
    if (40 in keysDown) { // Baixo
        player1Car.speed -= player1Car.accelaration;
    }
    if (37 in keysDown) { // Esquerda
        player1Car.angle += player1Car.accelaration;
    }
    if (39 in keysDown) { // Direita
        player1Car.angle -= player1Car.accelaration;
    } 

    //Player2
    if (87 in keysDown) { // Cima
        player2Car.speed += player2Car.accelaration;
    } else { //
        player2Car.speed -= player2Car.accelaration;
    }
    if (83 in keysDown) { // Baixo
        player2Car.speed -= player2Car.accelaration;
    }
    if (65 in keysDown) { // Esquerda
        player2Car.angle += player2Car.accelaration;
    }
    if (68 in keysDown) { // Direita
        player2Car.angle -= player2Car.accelaration;
    } 

    //Controla a velocidade do Jogador1
    if(player1Car.speed > player1Car.maxSpeed)
        player1Car.speed = player1Car.maxSpeed;
    
    if(player1Car.speed < player1Car.minSpeed)
        player1Car.speed = player1Car.minSpeed;

    //Controla a velocidade do Jogador2
    if(player2Car.speed > player2Car.maxSpeed)
        player2Car.speed = player2Car.maxSpeed;
    
    if(player2Car.speed < player2Car.minSpeed)
        player2Car.speed = player2Car.minSpeed;

    //Movimento do Jogador1
    player1Car.x += player1Car.speed * Math.cos(player1Car.angle);
    player1Car.y -= player1Car.speed * Math.sin(player1Car.angle);

    //Movimento do Jogador2
    player2Car.x += player2Car.speed * Math.cos(player2Car.angle);
    player2Car.y -= player2Car.speed * Math.sin(player2Car.angle);

    GameCollisionDetection();
    // Bordas

};

//Aumenta compatabilidade da função com outros browsers
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

//Começa o jogo
//Main();

//Desenha o menu
DrawMenu();