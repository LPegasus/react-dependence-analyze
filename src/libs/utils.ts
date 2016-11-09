import * as fs from 'fs';

/**
 * @desc callback异步方法转Promise
 * @param  {Function} fn
 * @returns Function
 */
export function asyncWrapper<T extends Function, U>(fn: T): (...args: any[]) =>　Promise<U> {
  return function (...args: any[]): Promise<U> {
    return new Promise((r, j) => {
      const callback = function(err, ..._args) {
        if (!!err) j(err);
        else
          r.apply(null, _args);
      }
      fn.apply(null, args.concat([callback]));
    });
  }
}

export const fsAsync = {
  readdir: asyncWrapper<(path: string | Buffer, callback: (err: NodeJS.ErrnoException | null, files: string[]) => void) => void, string[]>(fs.readdir),
  stat: asyncWrapper<(path: string | Buffer, callback: (err: NodeJS.ErrnoException | null, stats: fs.Stats) => void) => void, fs.Stats>(fs.stat),
  readFile: asyncWrapper<(file: string | Buffer | number, callback: (err: NodeJS.ErrnoException | null, data: Buffer) => void) => void, Buffer>(fs.readFile),
  exists: asyncWrapper<(path: string | Buffer, callback: (exists: boolean) => void) => void, boolean>(fs.exists),
};
