const { createNewGame } = require("../models/game-model");
const games = require("../models/game-model");
const Room = require("../models/room-model");
const User = require("../models/user-model");
const roomService = require("../services/roomService");
const UserService = require("./userService");

const ServiceGame = {

  async makeMove(game, position) {

    const newBoard = game.board.slice();
    newBoard[position] = game.playerMoveNext;
    game.board = newBoard;
    game.history.push({ player: game.playerMoveNext, position: position });
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
  },

  calculateGameScore: async (game) => {

    const room = await Room.findById(game.roomId);

    const player1 = await User.findById(room.Player1);

    const player2 = await User.findById(room.Player2);

    console.log(player1);
    console.log(player2);

    if (!player1 || !player2) {
      return;
    }

    if (game.winner === 3) {
      player1.gamesWon = player1.gamesWon + 1;
      player1.trophies = player1.trophies + 1;

      player2.gamesWon = player2.gamesWon + 1;
      player2.trophies = player2.trophies + 1;

      await player1.save();
      await player2.save();

      return;
    }

    let winner;
    let loser;
    if (game.winner === 1) {
      winner = player1;
      loser = player2;
    } else if (game.winner === 2) {
      winner = player2;
      loser = player1;
    }
    else {
      return;
    }

    winner.gamesWon = winner.gamesWon + 1;
    loser.gamesLost = loser.gamesLost + 1;

    if (winner.trophies < loser.trophies) {
      winner.trophies = winner.trophies + 1;
      loser.trophies = loser.trophies > 0 ? loser.trophies - 1 : 0;
    }

    winner.trophies = winner.trophies + 1;
    loser.trophies = loser.trophies > 0 ? loser.trophies - 1 : 0;

    await winner.save();
    await loser.save();

    return {winner, loser};


    // const room = Room.findById(game.roomId);

    // //Tie
    // if (game.winner === 3) {
    //   await UserService.wonGame(room.Player1);
    //   await UserService.wonGame(room.Player2);
    //   await UserService.changeTrophies(room.Playe1, 1);
    //   await UserService.changeTrophies(room.Player2, 1);

    //   return;
    // }

    // let winner = null;
    // let loser = null;

    // if (game.winner === 1) {
    //   winner = room.Player1;
    //   loser = room.Player2;

    // }
    // else if (game.winner === 2) {
    //   winner = room.Player2;
    //   loser = room.Player1;
    // }

    // const winUser = await UserService.wonGame(winner);
    // const lostUser = await UserService.lostGame(loser);

    // //execptional rule
    // if (lostUser.trophies > winner.trophies) {
    //   UserService.changeTrophies(loser, -1);
    //   UserService.changeTrophies(winner, 1);
    // }

    // UserService.changeTrophies(loser, -1);
    // UserService.changeTrophies(winner, 1);
  }


};

module.exports = ServiceGame;