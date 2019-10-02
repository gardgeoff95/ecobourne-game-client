let board = {
  maxTiles: 100,
  tileWidth: 16,
  tileHeight: 16,
  foodPositions: [],
  foxDenPositions: [],
  season: 0
};
const FOX_DEN = 5;
const GRASS_1 = 0;
const GRASS_2 = 2;
const GRASS_3 = 4;
const grassArray = [GRASS_1, GRASS_2, GRASS_3, FOX_DEN];
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const backgroundCanvas = document.getElementById("background");
const backGroundCtx = backgroundCanvas.getContext("2d");
let foxId = 25;

let bunnyId = 30;

let mapArray = new Array();
let bunnieCount = 0;
let bunnyImg = new Image();
let foxImg = new Image();
let grassImg = new Image();
grassLoaded = false;
grassImg.src = "grassTiles.png";
bunnyImg.src = "rabbit.png";
foxImg.src = "fox.png";
grassImg.onload = () => {
  renderBackground();
  startGame();
};
let Animal = function(animalType, x, y, id, color, speedModifier, direction) {
  this.animalType = animalType;
  this.id = id;
  this.col = x;
  this.row = y;
  this.speedModifier = speedModifier;
  this.color = color;

  this.state = "idle";

  //Max pops
  this.max = 50;
  this.reevaluate = false;

  this.maxHunger = randomNumber(2000, 3000);
  this.starvation = randomNumber(4000, 4500);

  this.currentDirection = direction;
  this.upOrDown = "up";

  this.foodSearch = false;
  this.foodToSplice = null;

  //Counter variables for bunny
  this.babyTime = 0;
  this.eating = 0;
  this.multiplyTime = 500;

  //Counter variables for fox
  this.preyEaten = 0;
  this.denCounter = 0;

  //Counter variables for all
  this.moveCounter = 0;
  this.timeAlive = 0;
  this.idleTime = 0;
  this.hunger = 0;

  //pathing objects for different animals
  this.closestFood = {
    x: null,
    y: null
  };

  this.denPath = {
    x: null,
    y: null
  };

  //Function called every time the startGame interval is called
  this.stateManager = function() {
    console.log(this.state);
    if (this.animalType === "fox") {
      console.log(this.state);
    }
    if (this.state === "idle") {
      this.move();
    } else if (
      this.state === "pathing" &&
      board.foodPositions.length > 0 &&
      this.animalType === "rabbit"
    ) {
      this.findFood();
    }
    if (this.state === "den" && this.animalType === "fox") {
      this.multiply();
    }

    if (
      this.state === "idle" &&
      this.animalType === "fox" &&
      this.preyEaten < 6
    ) {
      this.preyBunnies();
    }
    if (this.state === "hungry" && board.foodPositions.length > 0 && !this.reevaluate) {
      this.pathForFood();
    }
    if (this.state == "dead") {
      this.die();
    }

    if (this.animalType === "rabbit") {
      this.detectBunny();
    }
    if (this.animalType === "fox" && this.state === "tired") {
      this.findDen();
    }
    if (this.animalType === "fox" && this.state === "pathing") {
      this.returnToDen();
    }
  };
  //Function for detecting bunnies nearby for makin babies
  this.detectBunny = function() {
    for (let i = 0; i < bunniesArray.length; i++) {
      if (bunniesArray[i].state !== "dead") {
        if (
          (this.col + 1 === bunniesArray[i].col &&
            this.row == bunniesArray[i].row) ||
          (this.col - 1 === bunniesArray[i].col &&
            this.row == bunniesArray[i].row) ||
          (this.row + 1 === bunniesArray[i].row &&
            this.col == bunniesArray[i].col) ||
          (this.row - 1 === bunniesArray[i].row &&
            this.col == bunniesArray[i].col) ||
          (this.col === bunniesArray[i].col &&
            this.row === bunniesArray[i].row &&
            this.id != bunniesArray[i].id)
        ) {
          if (this.babyTime > 400 && bunniesArray[i].babyTime > 200) {
            this.babyTime = 0;

            this.multiply();
          }
        }
      }
    }
  };
  //causes the animal to multiply

  this.multiply = function() {
    if (this.animalType === "rabbit") {
      if (bunniesArray.length < this.max) {
        bunnyId++;
        bunniesArray.push(
          new Animal("rabbit", this.col + 5, this.row, bunnyId, "yellow", 20)
        );
      }
    } else if (this.animalType === "fox") {
      let dir = randomNumber(1, 2);
      if (foxArray.length < 3) {
        foxId++;
        if (dir === 1) {
          foxArray.push(
            new Animal(
              "fox",
              this.col + 2,
              this.row + 1,
              foxId,
              "yellow",
              20,
              "left"
            )
          );
        } else {
          foxArray.push(
            new Animal(
              "fox",
              this.col + 2,
              this.row + 1,
              foxId,
              "yellow",
              20,
              "right"
            )
          );
        }
        this.state = "idle";
        this.preyEaten = 0;
      }
    }
  };
  //draws the animal to the canvas every frame
  this.draw = function() {
    if (this.animalType === "rabbit") {
      draw("image", bunnyImg, this.col, this.row);
    } else if (this.animalType === "fox" && this.state != "den") {
      draw("image", foxImg, this.col, this.row);
    }
  };

  //finds random path to den if fox
  this.findDen = function() {
    let randomIndex = randomNumber(0, board.foxDenPositions.length);

    let randomArrayItem = board.foxDenPositions[randomIndex];

    if (board.foxDenPositions[randomIndex].taken === false && board.foxDenPositions[randomNumber].xPos < 25) {
      let y = randomArrayItem.xPos;
      let x = randomArrayItem.yPos;
      this.denPath.x = x;
      this.denPath.y = y;
      board.foxDenPositions[randomIndex].taken = true;

      this.state = "pathing";
    } 
    
  };
  //paths to the above den
  this.returnToDen = function() {
    let possibleJumps = [];

    if (
      this.row + 1 < board.maxTiles &&
      grassArray.includes(mapArray[this.row + 1][this.col])
    ) {
      possibleJumps.push("down");
    }
    if (
      this.row - 1 > 0 &&
      grassArray.includes(mapArray[this.row - 1][this.col])
    ) {
      possibleJumps.push("up");
    }
    if (grassArray.includes(mapArray[this.row][this.col + 1])) {
      possibleJumps.push("right");
    }
    if (grassArray.includes(mapArray[this.row][this.col - 1])) {
      possibleJumps.push("left");
    }

    this.moveCounter += 50;
    console.log(this.denPath);
    if (this.moveCounter > 100) {
      if (this.row > this.denPath.y && possibleJumps.includes("up")) {
        this.row -= 1;
      } else if (this.row < this.denPath.y && possibleJumps.includes("down")) {
        this.row += 1;
      } else if (this.col > this.denPath.x && possibleJumps.includes("left")) {
        this.col -= 1;
      } else if (this.col < this.denPath.x && possibleJumps.includes("right")) {
        this.col += 1;
      } else if (
        this.denPath.x + 1 === this.col ||
        this.denPath.x - 1 === this.col ||
        this.denPath.y + 1 === this.row ||
        this.denPath.y - 1 === this.row
      ) {
        this.state = "den";
      } else {
        this.state = "tired";
      }
      this.moveCounter = 0;
    }
  };
  //finds random berry node on map, saves it in obj
  this.findFood = function() {
    let randomIndex = randomNumber(0, board.foodPositions.length);

    let randomArrayItem = board.foodPositions[randomIndex];

    let y = randomArrayItem.xPos;
    let x = randomArrayItem.yPos;
    this.closestFood.x = x;
    this.closestFood.y = y;
    this.foodToSplice = randomIndex;
    this.state = "hungry";

    return;
  };
  //pops from array
  this.die = function() {
    if (this.animalType === "rabbit") {
      bunniesArray = bunniesArray.filter(bunny => bunny.id != this.id);
      console.log("Bunnies array ", bunniesArray);
      console.log("My id is ", this.id);
    }
    // for (let i = 0; i < bunniesArray.length; i++) {
    //   if (this.id === bunniesArray[i].id) {
    //     bunniesArray.splice(i, 1);
    //   }
    // }
  };
  this.preyBunnies = function() {
    for (let i = 0; i < bunniesArray.length; i++) {
      if (
        (this.col + 1 === bunniesArray[i].col &&
          this.row === bunniesArray[i].row) ||
        (this.col - 1 === bunniesArray[i].col &&
          this.row === bunniesArray[i].row) ||
        (this.row + 1 === bunniesArray[i].row &&
          this.col === bunniesArray[i].col) ||
        (this.row - 1 === bunniesArray[i].row &&
          this.col === bunniesArray[i].col) ||
        (this.row === bunniesArray[i].row && this.col === bunniesArray[i].col)
      ) {
        this.preyEaten++;
        bunniesArray[i].state = "dead";
        bunniesArray = bunniesArray.filter(
          bunny => bunny.id !== bunniesArray[i].id
        );
        if (this.preyEaten === 1) {
          this.state = "tired";
        }
      }
    }
  };
  this.pathForFood = function() {
    let possibleJumps = [];

    if (
      this.row + 1 < board.maxTiles &&
      grassArray.includes(mapArray[this.row + 1][this.col])
    ) {
      possibleJumps.push("down");
    }
    if (
      this.row - 1 > 0 &&
      grassArray.includes(mapArray[this.row - 1][this.col])
    ) {
      possibleJumps.push("up");
    }
    if (grassArray.includes(mapArray[this.row][this.col + 1])) {
      possibleJumps.push("right");
    }
    if (grassArray.includes(mapArray[this.row][this.col - 1])) {
      possibleJumps.push("left");
    }
    this.hunger++
    this.babyTime++;
    console.log(this.closestFood)

    this.moveCounter += 20;
    if (this.moveCounter > 100) {
      if (this.row > this.closestFood.y && possibleJumps.includes("up")) {
        this.row -= 1;
        // start
      } else if (
        this.row < this.closestFood.y &&
        possibleJumps.includes("down")
      ) {
        this.row += 1;
      } else if (
        this.col > this.closestFood.x &&
        possibleJumps.includes("left")
      ) {
        this.col -= 1;
      } else if (
        this.col < this.closestFood.x &&
        possibleJumps.includes("right")
      ) {
        this.col += 1;
      } else if (
        this.closestFood.x + 1 === this.col ||
        this.closestFood.x - 1 === this.col ||
        this.closestFood.y + 1 === this.row ||
        this.closestFood.y - 1 === this.row
      ) {
        this.eating += 1;
        if (this.eating > 15) {
          board.foodPositions.splice(this.foodToSplice, 1);
          mapArray[this.closestFood.y][this.closestFood.x] = 0;
          renderBackground();

          this.state = "idle";
          this.hunger = 0;
          this.eating = 0;
        }
      } else if (this.hunger > this.starvation) {
        console.log("starved");
        this.state = "dead"
      } else {
        this.state = "idle"
      }
      this.moveCounter = 0;
    }

    return;
  };
  this.move = function() {
    if (this.animalType === "rabbit") {
      let possibleJumps = [];
      let direction;

      if (
        this.row + 1 < board.maxTiles &&
        grassArray.includes(mapArray[this.row + 1][this.col])
      ) {
        possibleJumps.push("down");
      }
      if (
        this.row - 1 > 0 &&
        grassArray.includes(mapArray[this.row - 1][this.col])
      ) {
        possibleJumps.push("up");
      }
      if (grassArray.includes(mapArray[this.row][this.col + 1])) {
        possibleJumps.push("right");
      }
      if (grassArray.includes(mapArray[this.row][this.col - 1])) {
        possibleJumps.push("left");
      }
      direction =
        possibleJumps[Math.floor(Math.random() * possibleJumps.length)];
      this.idleTime += 1;
      this.hunger += 1;
      this.babyTime++;
      this.moveCounter += 50;
      if (this.moveCounter > randomNumber(300, 400)) {
        switch (direction) {
          case "up":
            this.row -= 1;
            break;
          case "down":
            this.row += 1;
            break;
          case "left":
            this.col -= 1;
            break;
          case "right":
            this.col += 1;
            break;
        }

        this.timeAlive++;
        if (this.timeAlive > randomNumber(100000, 50000000)) {
          console.log("died from age");
          this.state = "dead";
        }
        if (this.hunger > this.maxHunger && board.foodPositions.length > 1) {
          console.log("FOOD SEARCH");
          this.state = "pathing";
        }
        if (this.hunger > this.starvation) {
          console.log("STARVED");
          this.state = "dead";
        }
        this.moveCounter = 0;
      }
    } else if (this.animalType === "fox" && this.state === "idle") {
      let possibleJumps = [];

      if (
        this.row + 1 < board.maxTiles &&
        grassArray.includes(mapArray[this.row + 1][this.col])
      ) {
        possibleJumps.push("down");
      }
      if (
        this.row - 1 > 0 &&
        grassArray.includes(mapArray[this.row - 1][this.col])
      ) {
        possibleJumps.push("up");
      }
      if (grassArray.includes(mapArray[this.row][this.col + 1])) {
        possibleJumps.push("right");
      }
      if (grassArray.includes(mapArray[this.row][this.col - 1])) {
        possibleJumps.push("left");
      }

      this.moveCounter += 80;
      if (this.moveCounter > randomNumber(150, 200)) {
        if (
          possibleJumps.includes("left") &&
          this.col > 0 &&
          this.currentDirection === "left"
        ) {
          this.col--;
        } else if (
          possibleJumps.includes("up") &&
          this.col === 0 &&
          this.upOrDown === "up"
        ) {
          if (this.currentDirection === "left") {
            this.currentDirection = "right";
            this.row--;
            this.col++;
          }
        } else if (possibleJumps.includes("up") && this.col === 99) {
          if (this.currentDirection === "right") {
            this.currentDirection = "left";
            this.row--;
            this.col--;
          }
        } else if (
          possibleJumps.includes("right") &&
          this.col < board.maxTiles &&
          this.currentDirection === "right"
        ) {
          this.col++;
        }
        if (
          this.currentDirection === "right" &&
          !possibleJumps.includes("right")
        ) {
          this.row--;
        }
        if (
          this.currentDirection === "left" &&
          !possibleJumps.includes("left")
        ) {
          this.row--;
        }
        if (this.row === 0) {
          this.currentDirection = "down";
        }
        if (
          this.currentDirection === "down" &&
          possibleJumps.includes("down")
        ) {
          this.row++;
        } else if (
          this.currentDirection === "down" &&
          !possibleJumps.includes("down")
        ) {
          this.col++;
        }
        if (this.currentDirection === "down" && this.row == 99) {
          this.currentDirection = "left";
        }

        this.moveCounter = 0;
      }
    }

    return;
  };
};
backgroundCanvas.width = board.tileHeight * board.maxTiles;
backgroundCanvas.height = board.tileWidth * board.maxTiles;
canvas.height = board.tileHeight * board.maxTiles;
canvas.width = board.tileWidth * board.maxTiles;

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
function draw(type, img = null, x, y, color, tile, row) {
  if (type == "rect") {
    backGroundCtx.fillStyle = color;
    backGroundCtx.fillRect(
      x * board.tileWidth,
      y * board.tileHeight,
      board.tileWidth,
      board.tileHeight
    );
  } else if (type === "image") {
    ctx.drawImage(
      img,
      0,
      0,
      16,
      16,
      x * board.tileWidth,
      y * board.tileHeight,
      board.tileWidth,
      board.tileHeight
    );
  } else if (type === "imageBack") {
    let tiles = [0, 16, 32];

    backGroundCtx.drawImage(
      img,
      tile,
      row,
      16,
      16,
      x * board.tileWidth,
      y * board.tileHeight,
      board.tileWidth,
      board.tileHeight
    );
  }
}

