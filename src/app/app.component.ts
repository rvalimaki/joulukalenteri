import {Component, HostBinding, OnInit} from '@angular/core';

interface Operation {
  op: number;
  m1: boolean;
  m2: boolean;
  m3: boolean;
  lastPhase: number;
}

@Component({
  selector: 'app-root',
  template: `
    <div class="blur" [style.background-image]="background"></div>

    <h1>Advent of Code 2019: {{latestSolutionName.replace('solve', '')}}</h1>

    <textarea id="input" name="input" #input></textarea>

    <textarea *ngIf="debugStr" id="debug" name="debug">{{debugStr}}</textarea>

    <div class="solution">
      <span>{{solution}}</span>

      <button (click)="solve(input.value).then()">Solve</button>
    </div>
  `,
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  solution = '';

  debugStr = null;

  backgroundImageUrl = '';

  solvingTickerInterval;

  constructor() {

  }

  @HostBinding('style.background-image')
  get background(): string {
    return 'url(' + this.backgroundImageUrl + ')';
  }

  get latestSolutionName(): string {
    const numSolutions = 25;
    const letters = ['b', 'a'];

    for (let i = numSolutions; i > 0; i--) {
      for (const letter of letters) {
        const fName = 'solve' + i + letter;

        if (this[fName] !== undefined) {
          return fName;
        }
      }
    }
  }

  ngOnInit() {
    const input = localStorage.getItem('kalenteriInput');

    const inputElement = document.getElementById('input');
    if (inputElement != null) {
      inputElement['value'] = input;
    }

    if (input !== '') {
      this.solve(input).then();
    }
  }

  async solve(input: string) {
    this.solveStart();

    const latestSolutionName = this.latestSolutionName;

    const rand = Number.parseInt(latestSolutionName.substr(5, latestSolutionName.length - 6), 10);
    // const rand = Math.ceil(Math.random() * 25);

    this.backgroundImageUrl = 'https://newevolutiondesigns.com/images/freebies/christmas-wallpaper-' + rand + '.jpg';

    localStorage.setItem('kalenteriInput', input);

    const solution = await this[latestSolutionName](input);

    this.solveFinish(solution);
  }

  // noinspection JSMethodCanBeStatic, JSUnusedGlobalSymbols
  async solve5b(input: string) {
    const intcodes = input.split(',').map(str => Number.parseInt(str, 10));

    return this.runIntCodeProgram(intcodes);
  }

  readOp(op: number): Operation {
    const ret: Operation = {op: 0, m1: false, m2: false, m3: false, lastPhase: 0};

    if (op >= 10000) {
      ret.m3 = true;
      op -= 10000;
    }
    if (op >= 1000) {
      ret.m2 = true;
      op -= 1000;
    }
    if (op >= 100) {
      ret.m1 = true;
      op -= 100;
    }
    ret.op = op;
    ret.lastPhase = this.getOpLastPhase(op);

    return ret;
  }

  getOpLastPhase(op: number) {
    console.log(op);
    switch (op) {
      case 1:
      case 2:
      case 7:
      case 8:
        return 3;
      case 3:
      case 4:
        return 1;
      case 5:
      case 6:
        return 2;
    }
    alert('Guru meditation error!!! ' + op);
    return -1;
  }

  runIntCodeProgram(integers: number[], in_put = 5): string {
    let operationPhase = -1;
    let currentOp: Operation = null;
    const p: number[] = [0, 0, 0, 0];

    let input = 0;
    let output = '';

    for (let i = 0; i < integers.length; i++) {
      operationPhase++;

      if (operationPhase === 0) {
        if (integers[i] === 99) {
          return parseInt(output, 10).toString(10);
        }

        currentOp = this.readOp(integers[i]);

        continue;
      }

      p[operationPhase] = integers[i];

      if (operationPhase === currentOp.lastPhase) {
        const a = currentOp.m1 ? p[1] : integers[p[1]];
        const b = currentOp.m2 ? p[2] : integers[p[2]];

        switch (currentOp.op) {
          case 1:
          case 2:
          case 7:
          case 8:
            integers[p[3]] = this.runOp(currentOp.op, a, b);
            break;
          case 3:
            if (currentOp.m1) {
              input = in_put;
            } else {
              integers[p[1]] = in_put;
            }
            break;
          case 4:
            if (currentOp.m1) {
              output += input;
            } else {
              output += integers[p[1]];
            }
            break;
          case 5:
            if (a !== 0) {
              i = b - 1;
            }
            break;
          case 6:
            if (a === 0) {
              i = b - 1;
            }
            break;

          default:
            alert('Guru levitation error!!!');
        }

        operationPhase = -1;
      }
    }
  }

  runOp(opCode: number, a: number, b: number): number {
    switch (opCode) {
      case 1:
        return a + b;
      case 2:
        return a * b;
      case 7:
        return a < b ? 1 : 0;
      case 8:
        return a === b ? 1 : 0;
      default:
        alert(opCode);
    }
    return 99;
  }

  solveStart() {
    this.solution = 'solving';
    this.debugStr = null;

    if (this.solvingTickerInterval != null) {
      clearInterval(this.solvingTickerInterval);
    }

    this.solvingTickerInterval = setInterval(() => this.solution += '.', 500);
  }

  solveFinish(solution) {
    if (this.solvingTickerInterval != null) {
      clearInterval(this.solvingTickerInterval);
    }

    this.solution = solution;
  }


}
