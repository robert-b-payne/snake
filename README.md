<h1>React Snake</h1>

<a href="https://reactsnake.firebaseapp.com/">Demo</a>

This project is an implementation of the popular game called Snake using ReactJS.

This game uses a 2d array with different values in each element indicating the presence of a snake segment, food, or nothing. If there is nothing, the color is grey, unless around the outer edges of the array, which indicates the out of bounds area. A 2d array of span elements is then rendered with colors matching the 2d array with the color values. 

There is a separate array holding the location of all the individual snake segments. 

For every frame update, the snake array is updated based on the current direction, and the 2d array with all the color information is updated with the new snake position.

The snake's direction is updated when the game component is focused, i.e. when it is clicked on, and when an arrow key is pressed at an orthogonal direction, e.g. the snake is moving right and the up or down key is pressed. The snake cannot do an instant 180 degree turn, e.g. can't change direction to left if the snake is currently moving right. 

There is an input buffer (two element FIFO buffer) so direction changes can be queued. This allows for two direction changes to be registered without having to wait for two frame updates. E.g. the snake is moving right, the user quickly enters up and then left, then the snake moves up during the next frame update, and then moves left on the following frame update. This allows for more responsive controls.

Whenever the next position of the snake's head is calculated, bounds checking occurs to see if the snake goes out of bounds, collides with itself, or eats a food. When the snake eats a food, the snake grows one segment for growSize number of consecutive frame updates, where growSize is how much the snake grows for each food eaten. growSize depends on the difficulty.
