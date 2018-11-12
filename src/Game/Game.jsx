import React, { Component } from "react";
import Square from "../Square/Square";
import classes from "./Game.module.css";
import Modal from "../Modal/Modal";
import DifficultySelector from "../DifficultySelector/DifficultySelector";
class Game extends Component {
  state = {
    version: 1.08,
    width: 32, //32 x 32 in production
    height: 32,
    colors: null,
    background: null, //background array, all grey
    direction: "right",
    // nextDirection: "right",
    directionBuffer: [],
    //nextDirection values: up, down, left, right
    startingSnake: [[1, 5]], //starting position of snake
    snake: null, //coordinates of each snake segment
    food: [16, 16], //food coordinates, only one food at a time
    gameover: false,
    score: 0,
    highScore: 0,
    length: 1,
    growSize: 10, //how much segments snake grows after eating food
    growCounter: 0, //the number of segments the snake needs to grow, each time a food is encountered
    //growCounter increases by growSize, decreases by 1 each time it grows a segment
    started: false, //indicates if the game has started
    paused: false,
    timerId: null, //value to stop the timer
    difficulty: "medium" //easy, medium, hard
  };

  constructor() {
    super();
    //initialize colors array
    console.log("react snake " + this.state.version);
    console.log("resetting game!");
    let row = [];
    this.state.colors = [];
    for (let i = 0; i < this.state.height; i++) {
      row = [];
      for (let j = 0; j < this.state.width; j++) {
        if (
          i === 0 ||
          i === this.state.height - 1 ||
          j === 0 ||
          j === this.state.width - 1
        )
          row.push("white");
        else row.push("grey");
      }
      this.state.colors.push(row);
    }
    this.state.snake = this.state.startingSnake;
    this.state.background = this.copyArray(this.state.colors);
    this.state.snake.forEach(x => {
      this.state.colors[x[0]][x[1]] = "blue";
    });
    this.state.colors[this.state.food[0]][this.state.food[1]] = "green";
  }

  reset = () => {
    console.log("resetting game!");
    let row = [];
    let colors = [];
    for (let i = 0; i < this.state.height; i++) {
      row = [];
      for (let j = 0; j < this.state.width; j++) {
        if (
          i === 0 ||
          i === this.state.height - 1 ||
          j === 0 ||
          j === this.state.width - 1
        )
          row.push("white");
        else row.push("grey");
      }
      colors.push(row);
    }
    let background = this.copyArray(colors);
    let snake = [[1, 5]];
    snake.forEach(x => {
      colors[x[0]][x[1]] = "blue";
    });
    colors[this.state.food[0]][this.state.food[1]] = "green";
    this.setState({
      colors: colors,
      snake: snake,
      background: background,
      direction: "right",
      growCounter: 0,
      length: 1,
      score: 0,
      directionBuffer: []
    });
  };

  //old version of RESET
  // console.log("resetting game!");
  // let row = [];
  // this.state.colors = [];
  // for (let i = 0; i < this.state.height; i++) {
  //   row = [];
  //   for (let j = 0; j < this.state.width; j++) {
  //     if (
  //       i === 0 ||
  //       i === this.state.height - 1 ||
  //       j === 0 ||
  //       j === this.state.width - 1
  //     )
  //       row.push("white");
  //     else row.push("grey");
  //   }
  //   this.state.colors.push(row);
  // }
  // this.state.background = this.copyArray(this.state.colors);
  // this.state.snake.forEach(x => {
  //   this.state.colors[x[0]][x[1]] = "blue";
  // });
  // this.state.colors[this.state.food[0]][this.state.food[1]] = "green";

