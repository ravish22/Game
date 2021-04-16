const speedDash = document.querySelector('.speedDash');
const scoreDash = document.querySelector('.scoreDash');
const lifeDash = document.querySelector('.lifeDash');
const container = document.getElementById('container');
const btnStart = document.querySelector('.btnStart');
btnStart.addEventListener('click', startGame);
document.addEventListener('keydown', pressKeyOn);
document.addEventListener('keyup', pressKeyOff);
var mysong=document.getElementById("mysong");
//Game Variables
let animationGame;
let gamePlay = false;
let player;
let keys = {
    ArrowUp: false
    , ArrowDown: false
    , ArrowLeft: false
    , ArrowRight: false
}
class JoystickController
{
  constructor( stickID, maxDistance, deadzone )
  {
    this.id = stickID;
    let stick = document.getElementById(stickID);

    // location from which drag begins, used to calculate offsets
    this.dragStart = null;

    // track touch identifier in case multiple joysticks present
    this.touchId = null;
    
    this.active = false;
    this.value = { x: 0, y: 0 }; 

    let self = this;

    function handleDown(event)
    {
        self.active = true;

      // all drag movements are instantaneous
      stick.style.transition = '0s';

      // touch event fired before mouse event; prevent redundant mouse event from firing
      event.preventDefault();

        if (event.changedTouches)
          self.dragStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
        else
          self.dragStart = { x: event.clientX, y: event.clientY };

      // if this is a touch event, keep track of which one
        if (event.changedTouches)
          self.touchId = event.changedTouches[0].identifier;
    }
    
    function handleMove(event) 
    {
        if ( !self.active ) return;

        // if this is a touch event, make sure it is the right one
        // also handle multiple simultaneous touchmove events
        let touchmoveId = null;
        if (event.changedTouches)
        {
          for (let i = 0; i < event.changedTouches.length; i++)
          {
            if (self.touchId == event.changedTouches[i].identifier)
            {
              touchmoveId = i;
              event.clientX = event.changedTouches[i].clientX;
              event.clientY = event.changedTouches[i].clientY;
            }
          }

          if (touchmoveId == null) return;
        }

        const xDiff = event.clientX - self.dragStart.x;
        const yDiff = event.clientY - self.dragStart.y;
        const angle = Math.atan2(yDiff, xDiff);
      const distance = Math.min(maxDistance, Math.hypot(xDiff, yDiff));
      const xPosition = distance * Math.cos(angle);
      const yPosition = distance * Math.sin(angle);

      // move stick image to new position
        stick.style.transform = `translate3d(${xPosition}px, ${yPosition}px, 0px)`;

      // deadzone adjustment
      const distance2 = (distance < deadzone) ? 0 : maxDistance / (maxDistance - deadzone) * (distance - deadzone);
        const xPosition2 = distance2 * Math.cos(angle);
      const yPosition2 = distance2 * Math.sin(angle);
        const xPercent = parseFloat((xPosition2 / maxDistance).toFixed(4));
        const yPercent = parseFloat((yPosition2 / maxDistance).toFixed(4));
        
        self.value = { x: xPercent, y: yPercent };
      }

    function handleUp(event) 
    {
        if ( !self.active ) return;

        // if this is a touch event, make sure it is the right one
        if (event.changedTouches && self.touchId != event.changedTouches[0].identifier) return;

        // transition the joystick position back to center
        stick.style.transition = '.2s';
        stick.style.transform = `translate3d(0px, 0px, 0px)`;

        // reset everything
        self.value = { x: 0, y: 0 };
        self.touchId = null;
        self.active = false;
    }

    stick.addEventListener('mousedown', handleDown);
    stick.addEventListener('touchstart', handleDown);
    document.addEventListener('mousemove', handleMove, {passive: false});
    document.addEventListener('touchmove', handleMove, {passive: false});
    document.addEventListener('mouseup', handleUp);
    document.addEventListener('touchend', handleUp);
  }
}
let myStick = new JoystickController("stick", 64, 8);

