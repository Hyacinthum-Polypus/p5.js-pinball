//DEBUG VARIABLES
const DEVELOPER_MODE = false;
let clickedMousePositionX;
let clickedMousePositionY;
let clicked = false;
let selectedShapeType = 0;


//GAME VARIABLES
let score = 0;
let lives = 3;
let gravity = true;
let isPaused = false;
let isGameOver = false;
let friction = 0.8;

//Door the prevents the pinball from re-entering the startig area.
let exitDoor = {
    positionX : 1900,
    positionY : 500,
    width : 50,
    height : 10,
    isExitClosed : false
}

//This object launches the pinball out of the starting area.
let pump = {
    positionX : 1900,
    positionY : 2000,
    width : 50,
    height : -50,
    force : 0,
    keyPressed : false,
    isEnabled : false
};

//ball qualities
let ball = {
    positionX : 1925,
    positionY : 1600,
    size : 25,
    velocityX : 0,
    velocityY : 0,
    terminalVelocity: 50,
    currentDirection: 'x'
};


//Shared paddle qualities
const PADDLE_LENGTH = 275;
const PADDLE_SPEED = 8;
const PADDLE_FORCE = 50;

class paddle
{
    constructor(positionX, positionY, angle, minimumAngle, maximumAngle)
    {
        this.positionX = positionX;
        this.positionY = positionY;
        //This variable uses degrees.
        this.angle = angle;
        this.minimumAngle = minimumAngle;
        this.maximumAngle = maximumAngle;
        this.length = PADDLE_LENGTH;
        this.keyPressed = false;
    }
};


let leftPaddle = new paddle(660, 1765, 15, -35, 30);
let rightPaddle = new paddle(1360, 1765, 165, 150, 215);

let shapeTypes = ['SQUARE', 'TRIANGLE', 'CIRCLE', 'SCOREBALL', 'BOUNCER'];

class entity 
{
    constructor(positionX, positionY, width, height, type)
    {
        this.positionX = positionX;
        this.positionY = positionY;
        this.width = width;
        this.height = height;
        this.type = type;
        this.flash = 0;
    }    
};

let entities = [new entity(1350, 500, 50, 1450, 'SQUARE'),
                new entity(0, 0, 50, 2000, 'SQUARE'),
                new entity(0, 1950, 500, 50, 'SQUARE'),
                new entity(1000, 1950, 400, 50, 'SQUARE'),
                new entity(1450, 0, 50, 2000, 'SQUARE'),
                new entity(0, 0, 1450, 50, 'SQUARE')];

function preload()
{
    entities = loadJSON('data/pinballEntities.json');
}

function setup()
{
    createCanvas(3000, 2000);
    //Set ellipse mode to radius so radius is used for both drawing the shape
    //and checking the collision of the pinball.
    ellipseMode(RADIUS);
    //Disable stroke. Only the paddles need to use the stroke, so it will diabled and enable there.
    noStroke();
    strokeWeight(10);
    entities = entities[0];
}

function draw()
{   
    //Update everything!!!
    //(if the game isn't paused.)
    if(!isPaused)
    {
        updatePaddles();

        updateBall();

        updatePump();

        checkFail();
    }
    
    //Draw everything!!
    //Reset canvas.
    background('black');
    
    drawBall();
    
    drawPaddles();

    drawEntities();

    drawPump();

    drawExitDoor();

    drawUI();

    if(DEVELOPER_MODE)
    drawShapePreview();
}

//!!!!!!!!!!!!!!!
//DRAW FUNCTIONS
//!!!!!!!!!!!!!!!

//Prevents pinball from going back into the starting area.
function drawExitDoor()
{
    fill('red');
    //Only draw the exit door when the pinball exits the starting area.
    if(exitDoor.isExitClosed)
    {
        rect(exitDoor.positionX, exitDoor.positionY, exitDoor.width, exitDoor.height);
    }
}

function drawPump()
{
    fill('#aaa9ad');
    rect(pump.positionX, pump.positionY, pump.width, pump.height);
}

function drawBall()
{
    fill('silver');
    ellipse(ball.positionX, ball.positionY, ball.size);
}

