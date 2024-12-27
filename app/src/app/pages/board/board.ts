import { Random } from "random";
import { parse } from "yaml";

import { Cell } from "./board-cell";
import { IDiceProp } from "./board-dice";

export interface IFixedCellContent {
  index: number;
  text: string; // Temporary, prefarably will become ngTemplate
  positions: number[];
  tags: string[];
}

export interface IImpactModifier {
  modifierOp: 'add' | 'mul'; // Minus is negative addition, division is multiplication with decimal
  value: number;
}

export interface INumberRangeTemplate {
  type: 'numberRange';
  impact: IImpactModifier;
  ranges: [number, number][];
}

export interface ITextTemplate {
  type: 'text';
  impact?: IImpactModifier;
  candidates: {
    text: string;
    tags: string[];
    impact?: number;
  }[];
}

export interface ITemplatedCellContent {
  text: string;
  maxOccurence?: number;
  tags: string[];
  impact?: IImpactModifier | number;
  template?: { [key: string]: INumberRangeTemplate | ITextTemplate };
}

export interface IBoardProp {
  size: number;
  playerCount: number;
  lang: string;
  debug?: boolean;
  sort?: boolean;
}

export interface IGameProp {
  board: IBoardProp;
  dice: IDiceProp;
  // tags:;
  content: ITemplatedCellContent[];
  cells: IFixedCellContent[];
}

export class Board {
  gameProp!: IGameProp;
  cellData: Cell[] = [];

  rand: Random;
  seed: string;

  occurenceTracker: { [key: string]: number } = {};

  setFixedCells() {
    this.gameProp.cells.forEach((cell: IFixedCellContent) => {
      cell.positions.forEach((pos: number) => {
        this.cellData.splice(pos, 0, new Cell(cell, this.seed));
      });
    });
  }

  constructor(yamlString: string, seed: string = String(Math.random())) {
    this.gameProp = parse(yamlString);
    this.seed = seed;
    this.rand = new Random(this.seed);

    this.gameProp.content.forEach((val, index) => {
      if (val.maxOccurence) {
        this.occurenceTracker[`${index}`] = 0;
      }
    });

    for (
      let i = 0;
      i < this.gameProp.board.size - this.gameProp.cells.length;
      i++
    ) {
      if (this.cellData[i] === undefined) {
        let selectionIndex;
        /**
         * TODO: Check that if all cells have max occurence, and all max occurence does not add up to total number of cells
         * This will result in infinite loop.
         */
        do {
          selectionIndex =
            Math.ceil(this.rand.next() * 1000) % this.gameProp.content.length;
        } while (
          this.occurenceTracker[`${selectionIndex}`] >
          (this.gameProp.content[selectionIndex].maxOccurence ?? Infinity)
        );

        if (this.occurenceTracker[`${selectionIndex}`] !== undefined) {
          this.occurenceTracker[`${selectionIndex}`] =
            this.occurenceTracker[`${selectionIndex}`] + 1;
        }

        this.cellData[i] = new Cell(
          this.gameProp.content[selectionIndex],
          String(this.rand.float())
        );
      }
    }

    // Rearrange based on impact
    if (this.gameProp.board.sort) {
      this.cellData.sort((a, b) => {
        return a.impact - b.impact;
      });
    }
    this.setFixedCells();
  }

  get cellArray() {
    return this.cellData;
  }
}
