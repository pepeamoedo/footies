const express = require("express");
const port = 3000;

const game = express();

game.use(express.static("game"));

game.listen(port, () => {
    console.log(`Game on port: ${port}`);
});