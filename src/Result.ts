export class Result {
  private cache: Partial<
    Record<
      | 'sum'
      | 'mean'
      | 'median'
      | 'variance'
      | 'standardDeviation'
      | 'opsPerSec',
      number
    >
  > = {};

  public times: number[] = [];

  public push(time: number): void {
    this.times.push(time);
    this.cache = {};
  }

  public clear(): void {
    this.times = [];
    this.cache = {};
  }

  public get length(): number {
    return this.times.length;
  }

  public get sum(): number {
    if (!this.cache.sum)
      this.cache.sum = this.times.reduce((acc, t) => acc + t, 0);

    return this.cache.sum;
  }

  public get mean(): number {
    if (!this.cache.mean) this.cache.mean = this.sum / this.length;

    return this.cache.mean;
  }

  public get median(): number {
    if (this.cache.median === undefined) {
      const sorted = [...this.times].sort((a, b) => a - b);
      const midIndex = (sorted.length - 1) / 2;
      const f = Math.floor(midIndex);
      const c = Math.ceil(midIndex);

      this.cache.median = f === c ? sorted[f]! : (sorted[f]! + sorted[c]!) / 2;
    }

    return this.cache.median;
  }

  public get variance(): number {
    if (this.cache.variance === undefined) {
      const { mean } = this;
      const x = this.times.map((t) => (t - mean) ** 2);
      const sum = x.reduce((acc, n) => acc + n, 0);

      this.cache.variance = sum / x.length;
    }

    return this.cache.variance;
  }

  public get standardDeviation(): number {
    if (this.cache.standardDeviation === undefined)
      this.cache.standardDeviation = Math.sqrt(this.variance);

    return this.cache.standardDeviation;
  }

  public get opsPerSec(): number {
    if (this.cache.opsPerSec === undefined)
      this.cache.opsPerSec = (this.length / this.sum) * 1000;

    return this.cache.opsPerSec;
  }
}
