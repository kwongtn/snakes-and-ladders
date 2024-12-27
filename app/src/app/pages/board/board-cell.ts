import Handlebars from "handlebars";
import { Random } from "random";

import {
    IFixedCellContent,
    IImpactModifier,
    ITemplatedCellContent,
} from "./board";

export class Cell {
  text = '';
  selectedData: {
    [key: string]: {
      impact: number;
      displayText: string;
    };
  } = {};

  initData!: ITemplatedCellContent;

  private rand: Random;

  constructor(
    initData: ITemplatedCellContent | IFixedCellContent,
    seed: string = String(Math.random())
  ) {
    this.rand = new Random(seed);

    if ('positions' in initData) {
      // Means that it is a fixed cell content item
      this.text = (initData as IFixedCellContent).text;
      return;
    } else {
      this.initData = initData as ITemplatedCellContent;
      this.generateHandlebarsSubstitution();
      if (Object.keys(this.selectedData).length === 0) {
        this.text = this.initData.text;
      } else {
        this.text = Handlebars.compile(initData.text)(
          Object.fromEntries(
            Object.entries(this.selectedData).map(([k, v]) => {
              return [k, v.displayText];
            })
          )
        );
      }
    }
  }

  calculateImpact(base: number, impactObj?: IImpactModifier): number {
    let impact;
    if (impactObj) {
      switch (impactObj.modifierOp) {
        case 'add':
          impact = base + impactObj.value;
          break;
        case 'mul':
          impact = base * impactObj.value;
          break;

        default:
          throw new Error(`Unknown modifier ${impactObj.modifierOp}`);
      }
    } else {
      impact = base;
    }

    return impact;
  }

  generateHandlebarsSubstitution() {
    const template = this.initData.template;
    if (template === undefined) {
      return;
    }

    Object.entries(template).forEach(([k, v]) => {
      if (v.type === 'numberRange') {
        const selection = this.rand.int(v.ranges[0][0], v.ranges[0][1]);

        this.selectedData[k] = {
          // TODO: Add multi-range support
          impact: this.calculateImpact(selection, v.impact),
          displayText: String(selection),
        };
      } else if (v.type === 'text') {
        const selection = this.rand.choice(v.candidates);

        if (!selection) {
          throw new Error('Expected text selection but got undefined');
        }

        this.selectedData[k] = {
          // TODO: Add multi-range support
          impact: this.calculateImpact(selection.impact ?? 1, v.impact),
          displayText: selection.text,
        };
      }
    });
  }

  get _impact_sum() {
    let accumulator = 0;
    Object.entries(this.selectedData).forEach(([k, v]) => {
      accumulator += v.impact;
    });

    return accumulator;
  }

  get impact() {
    if (this.initData) {
      const rootImpactObj = this.initData.impact;

      if (typeof rootImpactObj === 'number') {
        return rootImpactObj;
      } else if (rootImpactObj) {
        switch (rootImpactObj.modifierOp) {
          case 'add':
            return this._impact_sum + rootImpactObj.value;
          case 'mul':
            let accumulator = 0;
            Object.entries(this.selectedData).forEach(([k, v]) => {
              accumulator += v.impact * rootImpactObj.value;
            });

            return accumulator;
          default:
            console.log(this.initData);
            console.log(this.selectedData);
            throw new Error(
              `Unknown impact modifierOp, expected one of 'add', 'mul' but got ${rootImpactObj.modifierOp}`
            );
        }
      } else {
        return this._impact_sum;
      }
    } else {
      return Infinity;
    }
  }
}
