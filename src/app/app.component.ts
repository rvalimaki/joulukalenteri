import {Component, HostBinding, OnInit} from '@angular/core';

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
  async solve3b(input: string) {
    const lines = input.split('\n');

    const lineA = this.parseDirections(lines[0]);
    const lineB = this.parseDirections(lines[1]);

    const origoX = 10000;
    const origoY = 10000;

    const taulukko = [];
    for (let y = 0; y < origoY * 2; y++) {
      taulukko[y] = [];

      for (let x = 0; x < origoX * 2; x++) {
        taulukko[y][x] = '.';
      }
    }

    const totalDistsLineA = [];
    for (let y = 0; y < origoY * 2; y++) {
      totalDistsLineA[y] = [];

      for (let x = 0; x < origoX * 2; x++) {
        totalDistsLineA[y][x] = 0;
      }
    }

    let x = origoX;
    let y = origoY;

    let risteykset = [];

    taulukko[y][x] = 'O';

    let totalDist = 0;

    try {
      for (const d of lineA) {
        switch (d.dir) {
          case 'R':
            for (let i = 0; i < d.dist; i++) {
              x++;

              totalDistsLineA[y][x] = ++totalDist;

              switch (taulukko[y][x]) {
                case 'O':
                  continue;
                case '.':
                  taulukko[y][x] = '-';
                  continue;
                case '|':
                case '-':
                  taulukko[y][x] = 'x';
              }
            }
            break;
          case 'L':
            for (let i = 0; i < d.dist; i++) {
              x--;

              totalDistsLineA[y][x] = ++totalDist;

              switch (taulukko[y][x]) {
                case 'O':
                  continue;
                case '.':
                  taulukko[y][x] = '-';
                  continue;
                case '|':
                case '-':
                  taulukko[y][x] = 'x';
              }
            }
            break;
          case 'U':
            for (let i = 0; i < d.dist; i++) {
              y--;

              totalDistsLineA[y][x] = ++totalDist;

              switch (taulukko[y][x]) {
                case 'O':
                  continue;
                case '.':
                  taulukko[y][x] = '|';
                  continue;
                case '|':
                case '-':
                  taulukko[y][x] = 'x';
              }
            }
            break;
          case 'D':
            for (let i = 0; i < d.dist; i++) {
              y++;

              totalDistsLineA[y][x] = ++totalDist;

              switch (taulukko[y][x]) {
                case 'O':
                  continue;
                case '.':
                  taulukko[y][x] = '|';
                  continue;
                case '|':
                case '-':
                  taulukko[y][x] = 'x';
              }
            }
            break;
        }
      }

      x = origoX;
      y = origoY;
      totalDist = 0;

      for (const d of lineB) {
        switch (d.dir) {
          case 'R':
            for (let i = 0; i < d.dist; i++) {
              x++;
              totalDist++;

              switch (taulukko[y][x]) {
                case 'O':
                  continue;
                case '.':
                  taulukko[y][x] = '_';
                  continue;
                case '|':
                case '-':
                case 'x':
                  taulukko[y][x] = 'X';
                  risteykset.push({
                    x: x - origoX, y: y - origoY, d: Math.abs(x - origoX) + Math.abs(y - origoY),
                    dd: totalDistsLineA[y][x] + totalDist
                  });
              }
            }
            break;
          case 'L':
            for (let i = 0; i < d.dist; i++) {
              x--;
              totalDist++;

              switch (taulukko[y][x]) {
                case 'O':
                  continue;
                case '.':
                  taulukko[y][x] = '_';
                  continue;
                case '|':
                case '-':
                case 'x':
                  taulukko[y][x] = 'X';
                  risteykset.push({
                    x: x - origoX, y: y - origoY, d: Math.abs(x - origoX) + Math.abs(y - origoY),
                    dd: totalDistsLineA[y][x] + totalDist
                  });
              }
            }
            break;
          case 'U':
            for (let i = 0; i < d.dist; i++) {
              y--;
              totalDist++;

              switch (taulukko[y][x]) {
                case 'O':
                  continue;
                case '.':
                  taulukko[y][x] = '[';
                  continue;
                case '|':
                case '-':
                case 'x':
                  taulukko[y][x] = 'X';
                  risteykset.push({
                    x: x - origoX, y: y - origoY, d: Math.abs(x - origoX) + Math.abs(y - origoY),
                    dd: totalDistsLineA[y][x] + totalDist
                  });
              }
            }
            break;
          case 'D':
            for (let i = 0; i < d.dist; i++) {
              y++;
              totalDist++;

              switch (taulukko[y][x]) {
                case 'O':
                  continue;
                case '.':
                  taulukko[y][x] = '[';
                  continue;
                case '|':
                case '-':
                case 'x':
                  taulukko[y][x] = 'X';
                  risteykset.push({
                    x: x - origoX, y: y - origoY, d: Math.abs(x - origoX) + Math.abs(y - origoY),
                    dd: totalDistsLineA[y][x] + totalDist
                  });
              }
            }
            break;
        }
      }
    } catch (e) {
      return x + ':' + y + ' kosahti';
    }
    risteykset = risteykset.sort((a, b) => a.dd < b.dd ? -1 : 1);

    return risteykset.map(r => r.x + ':' + r.y + ' dd' + r.dd).join(',');
  }

  parseDirections(input: string): { dir: string, dist: number }[] {
    return input.split(',')
      .map(str => ({dir: str[0], dist: Number.parseInt(str.substr(1), 10)}));
  }

  compileIntCodeProgram(integers: number[], noun: number, verb: number) {
    // elf magic codes:
    integers[1] = noun;
    integers[2] = verb;

    let operationPhase = -1;
    let currentOp = 0;
    let a = 0;
    let b = 0;
    let replace = 0;

    for (let i = 0; i < integers.length; i++) {
      operationPhase++;
      if (operationPhase > 3) {
        operationPhase = 0;
      }

      if (operationPhase === 0 && integers[i] === 99) {
        break;
      }

      switch (operationPhase) {
        case 0:
          currentOp = integers[i];
          continue;
        case 1:
          a = integers[i];
          continue;
        case 2:
          b = integers[i];
          continue;
        case 3:
          replace = integers[i];

          integers[replace] = this.runOp(currentOp, integers[a], integers[b]);
      }
    }
  }

  runOp(opCode: number, a: number, b: number): number {
    switch (opCode) {
      case 1:
        return a + b;
      case 2:
        return a * b;
      default:
        alert(opCode);
    }
    return 99;
  }

  solveStart() {
    this.solution = 'solving';

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