  updateSnake = nextPos => {
    let snakeCpy1 = this.copyArray(this.state.snake);
    let snakeCpy2 = [];
    snakeCpy2.push(nextPos);
    // console.log(`pushing ${nextPos}`);
    for (let i = 0; i < snakeCpy1.length - 1; i++) {
      snakeCpy2.push(snakeCpy1[i]);
      //   console.log(`pushing ${snakeCpy1[i]} onto snake`);
    }

    //grow snake
    if (this.state.growCounter > 0) {
      snakeCpy2.push(snakeCpy1[snakeCpy1.length - 1]);
      this.setState({
        growCounter: this.state.growCounter - 1,
        length: this.state.length + 1
      }); //don't rerender
    }

    return snakeCpy2;
  };

  //updates positions of the leading snake segment and food (if eaten)
  calcNextPos = () => {
    let nextPos = [];
    if (this.state.direction === "right") {
      nextPos = [...this.state.snake[0]];
      nextPos[1]++;
    }
    if (this.state.direction === "left") {
      nextPos = [...this.state.snake[0]];
      nextPos[1]--;
    }
    if (this.state.direction === "up") {
      nextPos = [...this.state.snake[0]];
      nextPos[0]--;
    }
    if (this.state.direction === "down") {
      nextPos = [...this.state.snake[0]];
      nextPos[0]++;
    }
    //check for snake collision with itself
    for (let i = 1; i < this.state.snake.length; i++) {
      if (this.comparePos(nextPos, this.state.snake[i])) {
        console.log("self collision");
        console.log("ending timer!");
        clearInterval(this.state.timerId);
        this.setHighScore();
        this.setState({ gameover: true });
        return nextPos;
      }
    }

    //check if snake collides with food
    if (this.comparePos(nextPos, this.state.food)) {
      let newFood = this.moveFood(nextPos);
      this.setState({
        score: this.state.score + 1,
        food: newFood,
        growCounter: this.state.growCounter + this.state.growSize
      });
    }
    return nextPos;
    // return {score: score, food: newFood}
  };

  comparePos = (a, b) => {
    if (a[0] === b[0] && a[1] === b[1]) return true;
    else return false;
  };

  moveFood = newPos => {
    let foodRow;
    let foodCol;
    let newFood;
    let valid;

    do {
      valid = true;
      foodRow = Math.floor((this.state.height - 2) * Math.random()) + 1;
      foodCol = Math.floor((this.state.width - 2) * Math.random()) + 1;
      newFood = [foodRow, foodCol];

      for (let i = 0; i < this.state.snake.length; i++) {
        if (this.comparePos(newFood, this.state.snake[i])) {
          valid = false;
          break;
        }
      }

      if (this.comparePos(newFood, newPos)) valid = false;
    } while (!valid);

    return newFood;
  };

  //return true if out of bounds
  checkBounds = nextPos => {
    if (
      nextPos[0] >= this.state.height - 1 ||
      nextPos[0] <= 0 ||
      nextPos[1] >= this.state.width - 1 ||
      nextPos[1] <= 0
    )
      return true;
    else return false;
  };

  //add blue snake segments into colors array
  draw = () => {
    // let gameover = false;
    if (!this.state.gameover) {
      let dir = this.updateDirection();
      this.setState({ direction: dir });
      //   console.log("drawing new frame!");
      let colorsCopy = this.copyArray(this.state.background);
      let newSnake;
      //calculate next position of snake head
      let nextPos = this.calcNextPos();
      //bounds check, set gameover -> true if out of bounds
      if (this.checkBounds(nextPos)) {
        console.log("out of bounds ending timer!");
        clearInterval(this.state.timerId);
        this.setHighScore();
        this.setState({ gameover: true });
      }
      //update snake
      newSnake = this.updateSnake(nextPos);
      colorsCopy[this.state.food[0]][this.state.food[1]] = "green";
      newSnake.forEach(x => {
        if (this.state.gameover) colorsCopy[x[0]][x[1]] = "red";
        else colorsCopy[x[0]][x[1]] = "blue";
      });

      this.setState({
        colors: colorsCopy,
        snake: newSnake
      });
    }
  };

