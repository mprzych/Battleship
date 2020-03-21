var view = {
  displayMainMessage: function (title, msg, buttonTxt, state = "start") {
    var modal = $('#mainModal').modal('show');
    modal.find('.modal-title').text(title);
    modal.find('.modal-body').text(msg);
    modal.find('.btn-secondary').text(buttonTxt);
    $('#mainModal').on('hide.bs.modal', function (e) {
      if (state == "end") {
        setTimeout(function () {
          window.location.reload();
        }, 1000);
      }
    })
  },
  displayMessage: function (msg) {
    $("#messageArea").html(msg);
    setTimeout(function () {
      $("#messageArea").html('');
    }, 1000);
  },
  displayHit: function (location) {
    var cell = document.getElementById(location);
    cell.setAttribute("class", "hit");
    cell.onclick = function () {
      return false;
    }
  },
  displayMiss: function (location) {
    var cell = document.getElementById(location);
    cell.setAttribute("class", "miss");
  }
};

var model = {
  boardSize: 7,
  numShips: 3,
  shipLength: 3,
  shipsSunk: 0,

  ships: [{
      locations: ["0", "0", "0"],
      hits: [0, 0, 0]
    },
    {
      locations: ["0", "0", "0"],
      hits: [0, 0, 0]
    },
    {
      locations: ["0", "0", "0"],
      hits: [0, 0, 0]
    }
  ],
  fire: function (guess) {
    for (var i = 0; i < this.numShips; i++) {
      var ship = this.ships[i];
      var index = ship.locations.indexOf(guess);
      if (index >= 0) {
        ship.hits[index] = 1;
        view.displayHit(guess);
        //view.displayMessage("Trafiony!");
        if (this.isSunk(ship)) {
          view.displayMessage("Zatopiony!!!");
          this.shipsSunk++;
        }
        return true;
      }
    }
    view.displayMiss(guess);
    //view.displayMessage("Pudło...")
    return false;
  },
  isSunk: function (ship) {
    for (var i = 0; i < this.shipLength; i++) {
      if (ship.hits[i] !== 1) {
        return false;
      }
    }
    return true;
  },
  generateShipLocations: function () {
    var locations;
    for (var i = 0; i < this.numShips; i++) {
      do {
        locations = this.generateShip();
      } while (this.collision(locations));
      this.ships[i].locations = locations;
    }
  },
  generateShip: function () {
    var direction = Math.floor(Math.random() * 2);
    var row, col;
    if (direction === 1) {
      row = Math.floor(Math.random() * this.boardSize);
      col = Math.floor(Math.random() * (this.boardSize - this.shipLength));
    } else {
      row = Math.floor(Math.random() * (this.boardSize - this.shipLength));
      col = Math.floor(Math.random() * this.boardSize);
    }
    var newShipLocations = [];
    for (var i = 0; i < this.shipLength; i++) {
      if (direction === 1) {
        newShipLocations.push(row + "" + (col + i));
      } else {
        newShipLocations.push((row + i) + "" + col);
      }
    }
    return newShipLocations;
  },
  collision: function (locations) {
    // console.log("loc " + locations);
    for (var i = 0; i < this.numShips; i++) {
      var ship = model.ships[i];
      // console.log("ship " + i + ship.locations);
      for (var j = 0; j < locations.length; j++) {
        //var plus = String(j+1);
        var j1 = ship.locations.indexOf(locations[String(j + 1).padStart(2, '0')]);
        // console.log(j, j1);
        if (ship.locations.indexOf(locations[j]) >= 0) {
          return true;
        }
      }
    }
    return false;
  }
};

var controller = {
  guesses: 0,

  processGuess: function (guess) {
    var location = parseGuess(guess);

    if (location) {
      this.guesses++;
      var hit = model.fire(location);
      if (hit && model.shipsSunk === model.numShips) {
        view.displayMainMessage("KONIEC GRY", "Zatopiłeś wszystkie moje okręty w " + this.guesses + " próbach", "ZAGRAJ PONOWNIE", "end");
      }
    }
  }
}

function parseGuess(guess) {

  if (guess === null || guess.length !== 2) {
    alert("Podaj poprawne współrzędne");
  } else {
    var row = guess.charAt(0);
    var column = guess.charAt(1);

    if (isNaN(row) || isNaN(column)) {
      alert("To nie są współrzędne");
    } else {
      return row + column;
    }
  }
  return null;
};

function init() {
  view.displayMainMessage("ZAGRAJ W OKRĘTY", "Do zatopienia masz 3 okręty trójmasztowe. Powodzenia!", "ZAGRAJ");

  model.generateShipLocations();

  var trs = document.getElementsByTagName("tr");
  var tds = null;
  for (var i = 0; i < trs.length; i++) {
    tds = trs[i].getElementsByTagName("td");
    for (var n = 0; n < trs.length; n++) {
      tds[n].onclick = function () {
        controller.processGuess(this.id);
      }
    }
  }
}

window.onload = init;