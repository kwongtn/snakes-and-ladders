import { NzCardModule } from "ng-zorro-antd/card";
import { NzGridModule } from "ng-zorro-antd/grid";

import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

import { Board } from "./board";

const yamlString = `
  board:
    size: 35

  content:
    - text: Cook the room an egg
      maxOccurence: 3
      impact: 50
      tags:
        - cooking

    - text: Confess to your crush
      maxOccurence: 1
      impact: 100
      tags:
        - confession
      
    - text: Take {{ x }} shot(s) of {{ y }}
      impact:
        modifierOp: mul
        value: 3
      tags:
        - drink
      template:
        x:
          # Gets a random number within the range
          type: numberRange
          impact:
            modifierOp: mul
            value: 1
          ranges: [[1, 4]]
        y:
          type: text
          candidates:
            - text: vodka
              impact: 5
              tags:
                - alcohol
            - text: wine
              impact: 4
              tags:
                - alcohol
            - text: soju
              impact: 3
              tags:
                - alcohol
            - text: beer
              impact: 2
              tags:
                - alcohol
            - text: orange juice
              impact: 1
              tags:
                - juice

    
  cells:
    - text: Dance for 30 seconds
      positions: [1, 22]
      tags:
        - tag1
        - tag2
  `;

const seed = String(Math.random());

@Component({
  selector: 'app-board',
  imports: [CommonModule, NzGridModule, NzCardModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.less',
})
export class BoardComponent {
  board!: Board;

  constructor() {
    this.board = new Board(yamlString, seed);
  }
}