function createArray() {
  for (let i = 0; i < board.maxTiles; i++) {
    mapArray[i] = [];
  }
  for (let x = 0; x < board.maxTiles; x++) {
    for (let y = 0; y < board.maxTiles; y++) {
      const rando = randomNumber(1, 1000);

      if (rando <= 1) {
        mapArray[x][y] = FOX_DEN;
        board.foxDenPositions.push({ xPos: x, yPos: y, taken: false });
      }  else if (rando <= 20) {
        mapArray[x][y] = 3;
        board.foodPositions.push({ xPos: x, yPos: y, taken: false, uses: 5 });
      } else if (rando <= 200) {
        mapArray[x][y] = GRASS_2;
      } else if (rando <= 500) {
        mapArray[x][y] = GRASS_3;
      } else {
        mapArray[x][y] = GRASS_1;
      }
    }
  }
}

function renderBackground() {
  for (let y = 0; y < board.maxTiles; y++) {
    for (let x = 0; x < board.maxTiles; x++) {
      if (board.season > 5000) {
        switch (mapArray[y][x]) {
          case GRASS_1:
            draw("imageBack", grassImg, x, y, null, 16, 0);
            break;
          case 1:
            draw("imageBack", grassImg, x, y, null, 64, 16);
            break;
          case GRASS_2:
            draw("imageBack", grassImg, x, y, null, 0, 16);
            break;
          case 3:
            draw("imageBack", grassImg, x, y, null, 48, 0);
            break;
          case FOX_DEN:
            draw("imageBack", grassImg, x, y, null, 80, 0);
            break;
          default:
            draw("imageBack", grassImg, x, y, null, 32, 16);
            break;
        }
      } else {
        switch (mapArray[y][x]) {
          case GRASS_1:
            draw("imageBack", grassImg, x, y, null, 16, 0);
            break;
          case 1:
            draw("imageBack", grassImg, x, y, null, 64, 0);
            break;
          case GRASS_2:
            draw("imageBack", grassImg, x, y, null, 0, 0);
            break;
          case 3:
            draw("imageBack", grassImg, x, y, null, 48, 0);
            break;
          case FOX_DEN:
            draw("imageBack", grassImg, x, y, null, 80, 0);
            break;
          default:
            draw("imageBack", grassImg, x, y, null, 32, 0);
            break;
        }
      }
    }
  }
}
function renderHabitat() {
  for (let y = 0; y < board.maxTiles; y++) {
    for (let x = 0; x < board.maxTiles; x++) {}
  }
}

