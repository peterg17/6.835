
// GAME SETUP
var initialState = SKIPSETUP ? "playing" : "setup";
var gameState = new GameState({state: initialState});
var cpuBoard = new Board({autoDeploy: true, name: "cpu"});
var playerBoard = new Board({autoDeploy: SKIPSETUP, name: "player"});
var cursor = new Cursor();

// UI SETUP
setupUserInterface();

// selectedTile: The tile that the player is currently hovering above
var selectedTile = false;

// grabbedShip/Offset: The ship and offset if player is currently manipulating a ship
var grabbedShip = false;
var grabbedOffset = [0, 0];

var shipInfo = false;
var shipRollAngle = 0;

// isGrabbing: Is the player's hand currently in a grabbing pose
var isGrabbing = false;

// MAIN GAME LOOP
// Called every time the Leap provides a new frame of data
Leap.loop({ hand: function(hand) {
  // Clear any highlighting at the beginning of the loop
  unhighlightTiles();

  // Use the hand data to control the cursor's screen position
  // var cursorPosition = [0, 0];
  var cursorPosition = hand.screenPosition();
  cursorPosition[1] = cursorPosition[1] + 200;
  // console.log("cursor position: " + cursorPosition);
  cursor.setScreenPosition(cursorPosition);

  // Get the tile that the player is currently selecting, and highlight it
  selectedTile = getIntersectingTile(cursorPosition);
  if (selectedTile != false) {
    // make sure cursor is actually over a tile
    // console.log("gets here!");
    // console.log("tile selected is at row: " + selectedTile.row + " and col: " + selectedTile.col);
    highlightTile(selectedTile, Colors.GREEN);
  }

  // SETUP mode
  if (gameState.get('state') == 'setup') {
    background.setContent("<h1>battleship</h1><h3 style='color: #7CD3A2;'>deploy ships</h3>");
    //  Enable the player to grab, move, rotate, and drop ships to deploy them

    // console.log("grab strength is: " + hand.grabStrength);
    if (hand.grabStrength >= 0.95 || hand.pinchStrength >= 0.95) { // can change this threshold
      isGrabbing = true;
    } else {
      isGrabbing = false;
    }

    // Grabbing, but no selected ship yet. Look for one.
    if (!grabbedShip && isGrabbing) {
      shipInfo = getIntersectingShipAndOffset(cursorPosition);
        if (shipInfo != false) {
          // console.log("system thinks we are selecting a ship!");
          grabbedShip = shipInfo.ship;
          grabbedOffset = shipInfo.offset;
          // console.log("shp position is: ", grabbedShip);
          // console.log("offset is: ", grabbedOffset);
          // console.log("cursor position: ", cursorPosition);
        }
    }

    // Has selected a ship and is still holding it
    else if (grabbedShip && isGrabbing) {
      var normalizedShipPosition = [cursorPosition[0] - grabbedOffset[0], cursorPosition[1] - grabbedOffset[1]];
      grabbedShip.setScreenPosition(normalizedShipPosition);
      shipRollAngle = -hand.roll() - 0.7;
      // console.log("hand roll angle: " + shipRollAngle);
      grabbedShip.setScreenRotation(shipRollAngle);
    }

    // Finished moving a ship. Release it, and try placing it.
    else if (grabbedShip && !isGrabbing) {
      placeShip(grabbedShip);
      grabbedShip = false;
    }
  }

  // PLAYING or END GAME so draw the board and ships (if player's board)
  // Note: Don't have to touch this code
  else {
    if (gameState.get('state') == 'playing') {
      background.setContent("<h1>battleship</h1><h3 style='color: #7CD3A2;'>game on</h3>");
      turnFeedback.setContent(gameState.getTurnHTML());
    }
    else if (gameState.get('state') == 'end') {
      var endLabel = gameState.get('winner') == 'player' ? 'you won!' : 'game over';
      background.setContent("<h1>battleship</h1><h3 style='color: #7CD3A2;'>"+endLabel+"</h3>");
      turnFeedback.setContent("");
    }

    var board = gameState.get('turn') == 'player' ? cpuBoard : playerBoard;
    // Render past shots
    board.get('shots').forEach(function(shot) {
      var position = shot.get('position');
      var tileColor = shot.get('isHit') ? Colors.RED : Colors.YELLOW;
      highlightTile(position, tileColor);
    });

    // Render the ships
    playerBoard.get('ships').forEach(function(ship) {
      if (gameState.get('turn') == 'cpu') {
        var position = ship.get('position');
        var screenPosition = gridOrigin.slice(0);
        screenPosition[0] += position.col * TILESIZE;
        screenPosition[1] += position.row * TILESIZE;
        ship.setScreenPosition(screenPosition);
        if (ship.get('isVertical'))
          ship.setScreenRotation(Math.PI/2);
      } else {
        ship.setScreenPosition([-500, -500]);
      }
    });

    // If playing and CPU's turn, generate a shot
    if (gameState.get('state') == 'playing' && gameState.isCpuTurn() && !gameState.get('waiting')) {
      gameState.set('waiting', true);
      generateCpuShot();
    }
  }
}}).use('screenPosition', {scale: LEAPSCALE});