  keyDownHandler = event => {
    // console.log("keyDownHandler called with value: " + event.key);
    // console.log(event);
    // let dir;
    // if (
    //   event.key === "ArrowRight" &&
    //   this.state.direction !== "left" &&
    //   this.state.direction !== "right"
    // )
    //   dir = "right";
    // else if (
    //   event.key === "ArrowLeft" &&
    //   this.state.direction !== "right" &&
    //   this.state.direction !== "left"
    // )
    //   dir = "left";
    // else if (
    //   event.key === "ArrowUp" &&
    //   this.state.direction !== "down" &&
    //   this.state.direction !== "up"
    // )
    //   dir = "up";
    // else if (
    //   event.key === "ArrowDown" &&
    //   this.state.direction !== "up" &&
    //   this.state.direction !== "down"
    // )
    //   dir = "down";
    // else return;
    // // console.log("setting direction to " + dir);
    // this.setState({ direction: dir });
    if (this.state.directionBuffer.length < 2) {
      let tempBuffer = this.copyArray(this.state.directionBuffer);
      tempBuffer.push(event.key);
      this.setState({ directionBuffer: tempBuffer });
    }
    // this.setState({ nextDirection: event.key });
  };

  updateDirection = () => {
    let dir;
    let poppedDir;
    let directionBufferCopy = this.copyArray(this.state.directionBuffer);

    if (this.state.directionBuffer.length) {
      poppedDir = this.state.directionBuffer[0];
      if (
        poppedDir === "ArrowRight" &&
        this.state.direction !== "left" &&
        this.state.direction !== "right"
      )
        dir = "right";
      else if (
        poppedDir === "ArrowLeft" &&
        this.state.direction !== "right" &&
        this.state.direction !== "left"
      )
        dir = "left";
      else if (
        poppedDir === "ArrowUp" &&
        this.state.direction !== "down" &&
        this.state.direction !== "up"
      )
        dir = "up";
      else if (
        poppedDir === "ArrowDown" &&
        this.state.direction !== "up" &&
        this.state.direction !== "down"
      )
        dir = "down";
      else dir = this.state.direction;
      directionBufferCopy.splice(0, 1);
    } else dir = this.state.direction;
    this.setState({ directionBuffer: directionBufferCopy });
    return dir;

    // if (
    //   this.state.nextDirection === "ArrowRight" &&
    //   this.state.direction !== "left" &&
    //   this.state.direction !== "right"
    // )
    //   dir = "right";
    // else if (
    //   this.state.nextDirection === "ArrowLeft" &&
    //   this.state.direction !== "right" &&
    //   this.state.direction !== "left"
    // )
    //   dir = "left";
    // else if (
    //   this.state.nextDirection === "ArrowUp" &&
    //   this.state.direction !== "down" &&
    //   this.state.direction !== "up"
    // )
    //   dir = "up";
    // else if (
    //   this.state.nextDirection === "ArrowDown" &&
    //   this.state.direction !== "up" &&
    //   this.state.direction !== "down"
    // )
    //   dir = "down";
    // else dir = this.state.direction;
    // return dir;
  };

  copyArray = a => {
    let copiedArray = a.map(x => {
      if (Array.isArray(x)) return this.copyArray(x);
      else return x;
    });
    return copiedArray;
  };