function update()
{
  document.getElementById("status").innerText = "Joystick1: " + JSON.stringify(joystick1.value);
}

function loop()
{
  requestAnimationFrame(loop);
  update();
}
loop();
function startGame() {
    //console.log(gamePlay);
    if(mysong.paused){
    mysong.play();
}
    container.innerHTML = ' ';
    btnStart.style.display = 'none';
    var div = document.createElement('div');
    div.setAttribute('class', 'playerCar');
    div.x = 250;
    div.y = 500;
    container.appendChild(div);
    gamePlay = true;
    animationGame = requestAnimationFrame(playGame);
    var n=10;
    player = {
        ele: div
        , speed: 0
        , lives: 3
        , gameScore: 0
        , carstoPass: n
        , score: 0
        , roadwidth: 250
        , gameEndCounter: 0
    }
    startBoard();
    setupBadGuys(10);
}

function setupBadGuys(num) {
    for (let x = 0; x < num; x++) {
        let temp = 'badGuy' + (x + 1);
        let div = document.createElement('div');
        div.innerHTML = (x + 1);
        div.setAttribute('class', 'baddy');
        div.setAttribute('id', temp);
        makeBad(div);
        container.appendChild(div);
    }
}

function randomColor() {
    function c() {
        let hex = Math.floor(Math.random() * 256).toString(16);
        return ('0' + String(hex)).substr(-2);
    }
    return '#' + c() + c() + c();
}

function makeBad(e) {
    let tempRoad = document.querySelector('.road');
    e.style.left = tempRoad.offsetLeft + Math.ceil(Math.random() * tempRoad.offsetWidth) - 30 + 'px';
    e.style.top = Math.ceil(Math.random() * -400) + 'px';
    e.speed = Math.ceil(Math.random() * 17) + 2;
    e.style.backgroundColor = randomColor();
}

function startBoard() {
    for (let x = 0; x < 13; x++) {
        let div = document.createElement('div');
        div.setAttribute('class', 'road');
        div.style.top = (x * 50) + 'px';
        div.setAttribute('id', 'x' + x);
        div.style.width = player.roadwidth + 'px';
        container.appendChild(div);
    }
}

function pressKeyOn(event) {
    event.preventDefault();
    ////console.log(keys);
    keys[event.key] = true;
}

function pressKeyOff(event) {
    event.preventDefault();
    //console.log(keys);
    keys[event.key] = false;
}

function updateDash() {
    ////console.log(player);  
    scoreDash.innerHTML = player.score;
    lifeDash.innerHTML = player.lives;
    speedDash.innerHTML = Math.round(player.speed * 13);
}

function moveRoad() {
    let tempRoad = document.querySelectorAll('.road');
    ////console.log(tempRoad);
    let previousRoad = tempRoad[0].offsetLeft;
    let previousWidth = tempRoad[0].offsetWidth;
    const pSpeed = Math.floor(player.speed);
    for (let x = 0; x < tempRoad.length; x++) {
        let num = tempRoad[x].offsetTop + pSpeed;
        if (num > 600) {
            num = num - 650;
            let mover = previousRoad + (Math.floor(Math.random() * 6) - 3);
            let roadWidth = (Math.floor(Math.random() * 11) - 5) + previousWidth;
            if (roadWidth < 200) roadWidth = 200;
            if (roadWidth > 400) roadWidth = 400;
            if (mover < 100) mover = 100;
            if (mover > 600) mover = 600;
            tempRoad[x].style.left = mover + 'px';
            tempRoad[x].style.width = roadWidth + 'px';
            previousRoad = tempRoad[x].offsetLeft;
            previousWidth = tempRoad[x].width;
        }
        tempRoad[x].style.top = num + 'px';
    }
    return {
        'width': previousWidth
        , 'left': previousRoad
    };
}

