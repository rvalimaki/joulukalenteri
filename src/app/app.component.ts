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
  async solve4b(input: string) {
    const range = input.split('-').map(str => Number.parseInt(str, 10));

    let num = range[0];
    const max = range[1];

    let numSolutions = 0;

    this.debugStr = '';

    do {
      num = await this.nextValid(num);
      if (num > max || num === 0) {
        break;
      }

      numSolutions++;

      this.debugStr += num + '\n';
      console.log(num);
    } while (num < max);

    return numSolutions;
  }

  resetCounts(digits: number[]): number[] {
    const counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (const d of digits) {
      counts[d]++;
    }

    return counts;
  }

  async nextValid(num: number): Promise<number> {
    num++;

    const digits = num.toString(10).split('').map(str => Number.parseInt(str, 10));

    for (let i = 0; i < digits.length; i++) {
      if (digits[i] === 0 && i > 0 && digits[i - 1] === 9) {
        digits[i] = 9;
      }
    }

    let counts = this.resetCounts(digits);
    let fill = false;

    let last = digits[0];
    for (let i = 1; i < digits.length; i++) {
      const pairNumber = counts.findIndex(nm => nm === 2);
      if (last === 9 && (pairNumber < 0 || pairNumber > 8) && (counts[9] !== 1) && i < digits.length - 1) {
        i = i - 2;

        if (i < 0) {
          return 0;
        }

        digits[i]++;
        fill = true;
        last = digits[i];
        counts = this.resetCounts(digits);
        continue;
      }

      if (digits[i] < last) {
        digits[i] = last;
        fill = true;
      }

      if (digits[i] >= last && fill) {
        digits[i] = last;
      }

      last = digits[i];
      counts = this.resetCounts(digits);
    }

    num = Number.parseInt(digits.join(''), 10);

    if (!counts.includes(2)) {
      num = await this.nextValid(num);
    }

    return num;
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
