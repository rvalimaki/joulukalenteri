import {Component, HostBinding, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';


class LinkedList<T> {
  head: Node<T>;
  tail: Node<T>;

  length = 0;

  addToEnd(val: T) {
    const node = new Node(val);

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

class Node<T> {
  value: T;
  prev: Node<T>;
  next: Node<T>;

  constructor(val: T) {
    this.value = val;
  }
}

interface Shift {
  time?: string;
  awake: boolean;
  data: string;
  guardId?: string;
  sleepMinutes: number;
}

class Point {
  x: number;
  y: number;
  size: number;
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

@Component({
  selector: 'app-root',
  template: `
    <div class="blur" [style.background-image]="background"></div>

    <h1>Advent of Code: {{latestSolutionName.replace('solve', '')}}</h1>

    <textarea id="input" name="input" #input></textarea>

    <textarea *ngIf="debugStr" id="debug" name="debug" #debug>{{debugStr}}</textarea>

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

  constructor(private http: HttpClient) {

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

      points.push({x: x, y: y, size: 1});

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

    for (const p of points) {
      const claim = {point: p, distance: 0, x: p.x, y: p.y};
      claims[p.x][p.y] = claim;

      this.expandClaim(claims, limits, claim);
    }

    this.debugStr = '';

    const pi = 0;
    for (let y = ys; y <= yl; y++) {
      for (let x = xs; x <= xl; x++) {
        const c = claims[x][y];

        if (c != null) {
          this.debugStr += c.distance < 10 ? c.distance : '@';

          continue;
        }
        this.debugStr += ' ';
      }
      this.debugStr += '\n';

    }

    return 'VILHO';
  }

  async solve5b(input: string) {
    const units = 'abcdefghijklmnopqrstuvwxyz';

    let smallestUnit = null;
    let smallest = -1;

    this.debugStr = '';

    for (const unit of units) {
      const companionUnit = String.fromCharCode(unit.charCodeAt(0) - 32);

      const reducedInput = input
        .replace(new RegExp(unit, 'g'), '')
        .replace(new RegExp(companionUnit, 'g'), '');

      const length = await this.solve5a(reducedInput);

      this.debugStr += unit + ': ' + length + '\n';

      if (smallest < 0 || length < smallest) {
        smallestUnit = unit;
        smallest = length;
      }
    }

    return smallest;
  }

  async solve5a(input: string) {
    const linkedList = new LinkedList<string>();

    for (const c of input) {
      linkedList.addToEnd(c);
    }

    let curNode = linkedList.head;

    do {
      const next = curNode.next;

      if (next == null) {
        break;
      }

      if (this.polarize(curNode, next)) {
        if (linkedList.head === curNode) {
          next.next.prev = null;
          linkedList.head = next.next;

          curNode = linkedList.head;
        } else if (linkedList.tail === next) {
          linkedList.tail = curNode.prev;
          linkedList.tail.next = null;

          curNode = linkedList.tail;
          break;
        } else {
          const prev = curNode.prev;
          prev.next = next.next;
          next.next.prev = prev;

          curNode = prev;
        }

        linkedList.length -= 2;
      } else {
        // this.debugStr += curNode.value;

        curNode = curNode.next;
      }
    }
    while (curNode.next != null);

    return linkedList.length;
  }

  async solve4b(input: string) {
    const rows = input.split('\n');

    const rowObjs = [];

    const fabricReservations = {};

    const candidates = {};

    for (const row of rows) {
      const parts = row.replace('[', '').split('] ');

      rowObjs.push({
        time: parts[0],
        data: parts[1]
      });
    }

    rowObjs.sort((a, b) => a.time.localeCompare(b.time, [], {numeric: true}));

    const shifts: Shift[] = [];

    let shift: Shift = null;

    for (const row of rowObjs) {
      if (row.data.startsWith('Guard #')) {
        if (shift != null) {
          shifts.push(this.shiftEnd(shift));
        }

        shift = this.shiftStart(row);

        continue;
      }

      shift = this.shiftAdd(shift, row);

    }

    shifts.push(this.shiftEnd(shift));

    this.debugStr = '';

    for (const row of shifts) {
      this.debugStr += row.time + ' #' + row.guardId + '  \t' + row.data + ' ' + row.sleepMinutes + '\n';
    }

    const guards = {};
    const guardArr = [];

    for (const s of shifts) {
      if (guards[s.guardId] == null) {
        guards[s.guardId] = {
          guardId: s.guardId,
          shifts: [],
          sleepMinutes: 0,
          avgSleepMinutes: 0,
          data: Array.from(Array(60), () => 0),
          highest: 0
        };

        guardArr.push(guards[s.guardId]);
      }

      const g = guards[s.guardId];
      g.shifts.push(s);

      for (let m = 0; m < 60; m++) {
        const add = s.data[m] === '#' ? 1 : 0;
        g.sleepMinutes += add;
        g.data[m] += add;

        if (g.data[m] > g.highest) {
          g.highest = g.data[m];
        }
      }

      g.avgSleepMinutes = g.sleepMinutes / g.shifts.length;
    }

    guardArr.sort((a, b) => a.highest > b.highest ? -1 : 1);

    this.debugStr += '\n';

    for (const row of guardArr) {

      this.debugStr += '#' + row.guardId + '  \t' + row.data.join('') + ' ' + row.sleepMinutes + '\n';
    }

    const sleepiest = guardArr[0];

    let sleepiestMinute = -1;
    let minuteValue = -1;
    for (let m = 0; m < 60; m++) {
      if (sleepiest.data[m] > minuteValue) {
        minuteValue = sleepiest.data[m];
        sleepiestMinute = m;
      }
    }

    this.debugStr += '\n';
    this.debugStr += sleepiestMinute + ':' + minuteValue;
    this.debugStr += '\n';


    return sleepiest.guardId * sleepiestMinute;
  }

  async solve4a(input: string) {
    const rows = input.split('\n');

    const rowObjs = [];

    const fabricReservations = {};

    const candidates = {};

    for (const row of rows) {
      const parts = row.replace('[', '').split('] ');

      rowObjs.push({
        time: parts[0],
        data: parts[1]
      });
    }

    rowObjs.sort((a, b) => a.time.localeCompare(b.time, [], {numeric: true}));

    const shifts: Shift[] = [];

    let shift: Shift = null;

    for (const row of rowObjs) {
      if (row.data.startsWith('Guard #')) {
        if (shift != null) {
          shifts.push(this.shiftEnd(shift));
        }

        shift = this.shiftStart(row);

        continue;
      }

      shift = this.shiftAdd(shift, row);

    }

    shifts.push(this.shiftEnd(shift));

    this.debugStr = '';

    for (const row of shifts) {
      this.debugStr += row.time + ' #' + row.guardId + '  \t' + row.data + ' ' + row.sleepMinutes + '\n';
    }

    const guards = {};
    const guardArr = [];

    for (const s of shifts) {
      if (guards[s.guardId] == null) {
        guards[s.guardId] = {
          guardId: s.guardId,
          shifts: [],
          sleepMinutes: 0,
          avgSleepMinutes: 0,
          data: Array.from(Array(60), () => 0)
        };

        guardArr.push(guards[s.guardId]);
      }

      const g = guards[s.guardId];
      g.shifts.push(s);

      for (let m = 0; m < 60; m++) {
        const add = s.data[m] === '#' ? 1 : 0;
        g.sleepMinutes += add;
        g.data[m] += add;
      }

      g.avgSleepMinutes = g.sleepMinutes / g.shifts.length;
    }

    guardArr.sort((a, b) => a.sleepMinutes > b.sleepMinutes ? -1 : 1);

    this.debugStr += '\n';

    for (const row of guardArr) {

      this.debugStr += '#' + row.guardId + '  \t' + row.data.join('') + ' ' + row.sleepMinutes + '\n';
    }

    const sleepiest = guardArr[0];

    let sleepiestMinute = -1;
    let minuteValue = -1;
    for (let m = 0; m < 60; m++) {
      if (sleepiest.data[m] > minuteValue) {
        minuteValue = sleepiest.data[m];
        sleepiestMinute = m;
      }
    }

    return sleepiest.guardId * sleepiestMinute;
  }


  async solve3b(input: string) {
    const rows = input.split('\n');

    const fabricReservations = {};

    const candidates = {};

    for (const row of rows) {
      const parts = row.replace(' @ ', ',')
        .replace(': ', ',')
        .replace('x', ',')
        .split(',');

      const id = parts[0].substr(1);

      candidates[id] = true;

      const x_pos = parseInt(parts[1], 10);
      const y_pos = parseInt(parts[2], 10);
      const width = parseInt(parts[3], 10);
      const height = parseInt(parts[4], 10);

      for (let x = x_pos; x < x_pos + width; x++) {

        for (let y = y_pos; y < y_pos + height; y++) {
          const key = x + 'x' + y;
          if (fabricReservations[key] == null) {
            fabricReservations[key] = [];
          }

          fabricReservations[key].push(id);

          if (fabricReservations[key].length > 1) {
            for (const resId of fabricReservations[key]) {
              candidates[resId] = false;
            }
          }
        }
      }
    }

    for (const i in candidates) {
      if (candidates[i]) {
        return i;
      }
    }

    return 'not found';
  }


  async solve3a(input: string) {
    const rows = input.split('\n');

    const fabricReservations = {};

    for (const row of rows) {
      const parts = row.replace(' @ ', ',')
        .replace(': ', ',')
        .replace('x', ',')
        .split(',');

      const x_pos = parseInt(parts[1], 10);
      const y_pos = parseInt(parts[2], 10);
      const width = parseInt(parts[3], 10);
      const height = parseInt(parts[4], 10);

      for (let x = x_pos; x < x_pos + width; x++) {

        for (let y = y_pos; y < y_pos + height; y++) {
          const key = x + 'x' + y;
          if (fabricReservations[key] == null) {
            fabricReservations[key] = 0;
          }

          fabricReservations[key]++;
        }
      }
    }

    let squares = 0;

    for (const i in fabricReservations) {
      if (fabricReservations[i] > 1) {
        squares++;
      }
    }

    return squares;
  }

  async solve2b(input: string) {
    const rows = input.split('\n');

    for (let i = 0; i < rows.length - 1; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        const result = this.solve2bChecksum(rows[i], rows[j]);

        if (result != null) {
          return result;
        }
      }
    }

    return 'not found';
  }

  solve2bChecksum(a: string, b: string) {
    for (let i = 0; i < a.length; i++) {
      if (this.removeCharAt(a, i) === this.removeCharAt(b, i)) {
        return this.removeCharAt(a, i);
      }
    }

    return null;
  }

  async solve2a(input: string) {
    const rows = input.split('\n');

    let pairs = 0;
    let threes = 0;

    for (const row of rows) {
      const info = this.solve2aChecksum(row);

      if (info.hasPairs) {
        pairs++;
      }
      if (info.hasThrees) {
        threes++;
      }
    }

    return pairs * threes;
  }

  solve2aChecksum(row) {
    const marks = {};

    for (const c of row) {
      if (marks[c] == null) {
        marks[c] = 0;
      }

      marks[c]++;
    }

    let hasPairs = false;
    let hasThrees = false;

    for (const i in marks) {
      if (marks[i] === 2) {
        hasPairs = true;
      }
      if (marks[i] === 3) {
        hasThrees = true;
      }
    }

    return {hasPairs: hasPairs, hasThrees: hasThrees};
  }

  async solve1a(input: string) {
    const rows = input.split('\n');

    const freqs = {};

    return this.sub1a(rows, 0, freqs);
  }

  sub1a(rows, lastFreq, freqs) {
    for (const row of rows) {
      const freqChange = parseInt(row, 10);

      lastFreq += freqChange;

      if (freqs[lastFreq] === true) {
        return lastFreq;
      }

      freqs[lastFreq] = true;
    }

    return this.sub1a(rows, lastFreq, freqs);
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

  private removeCharAt(a: string, i: number) {
    if (i === 0) {
      return a.substr(1);
    }
    if (i === a.length - 1) {
      return a.substr(0, a.length - 1);
    }

    return a.substr(0, i + 1) + a.substr(i + 2);
  }


  private shiftStart(row: any): Shift {
    const shift: Shift = {data: '', awake: true, sleepMinutes: 0};

    shift.time = row.time.split(' ')[0];
    shift.guardId = row.data.replace('Guard #', '').replace(' begins shift', '');

    return shift;
  }

  private shiftAdd(shift: Shift, row: any): Shift {
    shift.time = row.time.split(' ')[0];

    const minute = parseInt(row.time.split(':').pop(), 10);

    for (let m = shift.data.length; m < minute; m++) {
      shift.data += shift.awake ? '.' : '#';
      shift.sleepMinutes += shift.awake ? 0 : 1;
    }

    shift.awake = !shift.awake;

    return shift;
  }

  private shiftEnd(shift: Shift): Shift {
    for (let m = shift.data.length; m < 60; m++) {
      shift.data += shift.awake ? '.' : '#';
      shift.sleepMinutes += shift.awake ? 0 : 1;
    }

    return shift;
  }

  private polarize(a: Node<string>, b: Node<string>) {
    return Math.abs(a.value.charCodeAt(0) - b.value.charCodeAt(0)) === 32;
  }

  private claim(claims: Claim[][], xy: XY): Claim {
    return claims[xy.x][xy.y];
  }

  private manhattanDistance(point: Point, xy: XY) {
    return Math.abs(point.x - xy.x) + Math.abs(point.y - xy.y);
  }

  private expandClaimDirection(claims: Claim[][], limits: { yl: number; xl: number; ys: number; xs: number }, claim: Claim, xy: XY) {
    if (this.manhattanDistance(claim.point, xy) > 40) {
      return;
    }

    const exClaim = this.claim(claims, xy);
    if (exClaim == null) {
      const newClaim = {x: xy.x, y: xy.y, distance: this.manhattanDistance(claim.point, xy), point: claim.point};

      claims[xy.x][xy.y] = newClaim;
      claim.point.size++;

      this.expandClaim(claims, limits, newClaim);

      console.log('new', xy.x, xy.y);

      return;
    }

    if (exClaim.point === claim.point) {
      return;
    }


    if (exClaim.distance === this.manhattanDistance(claim.point, xy)) {
      if (exClaim.point) {
        exClaim.point.size--;
      }
      exClaim.point = null;

      console.log('sama', xy.x, xy.y);
      return;
    }

    if (exClaim.distance > this.manhattanDistance(claim.point, xy)) {
      if (exClaim.point) {
        exClaim.point.size--;
      }

      exClaim.point = claim.point;
      exClaim.distance = this.manhattanDistance(claim.point, xy);
      claim.point.size++;

      this.expandClaim(claims, limits, exClaim);

      console.log('muuttuu', xy.x, xy.y);
    }
  }

  private expandClaim(claims: Claim[][], limits: { yl: number; xl: number; ys: number; xs: number }, claim: Claim) {

    const up = claim.y - 1 >= limits.ys ? {x: claim.x, y: claim.y - 1} : null;
    const right = claim.x + 1 <= limits.xl ? {x: claim.x + 1, y: claim.y} : null;
    const down = claim.y + 1 <= limits.yl ? {x: claim.x, y: claim.y + 1} : null;
    const left = claim.x - 1 >= limits.xs ? {x: claim.x - 1, y: claim.y} : null;

    if (up && up.y < claim.y) {
      this.expandClaimDirection(claims, limits, claim, up);
    }

    if (right && right.x > claim.x) {
      this.expandClaimDirection(claims, limits, claim, right);
    }

    if (down && down.y > claim.y) {
      this.expandClaimDirection(claims, limits, claim, down);
    }


    if (left && left.x < claim.x) {
      this.expandClaimDirection(claims, limits, claim, left);
    }


    // right

    // down

    // left
  }
}