function drawPaddles()
{
    //Set stroke to a silver colour.
    stroke('#aaa9ad');
    angleMode(DEGREES);

    //Draw left paddle.
    line(leftPaddle.positionX, leftPaddle.positionY, calculatePaddleEndPointX(leftPaddle), calculatePaddleEndPointY(leftPaddle));

    //Draw right paddle.
    line(rightPaddle.positionX, rightPaddle.positionY, calculatePaddleEndPointX(rightPaddle), calculatePaddleEndPointY(rightPaddle));

    noStroke();
    angleMode(RADIUS);
}

function drawEntities()
{
    //Draws entites with a brown colour.
    
    for (let i = 0; i < entities.length; i++) {
        const element = entities[i];
        switch(element.type)
        {
            case 'BOUNCER':
                fill('red');
                rect(element.positionX, element.positionY, element.width, element.height);
            break;
            case 'SQUARE':
                fill('#964B00');
                rect(element.positionX, element.positionY, element.width, element.height)
            break;
            case 'TRIANGLE':
                fill('#964B00');
                triangle(element.positionX, element.positionY,
                    element.positionX + element.width, element.positionY + element.height,
                    element.positionX, element.positionY + element.height);
            break;
            case 'CIRCLE':
                fill('#964B00');
                circle(element.positionX, element.positionY, element.width);
            break;
            case 'SCOREBALL':
                switch(element.flash)
                {
                    case 0:
                        fill('blue');
                    break;
                    case 1:
                        fill('green');
                        element.flash++
                    break;
                    case 2:
                        fill('yellow');
                        element.flash++
                    break;
                    case 3:
                        fill('blue');
                        element.flash++
                    break;
                    case 4:
                        fill('green');
                        element.flash++
                    break;
                    case 5:
                        fill('yellow');
                        element.flash = 0;
                    break;
                }             

                circle(element.positionX, element.positionY, element.width);
        }
    }
}

//Function dedicated for drawing text to the screen.
function drawUI()
{
    textAlign(LEFT, TOP);
    fill('white');
    textSize(50);
    text('Controls:\nPause Game - p\nLeft Paddle - z\nRight Paddle - .\nPump - Space\n\n\nScore: ' + score + 
        "\n\nLives: ", 2000, 0);
    fill('silver');
    switch(lives)
    {
        case 3:
            circle(2292, 580, 20);
        case 2:
            circle(2242, 580, 20);
        case 1:
            circle(2192, 580, 20);
        break;
    }

    
    //DEBUG UI
    if(DEVELOPER_MODE)
    {
        text('Developer mode enabled.\nSelected shape: ' + shapeTypes[selectedShapeType] + "\nDeveloper Controls:\nSave - s", 2000, 1600);
    }

    //Game over text.
    if(isGameOver)
    {
        fill('red');
        text("Game Over! Press 'R' to reset.", 2000, 1000);
    }


}

function drawShapePreview()
{   
    //Draw preview of shapes with a brown colour.
    fill('#964B00');
    //Draw a temporary preview of entity.
    if(clicked)
    {
        switch(shapeTypes[selectedShapeType])
        {
            case 'BOUNCER':
                fill('red');
            case 'SQUARE':
                rect(clickedMousePositionX, clickedMousePositionY,
                    mouseX - clickedMousePositionX,
                    mouseY - clickedMousePositionY);
            break;
            case 'TRIANGLE':
                triangle(clickedMousePositionX, clickedMousePositionY,
                    mouseX, mouseY, clickedMousePositionX, mouseY);
            break;
            case 'SCOREBALL':
            case 'CIRCLE':
                circle(clickedMousePositionX, clickedMousePositionY, dist(clickedMousePositionX, clickedMousePositionY, mouseX, mouseY));
            break;
        }
    }
    
}

//!!!!!!!!!!!!!!!!!
//UPDATE FUNCTIONS
//!!!!!!!!!!!!!!!!!

//If pump key is pressed compress pump and build up force. When pump key is released decompress and put force into pinball Y velocity.
function updatePump()
{
    if(pump.keyPressed && pump.isEnabled)
    {
        //Compress pump and build up force.
        if(pump.height < -25)
        {
            pump.height += 0.5;
            pump.force += 2;
        }
    }
    else if(!pump.keyPressed && pump.isEnabled)
    {
        //Disable pump, place pump force into pinball Y velocity and reset pump force.
        pump.isEnabled = false;
        ball.velocityY += -pump.force;
        pump.force = 0;                        
    }
    else
    {
        //Decompress pump.
        if(pump.height > -50)
        {
            pump.height -= 0.5;      
        }     
    }
}

