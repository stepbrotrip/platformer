let running = true;
let oldTime = performance.now();
let accumulator = 0;
let parent = document.getElementById("spawnRoom");
let player;
let playerHV = 0;
let playerJH = -7;
let playerSpd = 3;
let playerVV = 0;
let onGround = false;
let playerRect = {x: 5, y: 20, w: (window.innerWidth / 100) * 4, h: (window.innerHeight / 100) * 15};
const grv = 0.2;
const FPS = 60;
const frameDuration = 1000 / FPS;
let isJumping = false;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.w &&
           rect1.x + rect1.w > rect2.x &&
           rect1.y < rect2.y + rect2.h &&
           rect1.y + rect1.h > rect2.y;
}

function createPlayer() {
    player = document.createElement("div");
    player.classList.add("player", "idle");
    parent.appendChild(player);
}

let buttonsUp = [false, false];

function mobileButtonPressed(button) {
    console.log(button + " pressed");
    switch (button) {
        case "right":
            playerHV = 1;
            buttonsUp[0] = true;
            break;
        case "left":
            playerHV = -1;
            buttonsUp[1] = true;
            break;
        case "jump":
            if (!isJumping && onGround) {
                playerVV = playerJH;
                isJumping = true;
                onGround = false;
            }
            break;
    }
}

function mobileButtonReleased(button) {
    console.log(button + " released");
    switch (button) {
        case "right":
            playerHV = 0;
            buttonsUp[0] = false;
            break;

        case "left":
            playerHV = 0;
            buttonsUp[1] = false;
            break;
    }
}

const buttons = document.getElementsByClassName("moveButton");

function init() {
    createPlayer();
    console.log(buttons);
    for (let i = 0; i < buttons.length; i++){
        buttons[i].addEventListener("mousedown", function(){mobileButtonPressed(buttons[i].id);});
        buttons[i].addEventListener("touchstart", function(){mobileButtonPressed(buttons[i].id);});
        document.addEventListener("mouseup", function(){mobileButtonReleased("left"); mobileButtonReleased("right")});
        buttons[i].addEventListener("mouseup", function(){ console.log("mouse up"); mobileButtonReleased(buttons[i].id);});
        buttons[i].addEventListener("touchend", function(){mobileButtonReleased(buttons[i].id);});
        
        console.log("events started");
    };

    requestAnimationFrame(mainLoop);
}

function updatePlayerPos(x, y) {
    playerRect.x = x;
    playerRect.y = y;
    player.style.left = x + "px";
    player.style.top = y + "px";
}

const city = document.getElementById("city1");
const spawn = document.getElementById("spawnRoom");
const colliders = document.getElementsByClassName("col");
const cityCol = city.getElementsByClassName("col");
const cityElem = Array.prototype.filter.call(
    cityCol,
    (cityCol) => cityCol.nodeName === "DIV"
);
const spawnCol = spawn.getElementsByClassName("col");
const spawnElem = Array.prototype.filter.call(
    spawnCol,
    (spawnCol) => spawnCol.nodeName === "DIV"
);

let colliderRects = [];
let cityColRects = [];
let spawnColRects = [];

function updateColliders() {
    cityColRects = [];
    spawnColRects = [];
    for (let i = 0; i < cityElem.length; i++) {
        let style = getComputedStyle(cityElem[i]);
        let x = style.left;
        let y = style.top;

        if (x.includes("px")) {
            x = parseInt(x, 10);
        } else if (x.includes("%")) {
            x = window.innerWidth * ((parseInt(x, 10)) / 100);
        }

        if (y.includes("px")) {
            y = parseInt(y, 10);
        } else if (y.includes("%")) {
            y = window.innerHeight * ((parseInt(y, 10)) / 100);
        }

        cityColRects.push({x: x, y: y, w: parseInt(style.width, 10), h: parseInt(style.height, 10)});
    }
    for (let i = 0; i < spawnElem.length; i++) {
        let style = getComputedStyle(spawnElem[i]);
        let x = style.left;
        let y = style.top;

        if (x.includes("px")) {
            x = parseInt(x, 10);
        } else if (x.includes("%")) {
            x = window.innerWidth * ((parseInt(x, 10)) / 100);
        }

        if (y.includes("px")) {
            y = parseInt(y, 10);
        } else if (y.includes("%")) {
            y = window.innerHeight * ((parseInt(y, 10)) / 100);
        }

        spawnColRects.push({x: x, y: y, w: parseInt(style.width, 10), h: parseInt(style.height, 10)});
    }
}
updateColliders();

function handleCollisions() {
    let newPRect = {x: playerRect.x+(playerHV*playerSpd), y: playerRect.y + playerVV, w: playerRect.w, h: playerRect.h};
    
    if (parent.id === "spawnRoom") {
        spawnColRects.forEach(collider => {
            //horizontal collisions first
            if (isCollision(newPRect ,collider)){
                console.log("you're in boundaries of: ", collider);
                playerHV = 0;

                if (playerRect.y + playerRect.h < collider.y){
                    playerVV = 0;
                    onGround = true;
                    playerRect.y = collider.y - playerRect.h;
                }else {
                    if (playerRect.x > collider.x+collider.w){
                        playerRect.x = collider.x+collider.w;
                    }
                    if (playerRect.x+playerRect.w < collider.x){
                        playerRect.x = collider.x-playerRect.w;
                    }
                }
            }
            if (playerRect.x > collider.x+collider.w || playerRect.x+playerRect.w < collider.x){
                if (playerRect.y + playerRect.h < collider.y)
                    onGround = false;
            }
        });
        
    }

    if (parent.id === "city1") {
        spawnColRects.forEach(collider => {
            //horizontal collisions first
            if (isCollision(newPRect ,collider)){
                console.log("you're in boundaries of: ", collider);

            }
        });
        
    }

    if (playerRect.y + playerRect.h >= window.innerHeight) {
        onGround = true;
        isJumping = false;
        playerVV = 0;
        playerRect.y = window.innerHeight - playerRect.h;
    }
    
}

function update() {
    let pStyle = getComputedStyle(player);
    playerRect = {
        x: parseInt(pStyle.left, 10),
        y: parseInt(pStyle.top, 10),
        w: (window.innerWidth / 100) * 4,
        h: (window.innerHeight / 100) * 15
    };

    if (!buttonsUp){
        playerHV = 0;
    }

    updateColliders();

    if (!onGround) {
        playerVV += grv;
    } else {
        playerVV = 0;
    }

    handleCollisions();
    console.log(playerHV);
    updatePlayerPos(playerRect.x + (playerHV * playerSpd), playerRect.y + playerVV);
}

function mainLoop(currentTime) {
    if (!running) return;

    let deltaTime = currentTime - oldTime;
    oldTime = currentTime;
    accumulator += deltaTime;

    while (accumulator >= frameDuration) {
        update();
        accumulator -= frameDuration;
    }

    requestAnimationFrame(mainLoop);
}

init();
