import React, { Component } from "react";
import Square from "../Square/Square";
import classes from "./Game.module.css";
class Game extends Component {
  state = {
    width: 70,
    height: 40,
    colors: null,
    background: null, //background array, all grey
    direction: "right",
    nextDirection: "right",
    //up, down, left, right
    snake: [[1, 5]], //coordinates of each snake segment
    food: [16, 16], //food coordinates, only one food at a time
    gameover: false,
    score: 0,
    // growing: false,
    growSize: 3, //how much segments snake grows after eating food
    growCounter: 0 //the number of segments the snake needs to grow, each time a food is encountered
    //growCounter increases by growSize, decreases by 1 each time it grows a segment
  };

  constructor() {
    super();
    //initialize colors array
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
    this.state.background = this.copyArray(this.state.colors);
    this.state.snake.forEach(x => {
      this.state.colors[x[0]][x[1]] = "blue";
    });
    this.state.colors[this.state.food[0]][this.state.food[1]] = "green";
  }

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
      this.setState({ growCounter: this.state.growCounter - 1 }); //don't rerender
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
      //   console.log("drawing new frame!");
      let colorsCopy = this.copyArray(this.state.background);
      let newSnake;
      //calculate next position of snake head
      let nextPos = this.calcNextPos();
      //bounds check, set gameover -> true if out of bounds
      if (this.checkBounds(nextPos)) {
        this.setState({ gameover: true });
      }
      //update snake
      newSnake = this.updateSnake(nextPos);
      //   console.log(newSnake);
      //   newSnake.forEach((x, i) => {
      //     console.log(`segment ${i}: [${x[0]}, ${x[1]}]`);
      //   });
      //redraw
      colorsCopy[this.state.food[0]][this.state.food[1]] = "green";
      newSnake.forEach(x => {
        if (this.state.gameover) colorsCopy[x[0]][x[1]] = "red";
        else colorsCopy[x[0]][x[1]] = "blue";
      });

      let dir = this.updateDirection();

      this.setState({
        colors: colorsCopy,
        snake: newSnake,
        direction: dir
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
    this.setState({ nextDirection: event.key });
  };

  updateDirection = () => {
    let dir;
    if (
      this.state.nextDirection === "ArrowRight" &&
      this.state.direction !== "left" &&
      this.state.direction !== "right"
    )
      dir = "right";
    else if (
      this.state.nextDirection === "ArrowLeft" &&
      this.state.direction !== "right" &&
      this.state.direction !== "left"
    )
      dir = "left";
    else if (
      this.state.nextDirection === "ArrowUp" &&
      this.state.direction !== "down" &&
      this.state.direction !== "up"
    )
      dir = "up";
    else if (
      this.state.nextDirection === "ArrowDown" &&
      this.state.direction !== "up" &&
      this.state.direction !== "down"
    )
      dir = "down";
    else dir = this.state.direction;
    return dir;
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

  componentDidMount() {
    // this.state.colors[1][2] = "blue";
    // let colorsCopy;
    // colorsCopy[1][1] = "blue";
    // colorsCopy[10][10] = "red";
    // this.setState({
    //   colors: colorsCopy
    // });

    setInterval(() => {
      this.draw();
    }, 200);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!this.compareArrays(nextState.colors, this.state.colors)) return true;
    else {
      console.log("not rerendering!");
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
  };
  render() {
    let squares = this.initializeSquares();

    return (
      <React.Fragment>
        <p>React Snake</p>
        <p>Score: {this.state.score}</p>
        <p>Length: {this.state.snake.length}</p>
        <div
          className={classes.GameContainer}
          autoFocus
          onKeyDown={event => this.keyDownHandler(event)}
          onFocus={this.focusHandler}
          onBlur={this.blurHandler}
          tabIndex="0"
          style={{
            width: this.state.width * 13,
            height: this.state.height * 13
          }}
        >
          {squares}
        </div>
        {this.state.gameover ? (
          <p style={{ color: "red" }}>Game over!</p>
        ) : null}
      </React.Fragment>
    );
  }
}

export default Game;