// processSpeech(transcript)
//  Is called anytime speech is recognized by the Web Speech API
// Input: 
//    transcript, a string of possibly multiple words that were recognized
// Output: 
//    processed, a boolean indicating whether the system reacted to the speech or not
var processSpeech = function(transcript) {
  // Helper function to detect if any commands appear in a string
  var userSaid = function(str, commands) {
    console.log("commands: " + commands);
    for (var i = 0; i < commands.length; i++) {
      if (str.indexOf(commands[i]) > -1)
        return true;
    }
    return false;
  };

  var processed = false;
  if (gameState.get('state') == 'setup') {
    // Detect the 'start' command, and start the game if it was said
    if (userSaid(transcript, ['start'])) {
      // console.log("transcript is: " + transcript);
      // console.log("start speech recognized!");
      gameState.startGame();
      processed = true;
    }
  }

  else if (gameState.get('state') == 'playing') {
    if (gameState.isPlayerTurn()) {
      // Detect the 'fire' command, and register the shot if it was said
      if (userSaid(transcript, ['fire'])) {
        console.log("fire command recognized!");
        registerPlayerShot();
        processed = true;
      }
    }

    else if (gameState.isCpuTurn() && gameState.waitingForPlayer()) {
      // TODO: 4.5, CPU's turn
      // Detect the player's response to the CPU's shot: hit, miss, you sunk my ..., game over
      // and register the CPU's shot if it was said
      if (false) {
        var response = "playerResponse";
        registerCpuShot(response);

        processed = true;
      }
    }
  }

  return processed;
};

// TODO: 4.4, Player's turn
// Generate CPU speech feedback when player takes a shot
var registerPlayerShot = function() {
  // TODO: CPU should respond if the shot was off-board
  if (!selectedTile) {
  }

  // If aiming at a tile, register the player's shot
  else {
    var shot = new Shot({position: selectedTile});
    var result = cpuBoard.fireShot(shot);

    console.log("result of fired shot: " + JSON.stringify(result));
    // Duplicate shot
    if (!result) return;

    // TODO: Generate CPU feedback in three cases
    // Game over
    if (result.isGameOver) {
      
      gameState.endGame("player");
      return;
    }
    // Sunk ship
    else if (result.sunkShip) {
      var shipName = result.sunkShip.get('type');
    }
    // Hit or miss
    else {
      var isHit = result.shot.get('isHit');
    }

    if (!result.isGameOver) {
      // TODO: Uncomment nextTurn to move onto the CPU's turn
      // nextTurn();
    }
  }
};

// TODO: 4.5, CPU's turn
// Generate CPU shot as speech and blinking
var cpuShot;
var generateCpuShot = function() {
  // Generate a random CPU shot
  cpuShot = gameState.getCpuShot();
  var tile = cpuShot.get('position');
  var rowName = ROWNAMES[tile.row]; // e.g. "A"
  var colName = COLNAMES[tile.col]; // e.g. "5"

  // TODO: Generate speech and visual cues for CPU shot
};

// TODO: 4.5, CPU's turn
// Generate CPU speech in response to the player's response
// E.g. CPU takes shot, then player responds with "hit" ==> CPU could then say "AWESOME!"
var registerCpuShot = function(playerResponse) {
  // Cancel any blinking
  unblinkTiles();
  var result = playerBoard.fireShot(cpuShot);

  // NOTE: Here we are using the actual result of the shot, rather than the player's response
  // In 4.6, you may experiment with the CPU's response when the player is not being truthful!

  // TODO: Generate CPU feedback in three cases
  // Game over
  if (result.isGameOver) {
    gameState.endGame("cpu");
    return;
  }
  // Sunk ship
  else if (result.sunkShip) {
    var shipName = result.sunkShip.get('type');
  }
  // Hit or miss
  else {
    var isHit = result.shot.get('isHit');
  }

  if (!result.isGameOver) {
    // TODO: Uncomment nextTurn to move onto the player's next turn
    // nextTurn();
  }
};

