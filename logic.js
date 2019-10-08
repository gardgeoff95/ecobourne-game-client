
var firebaseConfig = {
  apiKey: "AIzaSyAaktd7xWg2F92a5py9ZBB5fdsySImFOGQ",
  authDomain: "ecobourne-fb892.firebaseapp.com",
  databaseURL: "https://ecobourne-fb892.firebaseio.com",
  projectId: "ecobourne-fb892",
  storageBucket: "",
  messagingSenderId: "342132988603",
  appId: "1:342132988603:web:59feab64b679748217279e"
};
firebase.initializeApp(firebaseConfig);
let database = firebase.database();

database.ref("/").set("")
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
const grassArray = [GRASS_1, GRASS_2, GRASS_3];
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const backgroundCanvas = document.getElementById("background");
const backGroundCtx = backgroundCanvas.getContext("2d");
const speedSlider = $("#range");

//counter variables for firebase

let fdbStarvation = 0;
let fdbAge = 0;
let bdbStarvation = 0;
let bdbAge = 0;
let rdbStarvation = 0;
let rdbAge = 0;
let dbPred = 0;


let timeStampNum = 0;
let time = 0;

let muted = false;
let speedModifier = 1;
let toolBox;
let sliderVal = $(speedSlider).val() / speedModifier;
let foxId = 25;
let bunnyId = 30;
let mapArray = new Array();
let bunnieCount = 0;
let bunnyImg = new Image();
let foxImg = new Image();
let bearImg = new Image();
let grassImg = new Image();
let pop = new Audio("blop.wav");
grassImg.src = "grassTiles.png";
bunnyImg.src = "rabbit.png";
foxImg.src = "fox.png";
bearImg.src = "bear.png";
grassImg.onload = () => {
  renderBackground();
  startGame();
};
database.ref(`/timestamps/${timeStampNum}`).set(time);
let Animal = function(animalType, x, y, id, color, speedModifier, direction) {
  this.animalType = animalType;
  this.id = id;
  this.col = x;
  this.row = y;
  this.speedModifier = speedModifier;
  this.color = color;

  this.state = "idle";

  //Max pops
  this.max = 40;
  this.reevaluate = false;

  this.maxHunger = randomNumber(500, 700);
  this.starvation = randomNumber(600, 800);

  this.currentDirection = direction;
  this.upOrDown = "up";

  this.pathLength = 0;

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
    if (
      this.state === "hungry" &&
      board.foodPositions.length > 0 &&
      !this.reevaluate
    ) {
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
          if (this.babyTime > 100 && bunniesArray[i].babyTime > 100) {
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
        // if (!muted) {
        //   pop.play();
        // }
        bunniesArray.push(
          new Animal("rabbit", this.col + 5, this.row, bunnyId, "yellow", 20)
        );
      }
    } else if (this.animalType === "fox") {
      this.denCounter++;
      if (this.denCounter > 500) {
        let dir = randomNumber(1, 2);
        if (foxArray.length < 10) {
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
          this.denCounter = 0;
        } else {
          this.state = "idle";
          this.preyEaten = 0;
          this.denCounter = 0;
        }
      }
    }
  };
  //draws the animal to the canvas every frame
  this.draw = function() {
    if (this.animalType === "rabbit") {
      draw("image", bunnyImg, this.col, this.row);
    } else if (this.animalType === "fox" && this.state != "den") {
      draw("image", foxImg, this.col, this.row);
    } else if (this.animalType === "bear") {
      draw("image", bearImg, this.col, this.row);
    }
  };

  //finds random path to den if fox
  this.findDen = function() {
    let randomIndex = randomNumber(0, board.foxDenPositions.length);
    let randomArrayItem = board.foxDenPositions[randomIndex];
    let y = randomArrayItem.xPos;
    let x = randomArrayItem.yPos;
    this.denPath.x = x;
    this.denPath.y = y;
    board.foxDenPositions[randomIndex].taken = true;

    this.state = "pathing";
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
      // console.log("another one bites the dust")
      // console.log(bunniesArray.length) 
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
        dbPred++;
        writeData("rabbit", "predator");

        if (this.preyEaten === 3) {
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
    // this.hunger++;
    this.babyTime++;
    this.timeAlive++;
    if (this.timeAlive > randomNumber(2000, 2200)) {
      rdbAge++;
      writeData("rabbit", "oldAge");

      this.state = "dead";
    }

    this.moveCounter += 50;
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
        rdbStarvation += 1;

        this.state = "dead";
      } else {
        this.state = "idle";
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
      this.moveCounter += 100;
      if (this.moveCounter > randomNumber(100, 200)) {
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
        if (this.timeAlive > randomNumber(2000, 2200)) {
          rdbAge++;
          writeData("rabbit", "age");
          this.state = "dead";
        }
        if (this.hunger > this.maxHunger && board.foodPositions.length > 1) {
          this.state = "pathing";
        }
        if (this.hunger > this.starvation) {
          rdbStarvation++;
          writeData("rabbit", "starvation");

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

      this.moveCounter += 100;
      if (this.moveCounter > 100) {
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
          foxArray = foxArray.filter(fox => fox.id != this.id);
          fdbStarvation++;
          writeData("fox", "starvation");
        }
   

        this.moveCounter = 0;
      }
    } else if (this.animalType === "bear") {
     
      this.moveCounter += 10;
      if (this.pathLength < 10) {
        if (this.currentDirection === "left" && this.col > 0) {
          if (this.moveCounter > 100) {
            this.col--;
            this.pathLength++;
            this.moveCounter = 0;
          }
        } else if (
          this.currentDirection === "right" &&
          this.col < board.maxTiles
        ) {
          if (this.moveCounter > 100) {
            this.col++;
            this.pathLength++;
            this.moveCounter = 0;
          }
        }
      } else {
        this.currentDirection = "right";
        this.pathLength = 0;
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
      const rando = randomNumber(1, 2000);

      if (rando <= 2) {
        mapArray[x][y] = FOX_DEN;
        board.foxDenPositions.push({ xPos: x, yPos: y, taken: false });
      } else if (rando <= 5) {
        mapArray[x][y] = 1;
      } else if (rando <= 20) {
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
      if (board.season > 12000) {
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
function writeData(animal, deathby) {
  if (animal == "rabbit") {
    if (deathby === "starvation") {
      database.ref("rabbits/deaths/starvation").set(rdbStarvation);
    } else if (deathby === "predator") {
      database.ref("rabbits/deaths/predator").set(dbPred);
    } else {
      database.ref("rabbits/deaths/oldAge").set(rdbAge);
    }
  } else if (animal === "fox") {
    if (deathby === "starvation") {
      database.ref("foxes/deaths/starvation").set(fdbStarvation);
    } else {
      database.ref("foxes/deaths/oldAge").set(fdbAge);
    }
    //fox death logic to db
  } else if (animal === "bear") {
    if (deathby === "starvation") {
      database.ref("bears/deaths/starvation").set()
    }
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
$("#audio").on("click", function() {
  if (!muted) {
    $("#audio").attr("src", "speakerMuted.png");
    muted = true;
  } else {
    muted = false;
    $("#audio").attr("src", "speaker.png");
  }
});
$(".icons").on("click", function() {
  let name = $(this).attr("name");
  toolBox = name;
});
canvas.addEventListener(
  "click",
  function(evt) {
    var mousePos = getMousePos(canvas, evt);
   

    if (toolBox === "grass1") {
      mapArray[mousePos.y][mousePos.x] = GRASS_1;
    } else if (toolBox === "grass2") {
      mapArray[mousePos.y][mousePos.x] = GRASS_2;
    } else if (toolBox === "grass3") {
      mapArray[mousePos.y][mousePos.x] = GRASS_3;
    } else if (toolBox === "tree") {
      mapArray[mousePos.y][mousePos.x] = 1;
    } else if (toolBox === "berry") {
      board.foodPositions.push({ xPos: mousePos.y, yPos: mousePos.x });
      mapArray[mousePos.y][mousePos.x] = 3;
    } else if (toolBox === "den") {
      mapArray[mousePos.y][mousePos.x] = FOX_DEN;
    } else if (toolBox === "rabbit") {
      bunnyId++;
      bunniesArray.push(
        new Animal("rabbit", mousePos.x, mousePos.y, bunnyId, "yellow", 20)
      );
    } else if (toolBox === "fox") {
      foxId++;
      foxArray.push(
        new Animal("fox", mousePos.x, mousePos.y, foxId, "yellow", 20, "left")
      );
    }
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
 
 
];

let bearArray = [
  new Animal(
    "bear",
    randomNumber(25, 25),
    randomNumber(25, 25),
    50,
    "yellow",
    20,
    "left"
  )
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
  for (i = 0; i < bearArray.length; i++) {
    bearArray[i].draw();
    bearArray[i].stateManager();
  }
}

createArray();
console.log(mapArray);
let frameCount = 0;

//slider JS
$("#showSliders").on("click", () => {
  if ($("#showSliders").attr("clicked") == "false") {
    console.log("HEY");
    $("#sliders").css("visibility", "visible");
    $("#sliders").animate({ height: "400px" }, 500);
    $("#showSliders").attr("clicked", "true");
  } else {
    $("#sliders").animate({ height: "5px" }, 500, function() {
      $("#sliders").css("visibility", "hidden");
    });
    $("#showSliders").attr("clicked", "false");
  }
});

// let interval = setInterval(mainLoop, sliderVal / speedModifier);

function startGame() {
  window.requestAnimationFrame(mainLoop)
}

// function updateSlider() {
//   clearInterval(interval);
//   let range = $("#range").val();
//   sliderVal = range;
//   interval = setInterval(mainLoop, sliderVal / speedModifier);
// }

function pushTime() {
  time += 6;
  timeStampNum++;
  database.ref(`/timestamps/${timeStampNum}`).set(time);
}
setInterval(pushTime, 360000);


frameCount = 0;
function mainLoop() {
  frameCount+= 1;
  if (frameCount < 1) {
    window.requestAnimationFrame(mainLoop);
    return
  }
  frameCount = 0;
  console.log(bunniesArray);
 
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  initialize();
  // updateSlider();
  board.season += 1;

  if (board.season === 12000) {
    renderBackground();
  }
  window.requestAnimationFrame(mainLoop)
}
