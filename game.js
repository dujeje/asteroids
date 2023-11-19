// Global variables for the game
var myGamePiece;
var asteroids = [];
var startTime;
var bestTime = localStorage.getItem("bestTime") || Infinity;
var gameOverTimeout;

// Function to start the game
function startGame() {
    resetTimer();

    // Creating a container for the game
    var gameContainer = document.createElement("div");
    gameContainer.id = "gameContainer";
    document.body.appendChild(gameContainer);

    // Creating the player's game piece
    myGamePiece = new component(30, 30, "red", window.innerWidth / 2, window.innerHeight / 2);
    myGameArea.start();
    gameContainer.appendChild(myGameArea.canvas);
    gameContainer.appendChild(document.getElementById("timer"));
    gameContainer.appendChild(document.getElementById("bestTime"));

    // Event listeners for keyboard controls
    window.addEventListener('keydown', function (e) {
        myGameArea.keys = myGameArea.keys || [];
        myGameArea.keys[e.key] = true;
    });
    window.addEventListener('keyup', function (e) {
        myGameArea.keys[e.key] = false;
    });

    // Move the asteroid spawning inside the startGame function
    spawnAsteroids();
    updateBestTime();
}

// Game area object
var myGameArea = {
    canvas: document.createElement("canvas"),
    start: function () {
        this.canvas.id = "myGameCanvas";
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.context = this.canvas.getContext("2d");
        var gameContainer = document.getElementById("gameContainer");
        gameContainer.appendChild(this.canvas);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
        this.canvas.style.border = "1px solid #000000"; // Visible border
        this.canvas.style.backgroundColor = "#000000";
        this.keys = [];
    },
    stop: function () {
        clearInterval(this.interval);
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Component constructor for game elements
function component(width, height, color, x, y, speed_x, speed_y) {
    this.width = width;
    this.height = height;
    this.speed_x = speed_x || 0;
    this.speed_y = speed_y || 0;
    this.x = x;
    this.y = y;

    // Method to update the component
    this.update = function () {
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = "rgba(169, 169, 169, 0.6)";
        ctx.fillRect(this.width / -2 - 2, this.height / -2 - 2, this.width + 4, this.height + 4);
        ctx.fillStyle = color;
        ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height);
        ctx.restore();
    }

    // Method to update the position of the component
    this.newPos = function () {
        this.x += this.speed_x;
        this.y += this.speed_y;

        if (this.x - this.width / 2 > myGameArea.canvas.width) {
            this.x = -this.width / 2;
        } else if (this.x + this.width / 2 < 0) {
            this.x = myGameArea.canvas.width + this.width / 2;
        }
        if (this.y - this.height / 2 > myGameArea.canvas.height) {
            this.y = -this.height / 2;
        } else if (this.y + this.height / 2 < 0) {
            this.y = myGameArea.canvas.height + this.height / 2;
        }
    }

    // Method to update the position based on keyboard input
    this.updatePosition = function () {
        if (myGameArea.keys && myGameArea.keys['ArrowLeft']) { this.speed_x = -1; }
        if (myGameArea.keys && myGameArea.keys['ArrowRight']) { this.speed_x = 1; }
        if (myGameArea.keys && myGameArea.keys['ArrowUp']) { this.speed_y = -1; }
        if (myGameArea.keys && myGameArea.keys['ArrowDown']) { this.speed_y = 1; }

        this.x += this.speed_x;
        this.y += this.speed_y;

        // Reset the speed after updating position
        this.speed_x = 0;
        this.speed_y = 0;
    }
}

// Function to update the game area
function updateGameArea() {
    myGameArea.clear();
    myGamePiece.updatePosition();
    myGamePiece.newPos();
    myGamePiece.update();
    updateAsteroids();
    updateTimer();

    // Ensure the game continues by updating the frame number
    myGameArea.frameNo += 1;
}

// Function to update asteroids
function updateAsteroids() {
    for (var i = 0; i < asteroids.length; i++) {
        asteroids[i].newPos();
        asteroids[i].update();

        //Check for collision with the player's game piece
        if (checkCollision(myGamePiece, asteroids[i])) {
            myGameArea.stop();
            var collisionTime = new Date().getTime() - startTime;
            setTimeout(function () {
                alert("Game Over!");
                endGame(collisionTime);
            }, 0);
            break;
        }
    }
    // Generate new asteroids if the frame number is a multiple of a certain value
    if (myGameArea.frameNo % 120 === 0) {
        spawnAsteroids();
    }
}

// Function to check collision between two components
function checkCollision(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
    );
}