function updateBall()
{
    //Clamp velocity to prevent the velocity from getting too hight.
    clampVelocity();

    //Update position based on velocity.
    //Check collison everytime the pinball's position changes the distance of the increment, this prevents the ball from going through objects at high velocity.
    //The additional if statement within the for loop checks if the remainder of the velocity divided by the increment is enough to travel the full velocity.
    //This is so the pinball doesn't move more than its velocity. 
    //If the pinball has a velocity of 12, first pinball has moved the distance of 0 and the remainder is 12 (velocity) % 10 (increment) = 2. 
    //0 (distance moved) + 2 (remainder) != 12 (velocity), so just move a increment of 10. The pinball shouldn't move another 10 otherwise the ball position will have changed by 20.
    //8 more than its velocity of 12. So check again, the distance moved is 10. 10 + 2 (remainder) == 12 (velocity).
    //The remainder is all that is needed to complete the full velocity. So just move the amount of the remainder.
    let increment = 25;
    let remainder = absoluteValue(ball.velocityY) % increment;
    for(let distanceMoved = 0; distanceMoved < absoluteValue(ball.velocityY); distanceMoved+=increment)
    {
        if(distanceMoved + remainder == absoluteValue(ball.velocityY)) 
        {
            ball.positionY += reduceToOne(ball.velocityY) * remainder;
        }
        else
        {
            ball.positionY += reduceToOne(ball.velocityY) * increment;
        }
        ball.currentDirection = 'y';
        checkCollision();
    }

    remainder = absoluteValue(ball.velocityX) % increment;
    for (let distanceMoved = 0; distanceMoved < absoluteValue(ball.velocityX); distanceMoved+=increment)
    {
        if(distanceMoved + remainder == absoluteValue(ball.velocityX))
        {
            ball.positionX += reduceToOne(ball.velocityX) * remainder;
        }
        else
        {
            ball.positionX += reduceToOne(ball.velocityX) * increment;
        }
        ball.currentDirection = 'x';
        checkCollision();
    }

    ball.currentDirection = undefined;
    
    //Update gravity.
    if(gravity)
    ball.velocityY += 0.5;
}

function updatePaddles()
{
    //Check if the key associated with a paddle is being pressed, and then update the angle of the paddle.
    //THe angle of the paddle is clamped within a range.
    //Check for collision with the pinball after moving  the paddle.
    const increment = 0.5;
    for(let i = 0; i < PADDLE_SPEED; i += increment)
    {
        if(leftPaddle.keyPressed)
        {
            if(leftPaddle.angle > leftPaddle.minimumAngle)
            {
                leftPaddle.angle -= increment;
            }
        }
        else
        {
            if(leftPaddle.angle < leftPaddle.maximumAngle)
            {
    
                leftPaddle.angle += increment;
    
            }
        }
    
        if(rightPaddle.keyPressed)
        {
            if(rightPaddle.angle < rightPaddle.maximumAngle)
            {
    
                rightPaddle.angle += increment;
            }
        }
        else
        {
            if(rightPaddle.angle > rightPaddle.minimumAngle)
            {
                rightPaddle.angle -= increment;
            }
        }

        paddleCollision(leftPaddle);
        paddleCollision(rightPaddle);
    }
}

function checkFail()
{
    //Check if the pinball has fallen off the screen.
    if(ball.positionY > 2000)
    {
        lives--;
        resetLevel();
    }
}

//!!!!!!!!!!!!!!!!!
//COLLISION CHECKS
//!!!!!!!!!!!!!!!!!

