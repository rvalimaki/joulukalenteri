import {Component, HostBinding, OnInit} from '@angular/core';

class Star {
  constructor(public x: number, public y: number, public dx: number, public dy: number) {

  }

  move() {
    this.x += this.dx;
    this.y += this.dy;
  }

  rewind() {
    this.x -= this.dx;
    this.y -= this.dy;
  }
}

@Component({
  selector: 'app-root',
  template: `
    <div class="blur" [style.background-image]="background"></div>

    <h1>Advent of Code: {{latestSolutionName.replace('solve', '')}}</h1>

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

  static parseStar(str: string): Star {
    const parts = str
      .replace(/ /g, '')
      .replace(/</g, ',')
      .replace(/>/g, ',')
      .split(',');

    return new Star(
      parseInt(parts[1], 10),
      parseInt(parts[2], 10),
      parseInt(parts[4], 10),
      parseInt(parts[5], 10)
    );
  }

  @HostBinding('style.background-image')
  get background(): string {
    return 'url(' + this.backgroundImageUrl + ')';
  }

  constructor() {

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

  async solve(input: string) {
    this.solveStart();

    const rand = Math.ceil(Math.random() * 25);

    this.backgroundImageUrl = 'https://newevolutiondesigns.com/images/freebies/christmas-wallpaper-' + rand + '.jpg';

    localStorage.setItem('kalenteriInput', input);

    const solution = await this[this.latestSolutionName](input);

    this.solveFinish(solution);
  }

  // noinspection JSMethodCanBeStatic, JSUnusedGlobalSymbols
  async solve1b(input: string) {
    const modules: number[] = input.split('\n')
      .map(str => Number.parseInt(str, 10));

    let fuel = 0;

    for (const mass of modules) {
      fuel += this.calculate1bFuel(mass);
    }

    return fuel;
  }

  calculate1aFuel(mass: number) {
    return Math.floor(mass / 3) - 2;
  }

  calculate1bFuel(mass: number) {
    let lastFuel = this.calculate1aFuel(mass);
    let totalFuel = 0;

    while (lastFuel > 0) {
      totalFuel += lastFuel;

      lastFuel = this.calculate1aFuel(lastFuel);
    }

    return totalFuel;
  }

  /*
    tulosta(stars, minx, maxx, miny, maxy) {
      this.debugStr += '\n';
      for (let y = miny; y <= maxy; y++) {
        for (let x = minx; x <= maxx; x++) {
          this.debugStr += stars.some(s => s.x === x && s.y === y) ? '#' : '.';
        }

        this.debugStr += '\n';
      }
    }
  */

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
