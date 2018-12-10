

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

