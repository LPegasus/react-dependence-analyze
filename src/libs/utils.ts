/* tslint:disable:max-line-length */
import * as fs from 'fs';
import * as path from 'path';

/**
 * @desc callback异步方法转Promise
 * @param  {Function} fn
 * @returns Function
 */
export function asyncWrapper<T extends Function, U>(fn: T): (...args: any[]) => Promise<U> {
  return function (...args: any[]): Promise<U> {
    return new Promise((r, j) => {
      const callback = function (err, ..._args) {
        if (!!err) j(err);
        else
          r.apply(null, _args);
      };
      fn.apply(null, args.concat([callback]));
    });
  };
}

/**
 * 常用 fs 函数 thunk 化
 */
export const fsAsync = {
  readdir: asyncWrapper<(path: string | Buffer, callback: (err: NodeJS.ErrnoException | null, files: string[]) => void) => void, string[]>(fs.readdir),
  stat: asyncWrapper<(path: string | Buffer, callback: (err: NodeJS.ErrnoException | null, stats: fs.Stats) => void) => void, fs.Stats>(fs.stat),
  readFile: asyncWrapper<(file: string | Buffer | number, callback: (err: NodeJS.ErrnoException | null, data: Buffer) => void) => void, Buffer>(fs.readFile),
  exists: asyncWrapper<(path: string | Buffer, callback: (exists: boolean) => void) => void, boolean>(fs.exists),
};

export class TaskCompletionSource<T> {
  promise: Promise<T>;
  constructor() {
    this.promise = new Promise<any>((r, j) => {
      this.setResult = r;
      this.setError = j;
    });
  }
  setResult: (value?: T) => void;
  setError: (err: any) => void;
};

export const forEachAsync = async function <T>(
  list: Array<T>,
  fn: (value?: any, index?: number, array?: Array<T>) => Promise<void>,
  ctx?: any): Promise<void> {
  const tcs: TaskCompletionSource<void> = new TaskCompletionSource<void>();
  const len = list.length;
  for (let i = 0; i < len; i++) {
    await fn.call(ctx, list[i], i, list);
  }
  tcs.setResult();
  return tcs.promise;
};

export const mapAsync = async function <T>(
  list: T[],
  fn: (value?: any, index?: number, array?: Array<T>) => Promise<T[]>,
  ctx?: any
): Promise<T[]> {
  const tcs: TaskCompletionSource<T[]> = new TaskCompletionSource<T[]>();
  const len = list.length;
  const res: T[] = [];
  for (let i = 0; i < len; i++) {
    res[i] = await fn.call(ctx, list[i], i, list);
  }
  tcs.setResult(res);
  return tcs.promise;
};

/**
 * @desc 相对路径转绝对路径
 * @param  {string} addr  路径 若绝对路径则直接返回该值
 * @param  {string} base? 是否基于某个路径
 * @return {string} 相对路径
 */
export function iifabsolutePath(addr: string, base?: string) {
  if (path.isAbsolute(addr)) return addr;
  if (!base) return path.resolve(addr);
  else if (path.isAbsolute(base)) {
    return path.resolve(base, addr);
  } else {
    return path.resolve(process.cwd(), addr);
  }
}
