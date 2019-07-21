import { Indicator, IndicatorInput } from "../indicator/indicator";
import { CandleData } from "../StockData";
/**
 * Created by AAravindan on 5/8/16.
 */
/**
 * Created by AAravindan on 5/8/16.
 */
"use strict";
export class TrueRangeInput extends IndicatorInput {
  public low: number[];
  public high: number[];
  public close: number[];
}

export class TrueRange extends Indicator {

  public static calculate = truerange;
  public result: number[];
  public generator: IterableIterator<number | undefined>;
  constructor(input: TrueRangeInput) {
    super(input);
    const lows = input.low;
    const highs = input.high;
    const closes = input.close;
    const format = this.format;

    if (lows.length !== highs.length) {
      throw new Error(("Inputs(low,high) not of equal size"));
    }

    this.result = [];

    this.generator = (function*(): IterableIterator<number | undefined > {
      let current: CandleData = yield;
      let previousClose, result;
      while (true) {
        if (previousClose === undefined) {
          previousClose = current.close;
          current = yield result;
        }
        result = Math.max(
            current.high - current.low,
            isNaN(Math.abs(current.high - previousClose)) ? 0 : Math.abs(current.high - previousClose),
            isNaN(Math.abs(current.low - previousClose)) ? 0 : Math.abs(current.low - previousClose),
        );
        previousClose = current.close;
        if (result !== undefined) {
          result = format(result);
        }
        current = yield result;
      }
    })();

    this.generator.next();

    lows.forEach((tick, index) => {
      const result = this.generator.next({
        high : highs[index],
        low  : lows[index],
        close: closes[index],
      });
      if (result.value !== undefined) {
        this.result.push(result.value);
      }
    });
  }

  public nextValue(price: CandleData): number | undefined {
     return this.generator.next(price).value;
  }

}

export function truerange(input: TrueRangeInput): number[] {
    Indicator.reverseInputs(input);
    const result = new TrueRange(input).result;
    if (input.reversedInput) {
        result.reverse();
    }
    Indicator.reverseInputs(input);
    return result;
}