//To check if the line between two points is within the radius of
//the pinball. This can be used for the sides of different kinds
//of shapes. Will bounce of point
function lineCollision(x1, y1, x2, y2)
{
    //Determine the angle of direction point 1 and 2
    const a = atan2(y2 - y1, x2 - x1);
    //Offsets to break down a line into individual points.
    let offsetX = cos(a);
    let offsetY = sin(a);
    
    lineLength = dist(x1, y1, x2, y2);

    //Loop through every 20 points across a line to see if it is within the
    //radius of the circle.
    for (let point = 0; point < lineLength; point+=20) {
        const pointX = x1 + offsetX * point;
        const pointY = y1 + offsetY * point;
        

        if(dist(ball.positionX, ball.positionY, pointX, pointY) < ball.size)
        {
            //If a point is within the radius of the circle bounce off the point,
            //then exit the loop and return the point position.
            return {x:pointX, y:pointY};
        }
        
    }
}

function diagonalCollision(entityXPoint)
{
    //Undo movement.
    ball.positionY -= ball.velocityY;

    //Cap Y velocity. This prevent the pinball from sliding too fast, and prevents the Y velocity from building up
    //and passing through the triangle.
    if(ball.velocityY > 15)
    {
        ball.velocityY = 15;
    }
    else if(ball.velocityY < -15)
    {
        ball.velocityY = -15;
    }

    //Check the direction of the diagonal side, then slide the ball across the diagonal side.
    if(ball.positionX < entityXPoint)
    {
        ball.velocityX = -absoluteValue(ball.velocityY);
    }
    else
    {
        ball.velocityX = absoluteValue(ball.velocityY);
    }

    ball.positionX += ball.velocityX;
}

function paddleCollision(paddle)
{
    //Grab point of collision that the ball is colliding with the paddle.
    let collision = lineCollision(paddle.positionX, paddle.positionY, calculatePaddleEndPointX(paddle), calculatePaddleEndPointY(paddle));

    //Check if the pinball collided with any point.
    if(collision != undefined)
    {
        //Check which side of the paddle the pinball on.
        angleMode(DEGREES);
        let a = atan2(ball.positionY - paddle.positionY, ball.positionX - paddle.positionX);
        angleMode(RADIUS);
        //If the paddle key is pressed and it isn't at any of the angle endpoints or below the paddle. This ensures that the ball only bounces off the paddle
        //if the paddle is swinging.
        if(paddle.keyPressed && paddle.angle != paddle.minimumAngle && paddle.angle != paddle.maximumAngle || 
          (paddle.positionX < 1000 && a > paddle.angle) || (paddle.positionX > 1000 && a < paddle.angle && a > 0))
        {
            bounce(collision.x, collision.y, PADDLE_FORCE);
        }
        else
        {
            diagonalCollision(paddle.positionX);
        }
    }
}

//Function bounces pinball off point.
function bounce(x, y, addedForce = 0)
{
    //Displace ball.    
    //Calculate the angle the ball is from the entity.
    const a = atan2(ball.positionY - y, ball.positionX - x);

    ball.positionX += cos(a) * ball.size;
    ball.positionY += sin(a) * ball.size;

    //Set velocity away from where the pinball hit the entity.
    //Using the ratio between sin and cos, so the total velocity doesn't change.
    const totalVelocity = friction*(absoluteValue(ball.velocityX) + absoluteValue(ball.velocityY)) + addedForce;
    const totalSinCos = absoluteValue(cos(a)) + absoluteValue(sin(a));
    ball.velocityX = totalVelocity * (cos(a)/totalSinCos);
    ball.velocityY = totalVelocity * (sin(a)/totalSinCos);
}

//If the ball collides with a vertical or horizontal side, undo movement flip velocity and apply friction.
function flipVelocityX()
{
    ball.positionX -= ball.velocityX;
    ball.velocityX = -ball.velocityX*friction;
}

function flipVelocityY()
{
    ball.positionY -= ball.velocityY;
    ball.velocityY = -ball.velocityY*friction;
}


