
// Compiled Typescript Code lmfao

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Connect = /** @class */ (function () {
    function Connect(board, player) {
        var width = Connect.width, height = Connect.height, in_a_row = Connect.in_a_row;
        if (board && player) {
            if (board.length !== width || board[0].length !== height)
                throw "Incorrect board dimensions!";
            this.board = board;
            this.player = player;
        }
        else {
            this.board = Array(width).fill(0).map(function () { return Array(height).fill(0); });
            this.player = 1;
        }
        this.hash = this.board.map(function (a) { return a.map(function (b) { return b + 1; }).join(''); }).join('');
        // check terminal states
        this.is_terminal = true;
        this.reward = 0;
        for (var i = 0; i < width; i++) {
            if (this.board[i][height - 1] === 0)
                this.is_terminal = false;
        }
        try {
            // vertical
            for (var i = 0; i < width; i++) {
                for (var j = 0; j <= height - in_a_row; j++) {
                    var connected = this.board[i][j];
                    try {
                        if (connected === 0)
                            throw 0;
                        for (var k = j + 1; k < j + in_a_row; k++) {
                            if (this.board[i][k] !== connected)
                                throw 0;
                        }
                    }
                    catch (_a) {
                        continue;
                    }
                    throw connected;
                }
            }
            // horizontal
            for (var i = 0; i <= width - in_a_row; i++) {
                for (var j = 0; j < height; j++) {
                    var connected = this.board[i][j];
                    try {
                        if (connected === 0)
                            throw 0;
                        for (var k = i + 1; k < i + in_a_row; k++) {
                            if (this.board[k][j] !== connected)
                                throw 0;
                        }
                    }
                    catch (_b) {
                        continue;
                    }
                    // console.log(i,j);
                    throw connected;
                }
            }
            // diagonal up
            for (var i = 0; i <= width - in_a_row; i++) {
                for (var j = 0; j <= height - in_a_row; j++) {
                    var connected = this.board[i][j];
                    try {
                        if (connected === 0)
                            throw 0;
                        for (var k = 1; k < in_a_row; k++) {
                            if (this.board[i + k][j + k] !== connected)
                                throw 0;
                        }
                    }
                    catch (_c) {
                        continue;
                    }
                    throw connected;
                }
            }
            // diagonal down
            for (var i = 0; i <= width - in_a_row; i++) {
                for (var j = 0; j <= height - in_a_row; j++) {
                    var connected = this.board[i + in_a_row - 1][j];
                    try {
                        if (connected === 0)
                            throw 0;
                        for (var k = 1; k < in_a_row; k++) {
                            if (this.board[i + (in_a_row - 1) - k][j + k] !== connected)
                                throw 0;
                        }
                    }
                    catch (_d) {
                        continue;
                    }
                    throw connected;
                }
            }
        }
        catch (num) {
            this.is_terminal = true;
            this.reward = num;
        }
    }
    Connect.prototype.get_children = function () {
        var width = Connect.width, height = Connect.height, in_a_row = Connect.in_a_row;
        if (this.children)
            return this.children;
        this.children = [];
        for (var i = 0; i < width; i++) {
            if (this.board[i][height - 1] === 0) {
                var newBoard = this.board.map(function (a) { return a.slice(); });
                var j = 0;
                while (newBoard[i][j] !== 0)
                    j++;
                newBoard[i][j] = this.player;
                var newGame = new Connect(newBoard, this.player * -1);
                this.children.push(newGame);
            }
            else {
                this.children.push(null);
            }
        }
        return this.children;
    };
    Connect.prototype.to_string = function () {
        return "GAME: PLAYER ".concat(this.player === 1 ? 'L' : 'R', " (").concat(this.player, ")\n").concat(this.board.map(function (a) { return a.map(function (b) { return b === 1 ? 'L' : b === 0 ? ' ' : 'R'; }).join(' | '); }).join('\n'));
    };
    Connect.width = 7;
    Connect.height = 6;
    Connect.in_a_row = 4;
    return Connect;
}());
var MCTSNode = /** @class */ (function () {
    function MCTSNode(game, parent) {
        this.Q = 0;
        this.N = 0;
        this.game = game;
        this.parent = parent;
    }
    MCTSNode.prototype.is_root = function () {
        return !this.parent;
    };
    MCTSNode.prototype.make_root = function () {
        this.parent = null;
    };
    MCTSNode.prototype.is_leaf = function () {
        return !this.children;
    };
    MCTSNode.prototype.expand_children = function () {
        var _this = this;
        if(!this.children) {
            this.children = this.game.get_children().map(function (val) {
                if (val === null)
                    return null;
                return new MCTSNode(val, _this);
            });
        }
    };
    MCTSNode.prototype.random_child = function () {
        if (this.children === null)
            throw "Random child called without children!";
        var filtered_children = this.children.filter(function (a) { return a !== null; });
        var i = Math.floor(Math.random() * filtered_children.length);
        return filtered_children[i];
    };
    MCTSNode.prototype.UCB = function () {
        if (this.N === 0)
            return Infinity;
        return this.Q * -this.game.player / this.N + 2 * Math.sqrt( Math.log(this.parent.N) / this.N);
    };
    MCTSNode.prototype.backprop = function (q) {
        this.N++;
        this.Q += q;
        if (this.parent)
            this.parent.backprop(q);
    };
    MCTSNode.prototype.rollout = function () {
        var current = this.game;
        while (!current.is_terminal) {
            var children = current.get_children().filter(function (a) { return a !== null; });
            var i = Math.floor(Math.random() * children.length);
            current = children[i];
        }
        this.backprop(current.reward);
    };
    return MCTSNode;
}());
var MCTS = /** @class */ (function () {
    function MCTS(root) {
        this.root = new MCTSNode(root, null);
        this.iterate();
    }
    MCTS.prototype.iterate = function () {
        var current = this.root;
        while (true) {
            if (current.game.is_terminal) {
                current.rollout();
                return;
            }
            if (current.is_leaf()) {
                if (current.N === 0) {
                    current.rollout();
                    return;
                }
                else {
                    current.expand_children();
                    current.random_child().rollout();
                    return;
                }
            }
            var max_child = null;
            for (var _i = 0, _a = current.children; _i < _a.length; _i++) {
                var child = _a[_i];
                if (max_child === null || (child !== null && child.UCB() > max_child.UCB())) {
                    max_child = child;
                }
            }
            current = max_child;
        }
    };
    MCTS.prototype.move = function (i) {
        if (!this.root.children)
            this.root.expand_children();
        if (!this.root.children[i])
            throw "Tried to move to null node!";
        this.root = this.root.children[i];
        this.root.make_root();
    };
    MCTS.prototype.best_move = function () {
        if (this.root.game.is_terminal)
            throw "Tried to find best move at terminal position";
        if (this.root.children === null)
            this.root.expand_children();
        var maxI = -1;
        for (var i = 0; i < this.root.children.length; i++) {
            var child = this.root.children[i];
            if (child !== null && (maxI === -1 || child.N >= this.root.children[maxI].N)) {
                maxI = i;
            }
        }
        return maxI;
    };
    MCTS.prototype.to_string = function () {
        if (this.root.children === null)
            this.root.expand_children();
        return "".concat(this.root.children.map(function (a, i) { return a === null ? '' : "".concat(i + 1, ": Q ").concat(a.Q, ", N ").concat(a.N, ", w ").concat(a.Q / a.N, ".\n"); }).join(''));
    };
    return MCTS;
}());

