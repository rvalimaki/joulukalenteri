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
  async solve10a(input: string) {
    const stars: Star[] = input.split('\n')
      .map(str => AppComponent.parseStar(str));

    let prevminy = 0;
    let prevmaxy = 0;

    let minx = 0;
    let maxx = 0;
    let miny = 0;
    let maxy = 0;

    this.debugStr = '';

    let ii = 0;

    for (; ii < 10000000; ii++) {
      minx = Number.MAX_SAFE_INTEGER;
      maxx = Number.MIN_SAFE_INTEGER;
      miny = Number.MAX_SAFE_INTEGER;
      maxy = Number.MIN_SAFE_INTEGER;

      for (const s of stars) {
        s.move();

        minx = Math.min(minx, s.x);
        miny = Math.min(miny, s.y);
        maxx = Math.max(maxx, s.x);
        maxy = Math.max(maxy, s.y);
      }

      if (prevminy === prevmaxy && prevminy === 0) {
        prevmaxy = maxy;
        prevminy = miny;
      }

      if (Math.abs(maxy - miny) > Math.abs(prevmaxy - prevminy)) {
        for (const s of stars) {
          s.rewind();
        }

        this.tulosta(stars, minx, maxx, miny, maxy);

        return ii;
      }

      prevmaxy = maxy;
      prevminy = miny;
    }

    return 'Eipä löytynyt :(';
  }

  tulosta(stars, minx, maxx, miny, maxy) {
    this.debugStr += '\n';
    for (let y = miny; y <= maxy; y++) {
      for (let x = minx; x <= maxx; x++) {
        this.debugStr += stars.some(s => s.x === x && s.y === y) ? '#' : '.';
      }

      this.debugStr += '\n';
    }
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