//This function handles all the collision checks for the pinball.
function checkCollision()
{
    //Check if the ball is colliding with the two paddles.
    paddleCollision(leftPaddle);

    paddleCollision(rightPaddle);

    //Check if the ball is colliding with the pump, if so position pinball on top of pump, do not bounce pinball off pump and enable pump.
    if(lineCollision(pump.positionX, pump.positionY + pump.height, pump.positionX + pump.width, pump.positionY + pump.height))
    {
        ball.positionY = pump.positionY + pump.height - ball.size;
        ball.velocityY = 0;
        pump.isEnabled = true;

        //Open exit if the game isn't over.
        if(!isGameOver)
        exitDoor.isExitClosed = false;
    }

    //Check if the pinball has exited the starting area.
    //The check is a invisiable line above the exit door.
    if(exitDoor.isExitClosed == false)
    {
        if(lineCollision(exitDoor.positionX, exitDoor.positionY-50, exitDoor.positionX + exitDoor.width, exitDoor.positionY - 50))
        {
            exitDoor.isExitClosed = true;
        }
    }
    else
    {
        //Check if pinball is coliding with the exit door.
        let collision = lineCollision(exitDoor.positionX, exitDoor.positionY, exitDoor.positionX + exitDoor.width, exitDoor.positionY);
        if(collision != undefined)    
        {
            flipVelocityY(); 
        }
    }

    //Go through every entity and see if the ball is colliding.
    for (let shape = 0; shape < entities.length; shape++) {
        const element = entities[shape];
        
        switch(element.type)
        {
            case 'SQUARE':
                //Top side of square.
                //Bottom side of square.
                if(lineCollision(element.positionX, element.positionY, element.positionX + element.width, element.positionY) ||
                   lineCollision(element.positionX, element.positionY + element.height, element.positionX + element.width, element.positionY + element.height))
                {
                    flipVelocityY();
                }
                //Left side of square.
                //Right side of square.
                if(lineCollision(element.positionX, element.positionY, element.positionX, element.positionY + element.height) ||
                        lineCollision(element.positionX + element.width, element.positionY, element.positionX + element.width, element.positionY + element.height))
                {
                    flipVelocityX();
                }
            break;
            case 'TRIANGLE':
                //Verticle side of right hand triangle.
                if(lineCollision(element.positionX, element.positionY, element.positionX, element.positionY + element.height))
                {
                    flipVelocityX();
                }
                //Horizontal side of right hand triangle.
                if(lineCollision(element.positionX, element.positionY + element.height, element.positionX + element.width, element.positionY + element.height))
                {
                    flipVelocityY();
                }

                //Diagonal side  of right hand triangle.
                //Check if the pinball collided with any point.
                if(lineCollision(element.positionX, element.positionY, element.positionX + element.width, element.positionY + element.height))
                {
                    diagonalCollision(element.positionX);
                }
            break;
            case 'CIRCLE':
                //Check if the distance between the center of the pinball and the center of the circle is smaller than the radius of both the cirlce and pinball.
                if(dist(ball.positionX, ball.positionY, element.positionX, element.positionY) < ball.size + element.width)
                {
                    bounce(element.positionX, element.positionY);
                }
            break;
            case 'SCOREBALL':
                //Check if the distance between the center of the pinball and the center of the circle is smaller than the radius of both the cirlce and pinball.
                if(dist(ball.positionX, ball.positionY, element.positionX, element.positionY) < ball.size + element.width)
                {
                    element.flash = 1;
                    score += 100;
                    bounce(element.positionX, element.positionY);
                }
            break;
            case 'BOUNCER':
                if(lineCollision(element.positionX, element.positionY, element.positionX + element.width, element.positionY) ||
                lineCollision(element.positionX, element.positionY + element.height, element.positionX + element.width, element.positionY + element.height) ||
                lineCollision(element.positionX, element.positionY, element.positionX, element.positionY + element.height) ||
                lineCollision(element.positionX + element.width, element.positionY, element.positionX + element.width, element.positionY + element.height))
                {
                    ball.velocityY = -40;
                }
            break;
        }
    }
}

//!!!!!!!!!!!!!!!!
//INPUT FUNCTIONS
//!!!!!!!!!!!!!!!!

