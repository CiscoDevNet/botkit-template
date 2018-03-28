//
// Copyright (c) 2017 Cisco Systems
// Licensed under the MIT License
//

var debug = require('debug')('maze');
var fine = require('debug')('maze:fine');

//
// Maze library
//

function Maze(structure, walls, phrases, scores, treasure) {
    this.structure = structure
    this.walls = walls
    this.phrases = phrases
    this.scores = scores
    this.treasure = treasure

    this.score = 0
    this.position = [1, 1]
}

Maze.prototype.updateScore = function (points) {
    this.score += points
}

Maze.prototype.isOver = function () {
    return (this.score < 0)
}

Maze.prototype.isWon = function () {
    return (this.score >= this.scores[this.treasure])
}

Maze.prototype.tryMove = function (direction) {
    debug(`trying ${direction}`)
    var result
    switch (direction) {
        case 'up':
            result = this._move(this.position, -1, 0);
            break
        case 'down':
            result = this._move(this.position, 1, 0)
            break
        case 'left':
            result = this._move(this.position, 0, -1)
            break
        case 'right':
            result = this._move(this.position, 0, 1)
            break
        default:
            throw new Error("unknown direction");
    }

    // update position
    this.position = result.pos

    // update score
    this.updateScore(result.points)
    fine(`score updated to ${this.score}`)

    // return move outcome
    result.direction = direction
    result.score = this.score

    return result
}

Maze.prototype.up = function () {
    return this.tryMove('up');
}

Maze.prototype.down = function () {
    return this.tryMove('down');
}

Maze.prototype.left = function () {
    return this.tryMove('left');
}

Maze.prototype.right = function () {
    return this.tryMove('right');
}

Maze.prototype._getPointsFor = function (character) {
    if (!this.scores) {
        fine('no scoring for this game')
        return 0
    }

    let points = this.scores[character]
    if (!points) {
        return 0
    }

    return points
}

// Returns the outcome of the specified move, but does not actually perform it
Maze.prototype._move = function (pos, x, y) {
    let newX = pos[0] + x
    let newY = pos[1] + y

    // Check what's laying at new positiob
    let thingCharacter = this.structure[newX][newY]

    // What did we meed
    var story = this.phrases[thingCharacter]
    debug('> ' + story)

    // If this is a wall, stay at current position
    if (this.walls.includes(thingCharacter)) {

        fine(`staying at: ${pos}`)
        return {
            'success': false,
            'outcome': story,
            'thing': this.look(pos),
            'pos': pos,
            'points': this._getPointsFor(thingCharacter)
        }
    }

    // Move to new position
    var newPos = [newX, newY]
    fine(`now at: ${newPos}`)
    return {
        'success': true,
        'outcome': 'move successful',
        'thing': this.look(newPos),
        'pos': newPos,
        'points': this._getPointsFor(thingCharacter)
    }
}

// Returns what is laying at specified location
Maze.prototype.look = function (pos) {
    var x = pos[0]
    var y = pos[1]
    var thing = this.structure[x][y]
    return this.phrases[thing];
}

// Use this function if the output supports Newlines
Maze.prototype.buildMap = function () {
    var pos = this.position
    var poster = ""
    for (var y = 0; y < this.structure.length; y++) {
        var line = ""
        for (var x = 0; x < this.structure[0].length; x++) {
            var char = this.structure[y][x]
            if ((y == pos[0]) && x == pos[1]) {
                char = 'o'
            }
            line += char
        }
        poster += line + "\n"
    }
    debug("poster:\n" + poster)
    return poster
}

// Use this function if the output does NOT supports newlines
Maze.prototype.buildMapAsWrapped = function (linewidth, skipBorders) {

    var map = ""
    var pos = this.position
    for (var y = 0; y < this.structure.length; y++) {
        if (!(skipBorders && ((y == 0) || (y == this.structure.length - 1)))) {
            var line = ""
            for (var x = 0; x < this.structure[0].length; x++) {
                var char = this.structure[y][x]
                if ((y == pos[0]) && x == pos[1]) {
                    char = 'o'
                }
                line += char
            }
            var left = Math.round((linewidth - line.length) / 2)
            var mazeline = line.padStart(left + line.length, "-")
            map += mazeline.padEnd(linewidth, "-")
            map += " "
        }
    }
    debug("maze map:" + map)
    return map
}

// Used to initialize the maze
Maze.prototype.pickInitialPosition = function (emptyChar) {
    if (!emptyChar) emptyChar = ' '

    // Ping a random number, on an empty spot
    while (true) {
        var y = Math.round(Math.random() * (this.structure.length - 2) + 1)
        var x = Math.round(Math.random() * (this.structure[0].length - 2) + 1)
        fine(`picked x: ${x}, y: ${y}`)

        if (this.structure[y][x] == emptyChar) {
            fine(`position is clear, storing...`)
            return this._setPosition(x, y)
        }
    }
}

Maze.prototype._setPosition = function (x, y) {
    this.position = [y, x]
    return this.position
}

module.exports = Maze;

