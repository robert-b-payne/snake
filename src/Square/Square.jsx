import React, { Component } from "react";
import classes from "./Square.module.css";

class Square extends Component {
  // state = {  }
  render() {
    let classesString = [classes.Square];
    if (this.props.color) {
      classesString.push(classes[this.props.color]);
      classesString = classesString.join(" ");
    }
    return (
      <React.Fragment>
        <span className={classesString} />
      </React.Fragment>
    );
  }
}

export default Square;