//Constants for keyCode values.
const SPACE_BAR = 32;
const G_KEY = 71;
const P_KEY = 80;
const Z_KEY = 90;
const S_KEY = 83;
const R_KEY = 82;
const PERIOD_KEY = 190;
function keyPressed()
{
    switch(keyCode)
    {
        //Turn off/on gravity.  
        case G_KEY:
            if(DEVELOPER_MODE)
            gravity = !gravity;
        break;
        //Pauses/Unpauses game. This stops all update function.
        case P_KEY:
            isPaused = !isPaused;
        break;
        //These case statements update the selected shape.
        case LEFT_ARROW:
            if(selectedShapeType != 0 && DEVELOPER_MODE)
            selectedShapeType--;
        break;
        case RIGHT_ARROW:
            if(selectedShapeType!=shapeTypes.length - 1 && DEVELOPER_MODE)
            selectedShapeType++;
        break;
        case Z_KEY:
            leftPaddle.keyPressed = true;
        break;
        case PERIOD_KEY:
            rightPaddle.keyPressed = true;
        break;
        //Hold down space bar to compress pump to launch pinball.
        case SPACE_BAR:
            pump.keyPressed = true;
        break;
        //Save current entities to JSON file.
        case S_KEY:
            if(DEVELOPER_MODE)
            saveJSON([entities], 'pinballEntities');cas
        break;
        case R_KEY:
            lives = 3;
            score = 0;
            isGameOver = false;
            resetLevel();
        break;
    }
}

function keyReleased()
{
    switch(keyCode)
    {
        case Z_KEY:
            leftPaddle.keyPressed = false;
        break;
        case PERIOD_KEY:
            rightPaddle.keyPressed = false;
        break;
        case SPACE_BAR:
            pump.keyPressed = false;
        break;
    }
}

//These two mouse function are just used for drawing shapes onto the canvas.
function mousePressed()
{
    //Save the initial position clicked.
    clickedMousePositionX = mouseX;
    clickedMousePositionY = mouseY;
    clicked = true;
}


function mouseReleased()
{
    if(DEVELOPER_MODE)
    {
        //Depending in the selected shape, an entity of that shape is added to the entities list. This list is used for drawing shapes to the canvas and checking collision.
        switch(shapeTypes[selectedShapeType])
        {
            case 'SQUARE':
            case 'BOUNCER':
            case 'TRIANGLE':
                if(mouseX)
                entities.push(new entity(clickedMousePositionX, clickedMousePositionY, mouseX - clickedMousePositionX, mouseY - clickedMousePositionY, shapeTypes[selectedShapeType]));
            break;
            case 'SCOREBALL':
            case 'CIRCLE':
                const circleSize = dist(clickedMousePositionX, clickedMousePositionY, mouseX, mouseY);
                entities.push(new entity(clickedMousePositionX, clickedMousePositionY, circleSize, circleSize, shapeTypes[selectedShapeType]));
            break;
        }
    }
    clicked = false;
}

//!!!!!!!!!!!!!!!
//MISC FUNCTIONS
//!!!!!!!!!!!!!!!

//Returns any value inputted into the function as a positive value.
function absoluteValue(value)
{
    if(value < 0)
    {
        return -value;
    }
    else
    {
        return value;
    }
}

function reduceToOne(value)
{
    if(value < 0)
    {
        return -1;
    }
    else if(value > 0)
    {
        return 1;
    }
    else
    {
        return 0;
    }
}

function clampVelocity()
{
    //If velocity gets too high set velocity to the highest point.
    //If velocity gets too low set velocity to the lowest point.
    if(ball.velocityX < -ball.terminalVelocity)
    {
        ball.velocityX = -ball.terminalVelocity;
    }
    else if(ball.velocityX > ball.terminalVelocity)
    {
        ball.velocityX = ball.terminalVelocity;
    }

    if(ball.velocityY < -ball.terminalVelocity)
    {
        ball.velocityY = -ball.terminalVelocity;
    }
    else if(ball.velocityY > ball.terminalVelocity)
    {
        ball.velocityY = ball.terminalVelocity;
    }
}

//These two functions return the position of the end of the inputted paddle.
function calculatePaddleEndPointX(paddle)
{
    return cos(paddle.angle) * paddle.length + paddle.positionX;
}

function calculatePaddleEndPointY(paddle)
{
    return sin(paddle.angle) * paddle.length + paddle.positionY;
}

function resetLevel()
{{
    ball.positionX = 1925;
    ball.positionY = 1600;
    ball.velocityX = 0;
    ball.velocityY = 0;
    if(lives < 0)
    {
        isGameOver = true;
        exitDoor.isExitClosed = true;
    }
}}
