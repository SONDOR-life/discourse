// Used for Category.asyncFindByIds
//
// It's a cache that handles multiple lookups at a time.
export class MultiCache {
  constructor(cb) {
    this.cb = cb;
    this.values = new Map();
    this.fetchTimes = [];
  }

  reset() {
    this.values = new Map();
    this.fetchTimes = [];
  }

  hadTooManyCalls() {
    let t1 = this.fetchTimes[0];
    let t2 = this.fetchTimes[1];

    return t1 && t2 && t2 - t1 < 1000;
  }

  async fetch(ids) {
    this.fetchTimes.push(new Date());
    this.fetchTimes = this.fetchTimes.slice(-2);

    const notFound = [];

    for (const id of ids) {
      if (!this.values.has(id)) {
        notFound.push(id);
      }
    }

    if (notFound.length !== 0) {
      const request = this.cb(notFound);

      for (const id of notFound) {
        this.values.set(id, request);
      }
    }

    const response = new Map();

    for (const id of ids) {
      response.set(id, (await this.values.get(id)).get(id));
    }

    return response;
  }
}