function addFood() {
  if (board.foodPositions.length < 50) {
    let x = randomNumber(1, board.maxTiles);
    let y = randomNumber(1, board.maxTiles);
    if (mapArray[x][y] === 0) {
      mapArray[x][y] = 3;
      board.foodPositions.push({ xPos: x, yPos: y, taken: false, uses: 5 });
      renderBackground();
    }
  }
}
setInterval(addFood, 2000);
function click(event) {
  var x = event.clientX;
  var y = event.clientY;
  console.log(x + " " + y);
}
canvas.addEventListener(
  "click",
  function(evt) {
    var mousePos = getMousePos(canvas, evt);

    mapArray[mousePos.y][mousePos.x] = 1;
    renderBackground();
  },
  false
);

//Get Mouse Position
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor((evt.clientX - rect.left) / board.tileWidth),
    y: Math.floor((evt.clientY - rect.top) / board.tileHeight)
  };
}
let bunniesArray = [
  new Animal(
    "rabbit",
    randomNumber(30, 40),
    randomNumber(5, 10),
    1,
    "yellow",
    20
  ),
  new Animal(
    "rabbit",
    randomNumber(30, 40),
    randomNumber(5, 10),
    2,
    "yellow",
    20
  ),
  new Animal(
    "rabbit",
    randomNumber(30, 40),
    randomNumber(5, 10),
    3,
    "yellow",
    20
  ),
  new Animal(
    "rabbit",
    randomNumber(30, 40),
    randomNumber(5, 10),
    4,
    "yellow",
    20
  ),
  new Animal(
    "rabbit",
    randomNumber(30, 40),
    randomNumber(5, 10),
    5,
    "yellow",
    20
  )
];
let foxArray = [
  // new Animal(
  //   "fox",
  //   randomNumber(30, 40),
  //   randomNumber(30, 40),
  //   10,
  //   "yellow",
  //   20,
  //   "right"
  // )
];

function initialize(animal) {
  for (i = 0; i < bunniesArray.length; i++) {
    if (bunniesArray[i].state !== "dead") {
      bunniesArray[i].draw();
      bunniesArray[i].stateManager();
    }
  }
  for (i = 0; i < foxArray.length; i++) {
    foxArray[i].draw();
    foxArray[i].stateManager();
  }
}

createArray();
console.log(mapArray);
let frameCount = 0;
function mainLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  initialize();
  board.season += 1;

  if (board.season === 5000) {
    renderBackground();
  }
}
function startGame() {
  setInterval(mainLoop, 1);
}