// Function to update the timer
function updateTimer() {
    var currentTime = new Date().getTime() - startTime;
    var timerElement = document.getElementById("timer");
    if (timerElement) {
        timerElement.innerText = "Current Time: " + formatTime(currentTime);
        localStorage.setItem("currentTime", currentTime);
    }
}

// Function to reset the timer
function resetTimer() {
    startTime = new Date().getTime();
}

// Function to update the displayed best time
function updateBestTime() {
    var bestTimeElement = document.getElementById("bestTime");
    if (bestTimeElement) {
        var displayedBestTime = bestTime === Infinity ? "N/A" : formatTime(bestTime);
        bestTimeElement.innerHTML = "Best Time: " + displayedBestTime;
    }
}

// Function to format time in minutes and seconds
function formatTime(time) {
    var minutes = Math.floor(time / 60000);
    var seconds = ((time % 60000) / 1000).toFixed(3);
    return `${minutes}:${(seconds < 10 ? '0' : '')}${seconds}`;
}

// Function to handle the end of the game
function endGame(collisionTime) {
    var currentTime = localStorage.getItem("currentTime");
    if (!currentTime) {
        return;
    }
    currentTime -= startTime;
    if (collisionTime > bestTime) {
        bestTime = collisionTime;
        localStorage.setItem("bestTime", bestTime);
        updateBestTime();
        alert("New Best Time!");
    }
    localStorage.removeItem("currentTime");
    resetTimer();
    showGameOver();
    updateTimer();

}

// Function to display the game over message and restart button
function showGameOver() {
    var gameOverContainer = document.createElement("div");
    gameOverContainer.id = "gameOverContainer";
    gameOverContainer.style.position = "absolute";
    gameOverContainer.style.top = "50%";
    gameOverContainer.style.left = "50%";
    gameOverContainer.style.transform = "translate(-50%, -50%)";
    gameOverContainer.style.textAlign = "center";

    var gameOverMessage = document.createElement("div");
    gameOverMessage.innerText = "Game Over!";
    gameOverMessage.style.marginBottom = "10px";

    var restartButton = document.createElement("button");
    restartButton.innerText = "Restart Game";
    restartButton.addEventListener('click', function () {
        restartGame();
    });
    gameOverContainer.appendChild(gameOverMessage);
    gameOverContainer.append(restartButton);
    document.body.appendChild(gameOverContainer);
}

// Function to restart the game
function restartGame() {
    var gameOverContainer = document.getElementById("gameOverContainer");
    if (gameOverContainer) {
        document.body.removeChild(gameOverContainer);
    }

    var gameContainer = document.getElementById("gameContainer");
    while (gameContainer.firstChild) {
        gameContainer.removeChild(gameContainer.firstChild);
    }

    asteroids = [];
    startTime = new Date().getTime();
    startGame();
}

// Function for generating asteroids
function spawnAsteroids() {
    for (var i = 0; i < 5; i++) {
        var asteroid = new component(
            40,
            30,
            "gray",
            getRandomXOutsideCanvas(),
            getRandomYOutsideCanvas(),
            Math.random() * 2 - 1,
            Math.random() * 2 - 1
        );
        asteroids.push(asteroid);
    }
}

// Function to get a random X coordinate outside the canvas
function getRandomXOutsideCanvas() {
    var canvasWidth = myGameArea.canvas.width;
    var randomX = Math.random() * (2 * canvasWidth) - canvasWidth;
    if (randomX < 0) {
        return randomX - 20;
    } else {
        return randomX + canvasWidth + 20;
    }
}

// Function to get a random Y coordinate outside the canvas
function getRandomYOutsideCanvas() {
    var canvasHeight = myGameArea.canvas.height;
    var randomY = Math.random() * (2 * canvasHeight) - canvasHeight;
    if (randomY < 0) {
        return randomY - 20;
    } else {
        return randomY + canvasHeight + 20;
    }
}
