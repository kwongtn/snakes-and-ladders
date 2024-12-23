import { NzCardModule } from "ng-zorro-antd/card";
import { NzGridModule } from "ng-zorro-antd/grid";

import { Component } from "@angular/core";

interface BoardCellContent {
  index: number;
  content: string; // Temporary
}

@Component({
  selector: 'app-board',
  imports: [NzGridModule, NzCardModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.less',
})
export class BoardComponent {
  content: BoardCellContent[] = [];

  constructor() {
    for (let i = 0; i < 100; i++) {
      this.content.push({
        index: i,
        content: `Kinky stuff. You can put anything in here ${i}`,
      });
    }
  }
}
