"use strict";
import { Indicator, IndicatorInput } from "../indicator/indicator";
import { LinkedList } from "../Utils/LinkedList";
import { MAInput } from "./SMA";

export class WMA extends Indicator {

  public static calculate = wma;
  public period: number;
  public price: number[];
  public result: number[];
  public generator: IterableIterator<number | undefined>;
  constructor(input: MAInput) {
    super(input);
    const period = input.period;
    const priceArray = input.values;
    this.result = [];
    this.generator = (function*() {
      const data = new LinkedList();
      const denominator = period * (period + 1) / 2;

      while (true) {
        if ((data.length) < period) {
          data.push(yield);
        } else {
          data.resetCursor();
          let result = 0;
          for (let i = 1; i <= period; i++) {
            result = result + (data.next() * i / (denominator));
          }
          const next = yield result;
          data.shift();
          data.push(next);
        }
      }
    })();

    this.generator.next();

    priceArray.forEach((tick, index) => {
      const result = this.generator.next(tick);
      if (result.value !== undefined) {
        this.result.push(this.format(result.value));
      }
    });
  }

    // STEP 5. REMOVE GET RESULT FUNCTION
  public nextValue(price: number): number | undefined {
      const result = this.generator.next(price).value;
      if (result !== undefined) {
          return this.format(result);
      }
  }

}

export function wma(input: MAInput): number[] {
      Indicator.reverseInputs(input);
      const result = new WMA(input).result;
      if (input.reversedInput) {
          result.reverse();
      }
      Indicator.reverseInputs(input);
      return result;
  }
