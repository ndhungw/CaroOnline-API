const ServiceGame = {

  calculateWinner(squares, winCondition, maxRow, maxCol, squareIndex) {

    const rowNumber = (squareIndex - (squareIndex % maxRow)) / maxRow
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
}

export default ServiceGame;