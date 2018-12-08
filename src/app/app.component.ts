import {Component, HostBinding, OnInit} from '@angular/core';


// noinspection JSUnusedLocalSymbols
class LinkedList<T> {
  head: ListNode<T>;
  tail: ListNode<T>;

  length = 0;

  // noinspection JSUnusedGlobalSymbols
  addToEnd(val: T) {
    const node = new ListNode(val);

    if (this.head == null && this.tail == null) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail.next = node;
      node.prev = this.tail;

      this.tail = node;
    }

    this.length++;
  }
}

class ListNode<T> {
  value: T;
  prev: ListNode<T>;
  next: ListNode<T>;

  constructor(val: T) {
    this.value = val;
  }
}


class Node {
  numChildren = 0;
  numMeta = 0;
  numSiblings = 0;

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

  parse(solution: number = 0): { unparsed: number[], solution: number } {
    while (true) {
      // create new child node:
      if (this.numChildren > this.children.length) {
        const child = new Node(this.unparsed, this);
        this.children.push(child);

        const result = child.parse(solution);

        this.unparsed = result.unparsed;
        solution = result.solution;

        continue;
      }

      // write meta data
      this.meta = this.unparsed.slice(0, this.numMeta);
      for (const m of this.meta) {
        solution += m;
      }

      // return rest;
      const unparsed = this.unparsed.length > this.numMeta
        ? this.unparsed.slice(this.numMeta)
        : [];

      return {unparsed: unparsed, solution: solution};
    }
  }
}

enum Direction {
  UP,
  RIGHT,
  DOWN,
  LEFT
}

class Point {
  x: number;
  y: number;
  size: number;
  infinity = false;
}

class XY {
  x: number;
  y: number;
}

class Claim {
  distance = 0;
  point: Point;
  x: number;
  y: number;
}

class Step {
  name: string;
  done: number;
  prerequisites: Step[] = [];
  followups: Step[] = [];

