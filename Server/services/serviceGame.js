const games = require("../models/game-model");

const ServiceGame = {

  async makeMove(gameId, player, position) {
    console.log(gameId, player, position);
    const game = await games.findById(gameId);
    console.log("before: " +  game.board);
    const newBoard = game.board.slice();
    newBoard[position] = player;
    game.board = newBoard;
    await game.save();
    console.log("after: " +  game.board);
    console.log("move made");
  },

  calculateWinner(squares, winCondition, maxRow, maxCol, squareIndex) {

    const rowNumber = (squareIndex - (squareIndex % maxRow)) / maxRow;
    const colNumber = squareIndex % maxCol;
    const protentialWinner = squares[squareIndex];

    //do hang ngang

    let i = rowNumber;
    let j = colNumber;
    let count = 1;
    let highlight = [];
    highlight.push(i * maxRow + j)

    while (j - 1 >= 0) {
      j--;
      const arrayIndex = i * maxRow + j;
      if (squares[arrayIndex] === protentialWinner) {
        count++;
        highlight.push(arrayIndex);
      }
      else {
        break;
      }
    }

    i = rowNumber;
    j = colNumber;

    while (j + 1 < maxCol) {
      j++;
      const arrayIndex = i * maxRow + j;
      if (squares[arrayIndex] === protentialWinner) {
        count++;
        highlight.push(arrayIndex);
      }
      else {
        break;
      }
    }

    if (count === winCondition) {
      return { winner: protentialWinner, highlight: highlight };
    }

    //do hang doc
    i = rowNumber;
    j = colNumber;
    highlight = [];
    highlight.push(i * maxRow + j);
    count = 1;

    while (i - 1 >= 0) {
      i--;
      const arrayIndex = i * maxRow + j;
      if (squares[arrayIndex] === protentialWinner) {
        count++;
        highlight.push(arrayIndex);
      }
      else {
        break;
      }
    }

    i = rowNumber;
    j = colNumber;

    while (i + 1 < maxRow) {
      i++;
      const arrayIndex = i * maxRow + j;
      if (squares[arrayIndex] === protentialWinner) {
        count++;
        highlight.push(arrayIndex);
      }
      else {
        break;
      }
    }

    if (count === winCondition) {
      return { winner: protentialWinner, highlight: highlight };
    }

    //do duong cheo chinh
    i = rowNumber;
    j = colNumber;
    highlight = [];
    highlight.push(i * maxRow + j);
    count = 1;

    while (i - 1 >= 0 && j - 1 >= 0) {
      i--;
      j--;
      const arrayIndex = i * maxRow + j;
      if (squares[arrayIndex] === protentialWinner) {
        count++;
        highlight.push(arrayIndex);
      }
      else {
        break;
      }
    }

    i = rowNumber;
    j = colNumber;

    while (i + 1 < maxRow && j + 1 < maxCol) {
      i++;
      j++;
      const arrayIndex = i * maxRow + j;
      if (squares[arrayIndex] === protentialWinner) {
        count++;
        highlight.push(arrayIndex);
      }
      else {
        break;
      }
    }

    if (count === winCondition) {
      return { winner: protentialWinner, highlight: highlight };
    }

    //do duong cheo phu

    i = rowNumber;
    j = colNumber;
    highlight = [];
    highlight.push(i * maxRow + j);
    count = 1;

    while (i - 1 >= 0 && j + 1 < maxCol) {
      i--;
      j++;
      const arrayIndex = i * maxRow + j;
      if (squares[arrayIndex] === protentialWinner) {
        count++;
        highlight.push(arrayIndex);
      }
      else {
        break;
      }
    }

    i = rowNumber;
    j = colNumber;

    while (i + 1 < maxRow && j - 1 >= 0) {
      i++;
      j--;
      const arrayIndex = i * maxRow + j;
      if (squares[arrayIndex] === protentialWinner) {
        count++;
        highlight.push(arrayIndex);
      }
      else {
        break;
      }
    }

    if (count === winCondition) {
      return { winner: protentialWinner, highlight: highlight };
    }

    return null;
  }


};

module.exports = ServiceGame;