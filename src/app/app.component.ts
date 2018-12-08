import {Component, HostBinding, OnInit} from '@angular/core';

class Node {
  numChildren = 0;
  numMeta = 0;
  numSiblings = 0;

  value = 0;

  parent: Node;

  children: Node[] = [];
  meta: number[] = [];

  unparsed: number[] = [];

  constructor(nums: number[], parent: Node = null) {
    this.numChildren = nums[0];
    this.numMeta = nums[1];

    this.unparsed = nums.slice(2);

    this.parent = parent;
  }

  parse(): number[] {
    while (true) {
      // create new child node:
      if (this.numChildren > this.children.length) {
        const child = new Node(this.unparsed, this);
        this.children.push(child);

        this.unparsed = child.parse();

        continue;
      }

      // write meta data
      this.meta = this.unparsed.slice(0, this.numMeta);

      // return rest;
      return this.unparsed.length > this.numMeta
        ? this.unparsed.slice(this.numMeta)
        : [];
    }
  }

  calculate(): number {
    if (this.value !== 0) {
      return this.value;
    }

    if (this.numChildren === 0) {
      this.value = this.meta.reduce((acc, a) => acc + a);
      return this.value;
    }

    let value = 0;
    for (const m of this.meta) {
      if (m < 1 || m > this.numChildren) {
        continue;
      }

      value += this.children[m - 1].calculate();
    }
    this.value = value;

    return this.value;
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
  async solve8b(input: string) {
    const nums = input.split(' ').map(n => parseInt(n, 10));

    const root = new Node(nums);

    root.parse();

    root.calculate();

    return root.value;
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