  compareArrays = (a, b) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (Array.isArray(a[i]) ^ Array.isArray(b[i])) return false;
      if (Array.isArray(a[i])) {
        if (!this.compareArrays(a[i], b[i])) return false;
      } else if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  };

  componentWillUnmount() {
    console.log("Unmounting Game!!");
  }

  // componentDidMount() {

  // }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      !this.compareArrays(nextState.colors, this.state.colors) ||
      nextState.started !== this.state.started ||
      nextState.paused !== this.state.paused ||
      nextState.growSize !== this.state.growSize
    )
      return true;
    else {
      // console.log("not rerendering!");
      return false;
    }
  }

  //initialize squares
  initializeSquares = () => {
    let squareRow;
    let squareArray = [];
    for (let i = 0; i < this.state.height; i++) {
      squareRow = [];
      for (let j = 0; j < this.state.width; j++) {
        squareRow.push(
          <Square
            color={this.state.colors[i][j]}
            key={i.toString().padStart(4, "0") + j.toString().padStart(4, "0")}
          />
        );
      }
      squareArray.push(squareRow);
      squareArray.push(<br key={i} />);
    }
    return squareArray;
  };

  focusHandler = () => {
    console.log("focusHandler called!");
  };

  blurHandler = () => {
    console.log("blurHandler called!");
    console.log("ending timer!");
    clearInterval(this.state.timerId);
    this.setState({ paused: true });
  };

  clickHandler = () => {
    console.log("click handler called!");
    let speed;
    switch (this.state.difficulty) {
      case "easy":
        speed = 175;
        break;
      case "medium":
        speed = 140;
        break;
      case "hard":
        speed = 90;
    }
    if (this.state.gameover || this.state.paused || !this.state.started) {
      if (this.state.gameover) this.reset();
      console.log("starting new timer!");
      this.draw();
      let timerId = setInterval(() => {
        this.draw();
      }, speed);
      this.setState({
        timerId: timerId,
        started: true,
        paused: false,
        gameover: false
      });
    }
  };

  setHighScore = () => {
    console.log(
      "setting high score! Comparing " +
        this.state.length +
        " to " +
        this.state.highScore
    );
    let highScore = this.state.highScore;
    if (this.state.length - 1 > this.state.highScore) {
      highScore = this.state.length - 1;
      if (this.state.growCounter) highScore++;
    }
    this.setState({ highScore: highScore });
  };

  changeHandler = event => {
    console.log(
      "changeHandler called with value: " + Number(event.target.value)
    );

    this.setState({ growSize: Number(event.target.value) });
  };

  difficultyChangeHandler = event => {
    console.log("difficulty changed to " + event.target.value);
    let growSize;
    switch (event.target.value) {
      case "easy":
        growSize = 5;
        break;
      case "medium":
        growSize = 10;
        break;
      case "hard":
        growSize = 15;
        break;
      default:
        growSize = 10;
    }
    this.setState({ difficulty: event.target.value, growSize: growSize });
  };
  render() {
    let squares = this.initializeSquares();
    let modal = null;
    if (!this.state.started || this.state.paused || this.state.gameover) {
      modal = (
        <Modal
          play={
            this.state.gameover
              ? "Restart"
              : !this.state.started
                ? "Start"
                : "Resume"
          }
        />
      );
    }
    return (
      <React.Fragment>
        <p>React Snake!</p>
        <p>Score: {this.state.length - 1}</p>
        <p>High Score: {this.state.highScore}</p>
        {/* <p>Length: {this.state.snake.length}</p> */}
        {/* <p>started: {this.state.started ? "true" : "false"}</p>
        <p>paused: {this.state.paused ? "true" : "false"}</p>
        <p>gameover: {this.state.gameover ? "true" : "false"}</p> */}
        <DifficultySelector
          difficultyChangeHandler={event => this.difficultyChangeHandler(event)}
        />
        <div
          className={classes.GameContainer}
          autoFocus
          onKeyDown={event => this.keyDownHandler(event)}
          onFocus={this.focusHandler}
          onBlur={this.blurHandler}
          onClick={this.clickHandler}
          tabIndex="0"
          style={{
            width: this.state.width * 17,
            height: this.state.height * 17
          }}
        >
          {modal}
          {squares}
        </div>
        {/* {this.state.gameover ? (
          <p style={{ color: "red" }}>Game over!</p>
        ) : null} */}
      </React.Fragment>
    );
  }
}

export default Game;
