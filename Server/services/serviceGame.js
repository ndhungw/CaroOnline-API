const { createNewGame } = require("../models/game-model");
const games = require("../models/game-model");
const Room = require("../models/room-model");
const User = require("../models/user-model");
const roomService = require("../services/roomService");

const ServiceGame = {

  async makeMove(game, position) {

    const newBoard = game.board.slice();
    newBoard[position] = game.playerMoveNext;
    game.board = newBoard;
    game.history.push({player: game.playerMoveNext, position: position});
    await game.save();
    console.log(game);
    console.log("move made");
  },

  async createNewGame({ roomId, maxCol, maxRow, winCondition }) {
    const room = await (await roomService.getRoomInfo({ room_id: roomId }));

    const firstTurn = ((room.PlayedGames.length) % 2) + 1;
    const game = await games.createNewGame({ roomId, maxCol, maxRow, firstTurn, winCondition });

    
    room.CurrentGame = game._id;
    room.PlayedGames.push(game._id);
    await room.save();

    return game;
  },

  async getWinner(game) {
    const room = await Room.findById(game.roomId);
    let announcement = "";

    let username = ""
    if (room) {
      switch (game.winner) {
        case 1:
          username = await User.findById(room.Player1).username;
          announcement = username + "has won";
          break;

        case 2:
          username = await User.findById(room.Player2).username;
          announcement = username + "has won";
          break;

        case 3:
          announcement = "Tie, both have won";
          break;

        default:
          break;
      };
      return announcement;
    }
  },


  async calculateWinner(game, squareIndex) {
    const maxRow = game.maxRow;
    const maxCol = game.maxCol;
    const squares = game.board;
    const winCondition = game.winCondition;

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

  // calculateWinner(squares, winCondition, maxRow, maxCol, squareIndex) {

  //   const rowNumber = (squareIndex - (squareIndex % maxRow)) / maxRow;
  //   const colNumber = squareIndex % maxCol;
  //   const protentialWinner = squares[squareIndex];

  //   //do hang ngang

  //   let i = rowNumber;
  //   let j = colNumber;
  //   let count = 1;
  //   let highlight = [];
  //   highlight.push(i * maxRow + j)

  //   while (j - 1 >= 0) {
  //     j--;
  //     const arrayIndex = i * maxRow + j;
  //     if (squares[arrayIndex] === protentialWinner) {
  //       count++;
  //       highlight.push(arrayIndex);
  //     }
  //     else {
  //       break;
  //     }
  //   }

  //   i = rowNumber;
  //   j = colNumber;

  //   while (j + 1 < maxCol) {
  //     j++;
  //     const arrayIndex = i * maxRow + j;
  //     if (squares[arrayIndex] === protentialWinner) {
  //       count++;
  //       highlight.push(arrayIndex);
  //     }
  //     else {
  //       break;
  //     }
  //   }

  //   if (count === winCondition) {
  //     return { winner: protentialWinner, highlight: highlight };
  //   }

  //   //do hang doc
  //   i = rowNumber;
  //   j = colNumber;
  //   highlight = [];
  //   highlight.push(i * maxRow + j);
  //   count = 1;

  //   while (i - 1 >= 0) {
  //     i--;
  //     const arrayIndex = i * maxRow + j;
  //     if (squares[arrayIndex] === protentialWinner) {
  //       count++;
  //       highlight.push(arrayIndex);
  //     }
  //     else {
  //       break;
  //     }
  //   }

  //   i = rowNumber;
  //   j = colNumber;

  //   while (i + 1 < maxRow) {
  //     i++;
  //     const arrayIndex = i * maxRow + j;
  //     if (squares[arrayIndex] === protentialWinner) {
  //       count++;
  //       highlight.push(arrayIndex);
  //     }
  //     else {
  //       break;
  //     }
  //   }

  //   if (count === winCondition) {
  //     return { winner: protentialWinner, highlight: highlight };
  //   }

  //   //do duong cheo chinh
  //   i = rowNumber;
  //   j = colNumber;
  //   highlight = [];
  //   highlight.push(i * maxRow + j);
  //   count = 1;

  //   while (i - 1 >= 0 && j - 1 >= 0) {
  //     i--;
  //     j--;
  //     const arrayIndex = i * maxRow + j;
  //     if (squares[arrayIndex] === protentialWinner) {
  //       count++;
  //       highlight.push(arrayIndex);
  //     }
  //     else {
  //       break;
  //     }
  //   }

  //   i = rowNumber;
  //   j = colNumber;

  //   while (i + 1 < maxRow && j + 1 < maxCol) {
  //     i++;
  //     j++;
  //     const arrayIndex = i * maxRow + j;
  //     if (squares[arrayIndex] === protentialWinner) {
  //       count++;
  //       highlight.push(arrayIndex);
  //     }
  //     else {
  //       break;
  //     }
  //   }

  //   if (count === winCondition) {
  //     return { winner: protentialWinner, highlight: highlight };
  //   }

  //   //do duong cheo phu

  //   i = rowNumber;
  //   j = colNumber;
  //   highlight = [];
  //   highlight.push(i * maxRow + j);
  //   count = 1;

  //   while (i - 1 >= 0 && j + 1 < maxCol) {
  //     i--;
  //     j++;
  //     const arrayIndex = i * maxRow + j;
  //     if (squares[arrayIndex] === protentialWinner) {
  //       count++;
  //       highlight.push(arrayIndex);
  //     }
  //     else {
  //       break;
  //     }
  //   }

  //   i = rowNumber;
  //   j = colNumber;

  //   while (i + 1 < maxRow && j - 1 >= 0) {
  //     i++;
  //     j--;
  //     const arrayIndex = i * maxRow + j;
  //     if (squares[arrayIndex] === protentialWinner) {
  //       count++;
  //       highlight.push(arrayIndex);
  //     }
  //     else {
  //       break;
  //     }
  //   }

  //   if (count === winCondition) {
  //     return { winner: protentialWinner, highlight: highlight };
  //   }

  //   return null;
  // }


};

module.exports = ServiceGame;