// Actual code starts here

const STEP = 20;
const MAXITERS = 1000;
// const MAXITERS = 1;

const STATE = {
    iterations: 0,
    move_made: [],
}

console.log('working');
const mcts = new MCTS(new Connect());

self.addEventListener("message", (event) => { 
    STATE.move_made.push(event.data);
});

const main = () => {

    if(STATE.move_made.length > 0) {
        // console.log(mcts.root.game.to_string());
        // console.log('SWITCH A')
        mcts.move(STATE.move_made[0]);
        STATE.move_made = STATE.move_made.slice(1);
        STATE.iterations = 0;
    }
    else if(STATE.iterations < STEP * MAXITERS) {
        // console.log('SWITCH B')
        for (let j = 0; j < STEP; j++) {
            mcts.iterate();
        }
        STATE.iterations += STEP;
    } else {
        // console.log('SWITCH C')
        setTimeout(() => {
            main();
        }, 200);
        return;
    }

    mcts.root.expand_children();
    if(mcts.root.N === 0) mcts.root.rollout();
    postMessage({
        type: 'computation',
        board: mcts.root.game.board,
        policy: mcts.root.game.is_terminal ? Array(Connect.width).fill(0) : mcts.root.children.map(child => child ? child.N / mcts.root.N : 0),
        eval: mcts.root.Q / mcts.root.N,
        iterations: STATE.iterations
    })

    console.log(mcts.root.N);

    requestAnimationFrame(() => {
        main();
    });
}

main();