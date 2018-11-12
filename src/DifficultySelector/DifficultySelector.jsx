import React, { Component } from "react";

class DifficultySelector extends Component {
  state = {};
  render() {
    return (
      <React.Fragment>
        <span>Select Difficulty: </span>
        <select
          style={{ marginLeft: "4px" }}
          onChange={this.props.difficultyChangeHandler}
        >
          <option value="easy">Easy</option>
          <option value="medium" selected>
            Medium
          </option>
          <option value="hard">Hard</option>
        </select>
      </React.Fragment>
    );
  }
}

export default DifficultySelector;
