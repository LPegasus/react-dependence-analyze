/// <reference path="../typings/index.d.ts" />
import { forEachAsync, fsAsync, TaskCompletionSource, iifabsolutePath } from '../src/libs/utils';
import { expect } from 'chai';
import * as path from 'path';
import { Stats } from 'fs';

describe('utils.test', () => {
  it(' - forEachAsync', () => {
    const tcs = new TaskCompletionSource();
    const res = [];
    forEachAsync<string>(['package.json', 'tslint.json', 'tsconfig.json'],
    async function(filename: string): Promise<void> {
      const ctx: any = this;
      const stats: Stats = await fsAsync.stat(path.resolve(filename));
      try {
        expect(stats.isFile() && ctx.a === 1).to.be.ok;
      } catch (e) {
        tcs.setError(e);
      }
      res.push(filename);
      if (res.length === 3) {
        tcs.setResult();
      }
    }, {a: 1});
    return tcs.promise;
  });

  it(' - iifabsolutePath', () => {
    const relativePath1 = './node_modules/chai';
    const relativePath2 = '.';
    const absolutePath1 = path.resolve(relativePath1);
    const absolutePath2 = path.resolve(relativePath2);
    expect(iifabsolutePath(absolutePath1, relativePath2)).to.be.equal(absolutePath1);
    expect(iifabsolutePath(relativePath1)).to.be.equal(absolutePath1);
    expect(iifabsolutePath(relativePath1, absolutePath2)).to.be.equal(absolutePath1);
    expect(iifabsolutePath(relativePath1, relativePath2)).to.be.equal(absolutePath1);
  });
});
