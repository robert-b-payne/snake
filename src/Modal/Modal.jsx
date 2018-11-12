import React from "react";
import classes from "./Modal.module.css";

const Modal = props => {
  return (
    <div className={classes.Container}>
      {props.play === "Restart" ? (
        <span>
          <p>Game over!</p>
          <p>Click to Restart</p>
        </span>
      ) : (
        <p>Click to {props.play}</p>
      )}
    </div>
  );
};

export default Modal;
