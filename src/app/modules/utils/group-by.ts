type MapFunc<T = any> = (val: T, index?: number, arr?: T[]) => T;

export const groupBy = <T = any>(arr: T[], fn: MapFunc<T> | string) =>
  arr
    .map(typeof fn === 'string' ? (val: any) => val[fn] : fn)
    .reduce((acc, val, i) => {
      acc[val] = (acc[val] || []).concat(arr[i]);
      return acc;
    }, {});
