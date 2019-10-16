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
function pushBunny(color) {
  bunnyId++;
  bunniesArray.push(
    new Animal(
      "rabbit",
      randomNumber(1, 99),
      randomNumber(1, 99),
      bunnyId,
      20,
      null,
      color
    )
  );
}

function pushFox(direction) {
  foxId++
  foxArray.push(new Animal("fox", randomNumber(1, 99), randomNumber(1,99), foxId, 20, direction))
}
database.ref("chat/message").on("value", snap => {
  console.log(snap.val());
  switch (snap.val()) {
    case "!bunny-blue":
      pushBunny("blue");
      break;
    case "!bunny-pink":
      pushBunny("pink");
      break;
    case "!bunny-brown":
      pushBunny("brown");
      break;
    case "!bunny-yellow":
      pushBunny("yellow");
      break;
    case "!fox-right":
      pushFox("right");
      break;
    case "!fox-left":
      pushFox("left");
      break;
    
  }
});
let board = {
  maxTiles: 100,
  tileWidth: 18,
  tileHeight: 18,
  foodPositions: [],
  foxDenPositions: [],
  seasonCounter: 0,
  season: "summer"
};
(function($) {
  $.dragScroll = function(options) {
    var settings = $.extend({
      scrollVertical: true,
      scrollHorizontal: true,
      cursor: null
    }, options);

    var clicked = false,
      clickY, clickX;

    var getCursor = function() {
      if (settings.cursor) return settings.cursor;
      if (settings.scrollVertical && settings.scrollHorizontal) return 'move';
      if (settings.scrollVertical) return 'row-resize';
      if (settings.scrollHorizontal) return 'col-resize';
    }

    var updateScrollPos = function(e, el) {
      $('html').css('cursor', getCursor());
      var $el = $(el);
      settings.scrollVertical && $el.scrollTop($el.scrollTop() + (clickY - e.pageY));
      settings.scrollHorizontal && $el.scrollLeft($el.scrollLeft() + (clickX - e.pageX));
    }

    $(document).on({
      'mousemove': function(e) {
        clicked && updateScrollPos(e, this);
      },
      'mousedown': function(e) {
        clicked = true;
        clickY = e.pageY;
        clickX = e.pageX;
      },
      'mouseup': function() {
        clicked = false;
        $('html').css('cursor', 'auto');
      }
    });
  }
}(jQuery))

$.dragScroll();

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
let d3Interval;
let dbPred = 0;
let snappedBunnies = 0;
let maxBunnies = 200;
let timeStampNum = 0;
let time = 0;
let muted = false;
let stop = false;
let speedModifier = 1;
let toolBox;
let sliderVal = $(speedSlider).val() / speedModifier;
let foxId = 25;
let bunnyId = 30;
let bearId = 30;
let mapArray = new Array();
let bunnieCount = 0;
let bunnyImg = new Image();
let yellowBunny = new Image();
let blueBunny = new Image();
let pinkBunny = new Image();
let brownBunny = new Image();
let foxImg = new Image();
let bearImg = new Image();
let grassImg = new Image();
let pop = new Audio("blop.wav");
let d3Index = 0;

grassImg.src = "./game-images/grassTiles.png";
blueBunny.src = "./game-images/blueRabbit.png";
brownBunny.src = "./game-images/brownRabbit.png";
pinkBunny.src = "./game-images/pinkRabbit.png";
yellowBunny.src = "./game-images/yellowRabbit.png";
bunnyImg.src = "./game-images/rabbit.png";
foxImg.src = "./game-images/fox.png";
bearImg.src = "./game-images/bear.png";

