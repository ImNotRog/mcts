
// A Game State
export interface Game {
    player: number;
    hash: string;
    is_terminal: boolean;
    reward: number;
    get_children: () => Array<Game | null>;
}

export class Connect implements Game {
    static readonly width = 7;
    static readonly height = 7;
    static readonly in_a_row = 4;

    board: number[][];
    player: number;
    hash: string;
    is_terminal: boolean;
    reward: number;
    children: Array<Connect | null> | null = null;

    constructor(board?: number[][], player?: number) {
        const { width, height, in_a_row } = Connect;

        if (board && player) {
            if (board.length !== width || board[0].length !== height) throw "Incorrect board dimensions!";
            this.board = board;
            this.player = player;
        } else {
            this.board = Array(width).fill(0).map(() => Array(height).fill(0));
            this.player = 1;
        }

        this.hash = this.board.map((a) => a.map(b => b + 1).join('')).join('');

        // check terminal states
        this.is_terminal = true;
        this.reward = 0;
        for (let i = 0; i < width; i++) {
            if (this.board[i][height - 1] === 0) this.is_terminal = false;
        }

        try {

            // vertical
            for (let i = 0; i < width; i++) {
                for (let j = 0; j <= height - in_a_row; j++) {
                    let connected = this.board[i][j];
                    try {
                        if (connected === 0) throw 0;
                        for (let k = j + 1; k < j + in_a_row; k++) {
                            if (this.board[i][k] !== connected) throw 0;
                        }
                    } catch {
                        continue;
                    }
                    throw connected;
                }
            }

            // horizontal
            for (let i = 0; i <= width - in_a_row; i++) {
                for (let j = 0; j < height; j++) {
                    let connected = this.board[i][j];
                    try {
                        if (connected === 0) throw 0;
                        for (let k = i + 1; k < i + in_a_row; k++) {
                            if (this.board[k][j] !== connected) throw 0;
                        }
                    } catch {
                        continue;
                    }
                    // console.log(i,j);
                    throw connected;
                }
            }

            // diagonal up
            for (let i = 0; i <= width - in_a_row; i++) {
                for (let j = 0; j <= height - in_a_row; j++) {
                    let connected = this.board[i][j];
                    try {
                        if (connected === 0) throw 0;
                        for (let k = 1; k < in_a_row; k++) {
                            if (this.board[i + k][j + k] !== connected) throw 0;
                        }
                    } catch {
                        continue;
                    }
                    throw connected;
                }
            }

            // diagonal down
            for (let i = 0; i <= width - in_a_row; i++) {
                for (let j = 0; j <= height - in_a_row; j++) {
                    let connected = this.board[i + in_a_row - 1][j];
                    try {
                        if (connected === 0) throw 0;
                        for (let k = 1; k < in_a_row; k++) {
                            if (this.board[i + (in_a_row - 1) - k][j + k] !== connected) throw 0;
                        }
                    } catch {
                        continue;
                    }
                    throw connected;
                }
            }
        } catch (num) {
            this.is_terminal = true;
            if(typeof num === "number") this.reward = num;
        }

    }

    get_children() {
        const { width, height, in_a_row } = Connect;

        if (this.children) return this.children;
        this.children = [];
        for (let i = 0; i < width; i++) {
            if (this.board[i][height - 1] === 0) {
                let newBoard = this.board.map(a => a.slice());
                let j = 0;
                while (newBoard[i][j] !== 0) j++;
                newBoard[i][j] = this.player;
                let newGame = new Connect(newBoard, this.player * -1);
                this.children.push(newGame);
            } else {
                this.children.push(null);
            }
        }
        return this.children;

    }

    to_string() {
        return `GAME: PLAYER ${this.player === 1 ? 'L' : 'R'} (${this.player})\n${this.board.map(a => a.map(b => b === 1 ? 'L' : b === 0 ? ' ' : 'R').join(' | ')).join('\n')}`;
    }
}

export class MCTSNode {
    parent: null | MCTSNode;
    game: Game;
    Q: number = 0;
    N: number = 0;
    children: null | Array<MCTSNode | null>;

    constructor(game: Game, parent: null | MCTSNode) {
        this.game = game; this.parent = parent;
        this.children = null;
    }

    is_root(): boolean {
        return !this.parent;
    }

    make_root() {
        this.parent = null;
    }

    is_leaf(): boolean {
        return !this.children;
    }

    expand_children(): void {
        this.children = this.game.get_children().map((val) => {
            if (val === null) return null;
            return new MCTSNode(val, this);
        });
    }

    random_child() {
        if (this.children === null) throw "Random child called without children!";
        const filtered_children = this.children.filter(a => a !== null);
        const i = Math.floor(Math.random() * filtered_children.length);
        return filtered_children[i]!;
    }

    UCB(): number {
        if (this.N === 0) return Infinity;
        return this.Q * -this.game.player / this.N + Math.sqrt(4 * Math.log(this.parent!.N) / this.N);
    }

    backprop(q: number) {
        this.N++;
        this.Q += q;
        if (this.parent) this.parent.backprop(q);
    }

    rollout() {
        let current = this.game;
        while (!current.is_terminal) {
            const children = current.get_children().filter(a => a !== null);
            const i = Math.floor(Math.random() * children.length);
            current = children[i]!;
        }

        this.backprop(current.reward);
    }
}

export class MCTS {

    root: MCTSNode;

    constructor(root: Game) {
        this.root = new MCTSNode(root, null);
        this.iterate();
    }

    iterate() {
        let current = this.root;

        while (true) {
            if (current.game.is_terminal) {
                current.rollout();
                return;
            }

            if (current.is_leaf()) {
                if (current.N === 0) {
                    current.rollout();
                    return;
                } else {
                    current.expand_children();
                    current.random_child().rollout();
                    return;
                }
            }

            let max_child: null | MCTSNode = null;
            for (const child of current.children!) {
                if (max_child === null || (child !== null && child.UCB() > max_child.UCB())) {
                    max_child = child;
                }
            }
            current = max_child!;
        }
    }

    move(i: number) {
        if (this.root.children === null) this.root.expand_children();
        if (!this.root.children![i]) throw "Tried to move to null node!";
        this.root = this.root.children![i]!;
        this.root.make_root();
    }

    best_move() {
        if (this.root.game.is_terminal) throw "Tried to find best move at terminal position";
        if (this.root.children === null) this.root.expand_children();
        let maxI = -1;

        for (let i = 0; i < this.root.children!.length; i++) {
            const child = this.root.children![i];
            if (child !== null && (maxI === -1 || child.N >= this.root.children![maxI]!.N)) {
                maxI = i;
            }
        }

        return maxI;
    }

    to_string(): string {
        if (this.root.children === null) this.root.expand_children();
        return `${this.root.children!.map((a, i) => a === null ? '' : `${i + 1}: Q ${a.Q}, N ${a.N}, w ${a.Q / a.N}.\n`).join('')}`;
    }
}