function isCollide(a, b) {
    let aRect = a.getBoundingClientRect();
    let bRect = b.getBoundingClientRect();
    ////console.log(aRect);
    return !(
        (aRect.bottom < bRect.top) || (aRect.top > bRect.bottom) || (aRect.right < bRect.left) || (aRect.left > bRect.right))
}

function moveBadGuys() {
    let tempBaddy = document.querySelectorAll('.baddy');
    for (let i = 0; i < tempBaddy.length; i++) {
        for (let ii = 0; ii < tempBaddy.length; ii++) {
            if (i != ii && isCollide(tempBaddy[i], tempBaddy[ii])) {
                tempBaddy[ii].style.top = (tempBaddy[ii].offsetTop + 20) + 'px';
                tempBaddy[i].style.top = (tempBaddy[i].offsetTop - 20) + 'px';
                tempBaddy[ii].style.left = (tempBaddy[ii].offsetLeft - 20) + 'px';
                tempBaddy[i].style.left = (tempBaddy[i].offsetLeft + 20) + 'px';
            }
        }
        let y = tempBaddy[i].offsetTop + player.speed - tempBaddy[i].speed;
        if (y > 2000 || y < -2000) {
            //reset car
            if (y > 2000) {
                updateDash();
                player.score++;
                updateDash();
                if (player.score > player.carstoPass) {
                    
                    mysong.pause();
                    gameOverPlay();
                }
            }
            makeBad(tempBaddy[i]);
            updateDash();
        }
       
        else {
            tempBaddy[i].style.top = y + 'px';
            let hitCar = isCollide(tempBaddy[i], player.ele);
            //console.log(hitCar);
            if (hitCar) {
                player.speed = 0;
                player.lives--;
                if (player.lives < 1) {
                    player.gameEndCounter = 1;
                    mysong.pause();
                    updateDash();
                }
                makeBad(tempBaddy[i]);
            }
        }
    }
}

function gameOverPlay() {
 
   
    let div = document.createElement('div');
    div.setAttribute('class', 'r');
    div.style.top = '0px';
    div.style.width = '250px';
    div.style.backgroundColor = 'red';
    div.innerHTML = 'FINISH';
    div.style.fontSize = '3em';
    div.style.zIndex='200'
    container.appendChild(div);
    player.gameEndCounter = 12;
    player.speed = 0;
}

function playGame() {
    if (gamePlay) {
        updateDash();
        ///Movement
        let roadPara = moveRoad();
        moveBadGuys();
        ////console.log(roadPara);
        if (keys.ArrowUp) {
            if (player.ele.y > 400) player.ele.y -= 1;
            player.speed = player.speed < 20 ? (player.speed + 0.05) : 20;
        }
        if (keys.ArrowDown) {
            if (player.ele.y < 500) {
                player.ele.y += 1;
            }
            player.speed = player.speed > 0 ? (player.speed - 0.2) : 0;
        }
        if (keys.ArrowRight) {
            player.ele.x += (player.speed / 4);
        }
        if (keys.ArrowLeft) {
            player.ele.x -= (player.speed / 4);
        }
        //check if on road
        if ((player.ele.x + 40) < roadPara.left || (player.ele.x > (roadPara.left + roadPara.width))) {
            if (player.ele.y < 500) {
                player.ele.y += +1;
            }
            player.speed = player.speed > 0 ? (player.speed - 0.2) : 1;
            //console.log('OFF ROAD');
        }
        ///move car
        player.ele.style.top = player.ele.y + 'px';
        player.ele.style.left = player.ele.x + 'px';
    }
    animationGame = requestAnimationFrame(playGame);
    if (player.gameEndCounter > 0) {
        player.gameEndCounter--;
        player.y = (player.y > 60) ? player.y - 30 : 60;
        if (player.gameEndCounter == 0) {
            gamePlay = false;
            cancelAnimationFrame(animationGame);
            btnStart.style.display = 'block';
        }
    }
}