  constructor(name: string) {
    this.name = name;
    this.prerequisites = [];
    this.followups = [];
    this.done = 60 + name.charCodeAt(0) - 64;
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

  maxDistance = 25;

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
  async solve8a(input: string) {
    const nums = input.split(' ').map(n => parseInt(n, 10));

    const root = new Node(nums);

    const result = root.parse();

    return result.solution;
  }

  // noinspection JSUnusedGlobalSymbols
  async solve6a(input: string) {
    const rows = input.split('\n');

    let xs = 10000;
    let xl = 0;
    let ys = 10000;
    let yl = 0;

    const points: Point[] = [];

    for (const r of rows) {
      const parts = r.split(', ');

      const x = parseInt(parts[0], 10);
      const y = parseInt(parts[1], 10);

      points.push({x: x, y: y, size: 1, infinity: false});

      xs = Math.min(xs, x);
      xl = Math.max(xl, x);
      ys = Math.min(ys, y);
      yl = Math.max(yl, y);
    }

    xs--;
    xl++;
    ys--;
    yl++;

    const limits = {xs: xs, xl: xl, ys: ys, yl: yl};

    const claims: Claim[][] = [];
    for (let x = 0; x <= xl; x++) {
      claims.push(new Array(yl));
    }

    // due to stack limit, we need to do this in two steps: first recurse all points with 35 manhattan distance...
    this.maxDistance = 35;
    for (const p of points) {
      const claim = {point: p, distance: 0, x: p.x, y: p.y};
      claims[p.x][p.y] = claim;

      this.expandClaim(claims, limits, claim);
    }

    // ...and then re-expand those with practically unlimited distance:
    const amount = this.maxDistance + 1;
    const half = amount / 2;
    this.maxDistance = 90;

    for (const p of points) {
      const claim = claims[p.x][p.y];

      const up = claim.y - amount >= limits.ys ? {x: claim.x, y: claim.y - amount} : null;
      const right = claim.x + amount <= limits.xl ? {x: claim.x + amount, y: claim.y} : null;
      const down = claim.y + amount <= limits.yl ? {x: claim.x, y: claim.y + amount} : null;
      const left = claim.x - amount >= limits.xs ? {x: claim.x - amount, y: claim.y} : null;

      const ne = claim.y - half >= limits.ys && claim.x + half <= limits.xl ? {x: claim.x + half, y: claim.y - half} : null;
      const se = claim.x + half <= limits.xl && claim.y + half <= limits.yl ? {x: claim.x + half, y: claim.y + half} : null;
      const sw = claim.y + half <= limits.yl && claim.x - half >= limits.xs ? {x: claim.x - half, y: claim.y + half} : null;
      const nw = claim.x - half >= limits.xs && claim.y - half >= limits.ys ? {x: claim.x - half, y: claim.y - half} : null;

      if (claim && claim.point) {
        if (up) {
          this.expandClaimDirection(claims, limits, claim, up, Direction.UP);
        }

        if (right) {
          this.expandClaimDirection(claims, limits, claim, right, Direction.RIGHT);
        }

        if (down) {
          this.expandClaimDirection(claims, limits, claim, down, Direction.DOWN);
        }

        if (left) {
          this.expandClaimDirection(claims, limits, claim, left, Direction.LEFT);
        }

        if (ne) {
          this.expandClaimDirection(claims, limits, claim, ne, Direction.RIGHT);
        }

        if (se) {
          this.expandClaimDirection(claims, limits, claim, se, Direction.DOWN);
        }

        if (sw) {
          this.expandClaimDirection(claims, limits, claim, sw, Direction.LEFT);
        }

        if (nw) {
          this.expandClaimDirection(claims, limits, claim, nw, Direction.UP);
        }
      }
    }

    for (let x = limits.xs; x < limits.xl; x++) {
      const miny = claims[x][limits.ys];
      const maxy = claims[x][limits.yl - 1];

      if (miny && miny.point) {
        miny.point.infinity = true;
      }
      if (maxy && maxy.point) {
        maxy.point.infinity = true;
      }
    }

    for (let y = limits.ys; y < limits.yl; y++) {
      const minx = claims[limits.xs][y];
      const maxx = claims[limits.xl - 1][y];

      if (minx && minx.point) {
        minx.point.infinity = true;
      }
      if (maxx && maxx.point) {
        maxx.point.infinity = true;
      }
    }

    this.debugStr = '';

    for (let y = ys; y <= yl; y++) {
      for (let x = xs; x <= xl; x++) {
        const c = claims[x][y];

        if (c != null) {
          if (c.point == null) {
            this.debugStr += '.';
            continue;
          }

          const zero = c.distance === 0 ? 0 : 1;

          this.debugStr += String.fromCharCode(64 + 32 * zero + (c.point.x * c.point.y) % 26);

          continue;
        }
        this.debugStr += ' ';
      }
      this.debugStr += '\n';
    }

    const finitePoints = points
      .filter(p => !p.infinity)
      .sort((a, b) => a.size > b.size ? -1 : 1);

    this.debugStr += '\n';
    for (const p of points) {
      this.debugStr += p.x + ', ' + p.y + ' ' + p.size + ' ' + String.fromCharCode(64 + (p.x * p.y) % 26) + ' ' + p.infinity;
      this.debugStr += '\n';
    }

    return finitePoints[0].size;
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

  private expandClaimDirection(claims: Claim[][], limits: { yl: number; xl: number; ys: number; xs: number },
                               claim: Claim, xy: XY, direction: Direction) {
    const distance = Math.abs(claim.point.x - xy.x) + Math.abs(claim.point.y - xy.y);

    if (distance > this.maxDistance) {
      return;
    }

    const exClaim = claims[xy.x][xy.y];
    if (exClaim == null) {
      const newClaim = {x: xy.x, y: xy.y, distance: distance, point: claim.point};

      claims[xy.x][xy.y] = newClaim;
      claim.point.size++;

      return this.expandClaim(claims, limits, newClaim);
    }

    if (exClaim.point === claim.point) {
      return;
    }


    if (exClaim.distance === distance) {
      if (exClaim.point) {
        exClaim.point.size--;
      }
      exClaim.point = null;

      switch (direction) {
        case Direction.UP:
          xy.y--;
          if (xy.y < limits.ys) {
            return;
          }
          this.expandClaimDirection(claims, limits, claim, xy, direction);
          break;
        case Direction.RIGHT:
          xy.x++;
          if (xy.x > limits.xl) {
            return;
          }
          this.expandClaimDirection(claims, limits, claim, xy, direction);
          break;
        case Direction.DOWN:
          xy.y++;
          if (xy.y > limits.yl) {
            return;
          }
          this.expandClaimDirection(claims, limits, claim, xy, direction);
          break;
        case Direction.LEFT:
          xy.x--;
          if (xy.x < limits.xs) {
            return;
          }
          this.expandClaimDirection(claims, limits, claim, xy, direction);
          break;
      }

      return;
    }

    if (exClaim.distance < distance) {
      return;
    }

    if (exClaim.point) {
      exClaim.point.size--;
    }

    exClaim.point = claim.point;
    exClaim.distance = distance;
    claim.point.size++;

    return this.expandClaim(claims, limits, exClaim);
  }

  private expandClaim(claims: Claim[][], limits: { yl: number; xl: number; ys: number; xs: number }, claim: Claim) {
    const up = claim.y - 1 >= limits.ys ? {x: claim.x, y: claim.y - 1} : null;
    const right = claim.x + 1 <= limits.xl ? {x: claim.x + 1, y: claim.y} : null;
    const down = claim.y + 1 <= limits.yl ? {x: claim.x, y: claim.y + 1} : null;
    const left = claim.x - 1 >= limits.xs ? {x: claim.x - 1, y: claim.y} : null;

    if (up) {
      this.expandClaimDirection(claims, limits, claim, up, Direction.UP);
    }

    if (right) {
      this.expandClaimDirection(claims, limits, claim, right, Direction.RIGHT);
    }

    if (down) {
      this.expandClaimDirection(claims, limits, claim, down, Direction.DOWN);
    }

    if (left) {
      this.expandClaimDirection(claims, limits, claim, left, Direction.LEFT);
    }
  }
}