let Animal = function(animalType, x, y, id, speedModifier, direction, color) {
  this.animalType = animalType;
  this.id = id;
  this.col = x;
  this.row = y;
  this.speedModifier = speedModifier;

  this.state = "idle";

  this.maxHunger = randomNumber(500, 700);
  this.starvation = randomNumber(600, 800);

  this.currentDirection = direction;
  this.upOrDown = "up";

  this.repath = false;
  this.pathLength = 0;
  this.vert;
  this.horiz;
  this.completedDirections = [];
  this.bearFood = 0;
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

  //Function called every time the mainloop is called

  this.stateManager = function() {
    if (this.animalType === "rabbit" && bunniesArray.length < 12) {
      bunnyId++;
      bunniesArray.push(
        new Animal("rabbit", this.col + 5, this.row - 1, bunnyId, 20)
      );
      bunnyId++;
      bunniesArray.push(
        new Animal("rabbit", this.col + 5, this.row - 1, bunnyId, 20)
      );
    }
    if (bearArray.length === 0 && board.season === "summer") {
      bearArray.push(
        new Animal(
          "bear",
          randomNumber(1, 99),
          randomNumber(1, 99),
          bearId,
          20,
          "right"
        )
      );
    }

    if (
      this.animalType === "bear" &&
      board.season == "summer" &&
      this.state === "den"
    ) {
      console.log("CALLED");
      this.bearFood = 0;
      this.state = "idle";
    }

    if (
      this.animalType === "bear" &&
      board.season === "winter" &&
      this.state === "idle"
    ) {
      this.findDen();
    }

    if (this.animalType === "bear" && this.state === "pathing") {
      this.returnToDen();
    }
    if (this.animalType === "bear" && this.state === "pathing") {
      this.returnToDen();
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
      this.preyEaten < 15
    ) {
      this.preyBunnies();
    }
    if (this.state === "idle" && this.animalType === "bear") {
      this.preyBunnies();
      this.bearBerries();
    }
    if (this.state === "eating" && this.animalType === "bear") {
      this.bearEat();
    }

    if (this.state === "hungry" && board.foodPositions.length > 0) {
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
          if (this.babyTime > 200 && bunniesArray[i].babyTime > 200) {
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
      if (bunniesArray.length < maxBunnies) {
        writeData("rabbit", null, true);
        bunnyId++;
        if (!muted) {
          pop.play();
        }
        bunniesArray.push(
          new Animal("rabbit", this.col + 5, this.row, bunnyId, 20, null, color)
        );
      }
    } else if (this.animalType === "fox") {
      this.denCounter++;
      if (this.denCounter > 100) {
        let dir = randomNumber(1, 2);
        if (foxArray.length < 25) {
          foxId++;
          if (dir === 1) {
            foxArray.push(
              new Animal("fox", this.col + 2, this.row + 1, foxId, 20, "left")
            );
          } else {
            foxArray.push(
              new Animal("fox", this.col + 2, this.row + 1, foxId, 20, "right")
            );
          }
          writeData("fox", null, true);
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
      switch (color) {
        case "yellow":
          draw("image", yellowBunny, this.col, this.row);
          break;
        case "pink":
          draw("image", pinkBunny, this.col, this.row);
          break;
        case "brown":
          draw("image", brownBunny, this.col, this.row);
          break;
        case "blue":
          draw("image", blueBunny, this.col, this.row);
          break;
        default:
          draw("image", bunnyImg, this.col, this.row);
          break;
      }
    } else if (this.animalType === "fox" && this.state != "den") {
      draw("image", foxImg, this.col, this.row);
    } else if (this.animalType === "bear" && this.state != "den") {
      draw("image", bearImg, this.col, this.row, null, null, null, true);
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

    this.moveCounter += 100;

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
        if (this.animalType === "bear" && this.bearFood < 10) {
          bearArray = [];
          bearId++;
          bdbStarvation++;
          writeData("bear", "starvation");
        }
        this.state = "den";
      } else {
        if (this.animalType === "fox") {
          this.state = "tired";
        } else if (this.animalType === "bear") {
          this.state = "idle";
        }
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
      writeData("rabbit", null, true);
    }
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
        this.bearFood++;

        bunniesArray[i].state = "dead";

        bunniesArray = bunniesArray.filter(
          bunny => bunny.id !== bunniesArray[i].id
        );
        dbPred++;
        writeData("rabbit", "predator");
        writeData("rabbit", null, true);

        if (this.preyEaten === 5 && this.animalType === "fox") {
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
    if (this.timeAlive > randomNumber(1000, 1100)) {
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
  this.bearEat = function() {
    board.foodPositions.splice(this.foodToSplice, 1);
    mapArray[this.closestFood.y][this.closestFood.x] = 0;
    renderBackground();
    this.bearFood++;
    this.eating = 0;
    this.state = "idle";
  };
  this.bearBerries = function() {
    for (let i = 0; i < board.foodPositions.length; i++) {
      if (
        (board.foodPositions[i].yPos === this.col + 2 &&
          board.foodPositions[i].xPos === this.row) ||
        (board.foodPositions[i].yPos === this.col - 1 &&
          board.foodPositions[i].xPos === this.row) ||
        (board.foodPositions[i].xPos === this.row + 2 &&
          board.foodPositions[i].yPos === this.col) ||
        (board.foodPositions[i].xPos === this.row - 1 &&
          board.foodPositions[i].yPos === this.col)
      ) {
        this.state = "eating";
        this.closestFood.x = board.foodPositions[i].yPos;
        this.closestFood.y = board.foodPositions[i].xPos;
        this.foodToSplice = i;
      }
    }
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
        if (this.timeAlive > randomNumber(1000, 1100)) {
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
      this.timeAlive++;
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
        } else if (this.timeAlive > 2000) {
          foxArray = foxArray.filter(fox => fox.id != this.id);
          fdbAge++;
          writeData("fox", "age");
        }

        this.moveCounter = 0;
      }
    } else if (this.animalType === "bear") {
      console.log(this.timeAlive);
      let possibleJumps = [];

      if (this.repath) {
        this.pathLength = 0;

        if (this.col + 9 < board.maxTiles && this.currentDirection != "right") {
          possibleJumps.push("right");
        }
        if (this.col - 9 > 0 && this.currentDirection != "left") {
          possibleJumps.push("left");
        }
        if (this.row + 9 < board.maxTiles && this.currentDirection != "down") {
          possibleJumps.push("down");
        }
        if (this.row - 9 > 0 && this.currentDirection != "up") {
          possibleJumps.push("up");
        }

        this.currentDirection =
          possibleJumps[Math.floor(Math.random() * possibleJumps.length)];

        this.repath = false;
      } else if (!this.repath) {
        this.timeAlive++;
        this.moveCounter += 100;
        if (this.moveCounter > 100) {
          switch (this.currentDirection) {
            case "left":
              this.col--;
              break;
            case "right":
              this.col++;
              break;
            case "up":
              this.row--;
              break;
            case "down":
              this.row++;
              break;
          }
          this.pathLength++;
          this.moveCounter = 0;
          if (this.pathLength > 9) {
            this.completedDirections.push(this.currentDirection);
            this.repath = true;
          }
        }
        if (this.timeAlive > 1000) {
          bearArray = [];
          bearId++;
          bdbAge++;
          writeData("bear", "age");
          bearArray.push(
            new Animal(
              "bear",
              randomNumber(1, 99),
              randomNumber(1, 99),
              bearId,
              20,
              "right"
            )
          );
        }
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
function draw(type, img = null, x, y, color, tile, row, bear) {
  if (type == "rect") {
    backGroundCtx.fillStyle = color;
    backGroundCtx.fillRect(
      x * board.tileWidth,
      y * board.tileHeight,
      board.tileWidth,
      board.tileHeight
    );
  } else if (type === "image") {
    if (!bear) {
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
    } else if (bear) {
      ctx.drawImage(
        img,
        0,
        0,
        16,
        16,
        x * board.tileWidth,
        y * board.tileHeight,
        32,
        32
      );
    }
  } else if (type === "imageBack") {
    let tiles = [0, 16, 32];
    if (!bear)
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

      if (rando <= 2 && x > 0 && x < 99) {
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
      if (board.season === "winter") {
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
function writeData(animal, deathby, pop) {
  if (animal == "rabbit") {
    if (deathby === "starvation") {
      database.ref("rabbits/deaths/starvation").set(rdbStarvation);
    } else if (deathby === "predator") {
      database.ref("rabbits/deaths/predator").set(dbPred);
    } else if (pop) {
      database.ref("rabbits/population/size").set(bunniesArray.length);
    } else {
      database.ref("rabbits/deaths/oldAge").set(rdbAge);
    }
  } else if (animal === "fox") {
    if (deathby === "starvation") {
      database.ref("foxes/deaths/starvation").set(fdbStarvation);
    } else if (pop) {
      database.ref("foxes/population/size").set(foxArray.length);
    } else {
      database.ref("foxes/deaths/oldAge").set(fdbAge);
    }
    //fox death logic to db
  } else if (animal === "bear") {
    if (deathby === "starvation") {
      database.ref("bears/deaths/starvation").set(bdbStarvation);
    } else if (deathby == "age") {
      database.ref("bears/death/age").set(bdbAge);
    } else if (pop) {
      database.ref("bears/population/size").set(1);
    }
  }
}

function addFood() {
  if (board.foodPositions.length < 50) {
    let x = randomNumber(1, board.maxTiles);
    let y = randomNumber(1, board.maxTiles);
    if (mapArray[x][y] === 0) {
      mapArray[x][y] = 3;
      board.foodPositions.push({ xPos: y, yPos: x, taken: false, uses: 5 });
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
    $("#audio").attr("src", "./ui-images/speakerMuted.png");
    muted = true;
  } else {
    muted = false;
    $("#audio").attr("src", "./ui-images/speaker.png");
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
    console.log(toolBox);

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
        new Animal("rabbit", mousePos.x, mousePos.y, bunnyId, 20)
      );
    } else if (toolBox === "fox") {
      foxId++;
      foxArray.push(
        new Animal("fox", mousePos.x, mousePos.y, foxId, 20, "left")
      );
    } else if (toolBox === "bear") {
      bearId++;
      bearArray.push(
        new Animal("bear", mousePos.x, mousePos.y, bearId, 20, "right")
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
  new Animal("rabbit", randomNumber(5, 25), (10, 15), 1, 20, null),
  new Animal("rabbit", randomNumber(5, 25), (10, 15), 2, 20, null),
  new Animal("rabbit", randomNumber(5, 25), (10, 15), 3, 20, null),
  new Animal("rabbit", randomNumber(5, 25), (10, 15), 1, 20, null),
  new Animal("rabbit", randomNumber(5, 25), (10, 15), 2, 20, null),
  new Animal("rabbit", randomNumber(5, 25), (10, 15), 3, 20, null),
  new Animal("rabbit", randomNumber(40, 35), (45, 55), 4, 20, null),
  new Animal("rabbit", randomNumber(25, 55), (35, 65), 5, 20, null),
  new Animal("rabbit", randomNumber(80, 90), (70, 99), 6, 20, null),
  new Animal("rabbit", randomNumber(65, 99), (50, 99), 7, 20, null),
  new Animal("rabbit", randomNumber(77, 22), (45, 75), 8, 20, null),
  new Animal("rabbit", randomNumber(70, 85), (10, 15), 9, 20, null),
  new Animal("rabbit", randomNumber(70, 85), (10, 15), 10, 20, null),
  new Animal("rabbit", randomNumber(70, 85), (10, 15), 11, 20, null),
  new Animal("rabbit", randomNumber(70, 90), (10, 15), 12, 20, null)
];
let foxArray = [
  new Animal("fox", randomNumber(5, 10), (20, 35), 1, 20, "right"),
  new Animal("fox", randomNumber(95, 99), (70, 85), 1, 20, "left"),
  new Animal("fox", randomNumber(10, 15), (90, 99), 1, 20, "right")
];

let bearArray = [
  new Animal("bear", randomNumber(50, 50), randomNumber(50, 50), 1, 20, "left")
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
    $("#sliders").animate({ height: "600px" }, 500);
    $("#showSliders").attr("clicked", "true");
  } else {
    $("#sliders").animate({ height: "5px" }, 500, function() {
      $("#sliders").css("visibility", "hidden");
    });
    $("#showSliders").attr("clicked", "false");
  }
});
$("#playBtn").on("click", () => {
  $(".splashScreen").fadeOut("slow", () => {
    renderBackground();

    $(".gameWrapper").fadeIn("slow", () => {
      d3Interval = setInterval(newD3, 30000);
      startGame();
      writeData("rabbit", null, true);
      writeData("bear", null, true);
      writeData("fox", null, true);
      writeData("fox", "starvation");
      writeData("bear", "starvation");
      writeData("bear", "age");
      writeData("rabbit", "age");
      writeData("rabbit", "starvation");
      writeData("rabbit", "predator");
    });
  });
});
$("#chaos").on("click", () => {
  maxBunnies = 5000;
});
$("#endSim").on("click", () => {
  stop = true;
  clearInterval(d3Interval);
  $(".gameWrapper").fadeOut("slow", () => {
    dashboard("#dashboard", popData);
    dashboard("#dbStarvation", deathStarvation);
    dashboard("#dbAge", deathAge);
    dashboard("#dbPred", deathPred);
    d3.selectAll("text").attr("fill", "white");
    $(".d3Wrapper").fadeIn("slow");
  });
});
$("#view").on("click", () => {
  if ($("#view").text() === "Global View") {
    $("#view").text("Local View") 
    board.tileWidth = 16;
    board.tileHeight =16;
    renderBackground();
  } else {
    $("#view").text("Global View")
    board.tileWidth = 32;
    board.tileHeight = 32;
    renderBackground();
  }

  
});
// let interval = setInterval(mainLoop, sliderVal / speedModifier);

function startGame() {
  window.requestAnimationFrame(mainLoop);
}

function updateSlider() {
  let range = $("#range").val();
  sliderVal = range;
}

function newD3() {
  console.log(d3Index);
  if (d3Index < 11) {
    d3Index++;
    popData[d3Index].freq.rabbit = bunniesArray.length;
    popData[d3Index].freq.fox = foxArray.length;
    popData[d3Index].freq.bear = bearArray.length;

    deathStarvation[d3Index].freq.rabbit = rdbStarvation;
    deathStarvation[d3Index].freq.fox = fdbStarvation;
    deathStarvation[d3Index].freq.bear = bdbStarvation;

    deathAge[d3Index].freq.rabbit = rdbAge;
    deathAge[d3Index].freq.fox = fdbAge;
    deathAge[d3Index].freq.bear = bdbAge;

    deathPred[d3Index].freq.rabbit = dbPred;
  }
}

frameCount = 0;
function mainLoop() {
  frameCount += 1;
  if (frameCount < sliderVal) {
    window.requestAnimationFrame(mainLoop);
    return;
  }
  frameCount = 0;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  initialize();
  updateSlider();
  // updateSlider();
  board.seasonCounter += 1;
  if (foxArray.length < 3) {
    foxId++;
    foxArray.push(
      new Animal(
        "fox",
        randomNumber(1, 99),
        randomNumber(1, 99),
        foxId,
        20,
        "right"
      )
    );
  }

  if (board.seasonCounter % 800 === 0) {
    board.season = "winter";

    renderBackground();
  }
  if (board.seasonCounter % 1600 === 0) {
    board.season = "summer";
    renderBackground();
  }
  if (!stop) {
    window.requestAnimationFrame(mainLoop);
  }
}

function dashboard(id, fData) {
  var barColor = "steelblue";
  function segColor(c) {
    return { bear: "#8b6f5c", fox: "#ffaa00", rabbit: "#faa37d" }[c];
  }

  // compute total for each animal.
  fData.forEach(function(d) {
    d.total = d.freq.bear + d.freq.fox + d.freq.rabbit;
  });

  // function to handle histogram.
  function histoGram(fD) {
    var hG = {},
      hGDim = { t: 60, r: 0, b: 30, l: 0 };
    (hGDim.w = 500 - hGDim.l - hGDim.r), (hGDim.h = 300 - hGDim.t - hGDim.b);

    //create svg for histogram.
    var hGsvg = d3
      .select(id)
      .append("svg")
      .attr("width", hGDim.w + hGDim.l + hGDim.r)
      .attr("height", hGDim.h + hGDim.t + hGDim.b)
      .append("g")
      .attr("transform", "translate(" + hGDim.l + "," + hGDim.t + ")");

    // create function for x-axis mapping.
    var x = d3.scale
      .ordinal()
      .rangeRoundBands([0, hGDim.w], 0.1)
      .domain(
        fD.map(function(d) {
          return d[0];
        })
      );

    // Add x-axis to the histogram svg.
    hGsvg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + hGDim.h + ")")
      .call(
        d3.svg
          .axis()
          .scale(x)
          .orient("bottom")
      );

    // Create function for y-axis map.
    var y = d3.scale
      .linear()
      .range([hGDim.h, 0])
      .domain([
        0,
        d3.max(fD, function(d) {
          return d[1];
        })
      ]);

    // Create bars for histogram to contain rectangles and freq labels.
    var bars = hGsvg
      .selectAll(".bar")
      .data(fD)
      .enter()
      .append("g")
      .attr("class", "bar");

    //create the rectangles.
    bars
      .append("rect")
      .attr("x", function(d) {
        return x(d[0]);
      })
      .attr("y", function(d) {
        return y(d[1]);
      })
      .attr("width", x.rangeBand())
      .attr("height", function(d) {
        return hGDim.h - y(d[1]);
      })
      .attr("fill", barColor)
      .on("mouseover", mouseover) // mouseover is defined below.
      .on("mouseout", mouseout); // mouseout is defined below.

    //Create the frequency labels above the rectangles.
    bars
      .append("text")
      .text(function(d) {
        return d3.format(",")(d[1]);
      })
      .attr("x", function(d) {
        return x(d[0]) + x.rangeBand() / 2;
      })
      .attr("y", function(d) {
        return y(d[1]) - 5;
      })
      .attr("text-anchor", "middle");

    function mouseover(d) {
      // utility function to be called on mouseover.
      // filter for selected state.
      var st = fData.filter(function(s) {
          return s.State == d[0];
        })[0],
        nD = d3.keys(st.freq).map(function(s) {
          return { type: s, freq: st.freq[s] };
        });

      // call update functions of pie-chart and legend.
      pC.update(nD);
      leg.update(nD);
    }

    function mouseout(d) {
      // utility function to be called on mouseout.
      // reset the pie-chart and legend.
      pC.update(tF);
      leg.update(tF);
    }

    // create function to update the bars. This will be used by pie-chart.
    hG.update = function(nD, color) {
      // update the domain of the y-axis map to reflect change in frequencies.
      y.domain([
        0,
        d3.max(nD, function(d) {
          return d[1];
        })
      ]);

      // Attach the new data to the bars.
      var bars = hGsvg.selectAll(".bar").data(nD);

      // transition the height and color of rectangles.
      bars
        .select("rect")
        .transition()
        .duration(500)
        .attr("y", function(d) {
          return y(d[1]);
        })
        .attr("height", function(d) {
          return hGDim.h - y(d[1]);
        })
        .attr("fill", color);

      // transition the frequency labels location and change value.
      bars
        .select("text")
        .transition()
        .duration(500)
        .text(function(d) {
          return d3.format(",")(d[1]);
        })
        .attr("y", function(d) {
          return y(d[1]) - 5;
        });
    };
    return hG;
  }

  // function to handle pieChart.
  function pieChart(pD) {
    var pC = {},
      pieDim = { w: 250, h: 250 };
    pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;

    // create svg for pie chart.
    var piesvg = d3
      .select(id)
      .append("svg")
      .attr("width", pieDim.w)
      .attr("height", pieDim.h)
      .append("g")
      .attr(
        "transform",
        "translate(" + pieDim.w / 2 + "," + pieDim.h / 2 + ")"
      );

    // create function to draw the arcs of the pie slices.
    var arc = d3.svg
      .arc()
      .outerRadius(pieDim.r - 10)
      .innerRadius(0);

    // create a function to compute the pie slice angles.
    var pie = d3.layout
      .pie()
      .sort(null)
      .value(function(d) {
        return d.freq;
      });

    // Draw the pie slices.
    piesvg
      .selectAll("path")
      .data(pie(pD))
      .enter()
      .append("path")
      .attr("d", arc)
      .each(function(d) {
        this._current = d;
      })
      .style("fill", function(d) {
        return segColor(d.data.type);
      })
      .on("mouseover", mouseover)
      .on("mouseout", mouseout);

    // create function to update pie-chart. This will be used by histogram.
    pC.update = function(nD) {
      piesvg
        .selectAll("path")
        .data(pie(nD))
        .transition()
        .duration(500)
        .attrTween("d", arcTween);
    };
    // Utility function to be called on mouseover a pie slice.
    function mouseover(d) {
      // call the update function of histogram with new data.
      hG.update(
        fData.map(function(v) {
          return [v.State, v.freq[d.data.type]];
        }),
        segColor(d.data.type)
      );
    }
    //Utility function to be called on mouseout a pie slice.
    function mouseout(d) {
      // call the update function of histogram with all data.
      hG.update(
        fData.map(function(v) {
          return [v.State, v.total];
        }),
        barColor
      );
    }
    // Animating the pie-slice requiring a custom function which specifies
    // how the intermediate paths should be drawn.
    function arcTween(a) {
      var i = d3.interpolate(this._current, a);
      this._current = i(0);
      return function(t) {
        return arc(i(t));
      };
    }
    return pC;
  }

  // function to handle legend.
  function legend(lD) {
    var leg = {};

    // create table for legend.
    var legend = d3
      .select(id)
      .append("table")
      .attr("class", "legend");

    // create one row per segment.
    var tr = legend
      .append("tbody")
      .selectAll("tr")
      .data(lD)
      .enter()
      .append("tr");

    // create the first column for each segment.
    tr.append("td")
      .append("svg")
      .attr("width", "16")
      .attr("height", "16")
      .append("rect")
      .attr("width", "16")
      .attr("height", "16")
      .attr("fill", function(d) {
        return segColor(d.type);
      });

    // create the second column for each segment.
    tr.append("td").text(function(d) {
      return d.type;
    });

    // create the third column for each segment.
    tr.append("td")
      .attr("class", "legendFreq")
      .text(function(d) {
        return d3.format(",")(d.freq);
      });

    // create the fourth column for each segment.
    tr.append("td")
      .attr("class", "legendPerc")
      .text(function(d) {
        return getLegend(d, lD);
      });

    // Utility function to be used to update the legend.
    leg.update = function(nD) {
      // update the data attached to the row elements.
      var l = legend
        .select("tbody")
        .selectAll("tr")
        .data(nD);

      // update the frequencies.
      l.select(".legendFreq").text(function(d) {
        return d3.format(",")(d.freq);
      });

      // update the percentage column.
      l.select(".legendPerc").text(function(d) {
        return getLegend(d, nD);
      });
    };

    function getLegend(d, aD) {
      // Utility function to compute percentage.
      return d3.format("%")(
        d.freq /
          d3.sum(
            aD.map(function(v) {
              return v.freq;
            })
          )
      );
    }

    return leg;
  }

  // calculate total frequency by segment for all state.
  var tF = ["bear", "fox", "rabbit"].map(function(d) {
    return {
      type: d,
      freq: d3.sum(
        fData.map(function(t) {
          return t.freq[d];
        })
      )
    };
  });

  // calculate total frequency by state for all segment.
  var sF = fData.map(function(d) {
    return [d.State, d.total];
  });

  var hG = histoGram(sF), // create the histogram.
    pC = pieChart(tF), // create the pie-chart.
    leg = legend(tF); // create the legend.
}

let popData = [
  { State: "00:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "01:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "02:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "03:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "04:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "05:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "06:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "07:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "08:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "09:00", freq: { bear: 0, fox: 0, rabbit: 0 } }
];
let deathStarvation = [
  { State: "00:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "01:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "02:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "03:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "04:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "05:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "06:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "07:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "08:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "09:00", freq: { bear: 0, fox: 0, rabbit: 0 } }
];
let deathAge = [
  { State: "00:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "01:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "02:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "03:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "04:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "05:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "06:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "07:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "08:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "09:00", freq: { bear: 0, fox: 0, rabbit: 0 } }
];
let deathPred = [
  { State: "00:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "01:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "02:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "03:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "04:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "05:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "06:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "07:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "08:00", freq: { bear: 0, fox: 0, rabbit: 0 } },
  { State: "09:00", freq: { bear: 0, fox: 0, rabbit: 0 } }
];

popData[d3Index].freq.rabbit = bunniesArray.length;
popData[d3Index].freq.fox = foxArray.length;
popData[d3Index].freq.bear = bearArray.length;

deathStarvation[d3Index].freq.rabbit = rdbStarvation;
deathStarvation[d3Index].freq.fox = fdbStarvation;
deathStarvation[d3Index].freq.bear = bdbStarvation;

deathAge[d3Index].freq.rabbit = rdbAge;
deathAge[d3Index].freq.fox = fdbAge;
deathAge[d3Index].freq.bear = bdbAge;

deathPred[d3Index].freq.rabbit = dbPred;
