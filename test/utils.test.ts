/// <reference path="../typings/index.d.ts" />
import {
  forEachAsync,
  fsAsync,
  TaskCompletionSource,
  iifabsolutePath,
  hasValidExtension,
  flatten,
  uniq
} from '../src/libs/utils';
import { expect } from 'chai';
import * as path from 'path';
import { Stats } from 'fs';

describe('utils.test', () => {
  it(' - forEachAsync', () => {
    const tcs = new TaskCompletionSource();
    const res = [];
    forEachAsync(['package.json', 'tslint.json', 'tsconfig.json'],
      async function (filename: string): Promise<void> {
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
      }, { a: 1 });
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

  it(' - hasValidExtension', () => {
    expect(hasValidExtension('file1')).to.be.equal(null);
    expect(hasValidExtension('file1.j1')).to.be.equal('.j1');
    expect(hasValidExtension('file1.coffee')).to.be.equal(null);
    expect(hasValidExtension('file1.coffee', ['coffee'])).to.be.equal('.coffee');
    expect(hasValidExtension('file1.coffee', ['.coffee'])).to.be.equal('.coffee');
  });

  it(' - flatten', () => {
    const res = flatten([[[1, 2]], 3]);
    expect(res[0] === 1 && res[1] === 2 && res[2] === 3).to.be.ok;
  });

  it(' - uniq', () => {
    const res = uniq([1, 1, 1, 2, 3, 3, 2, 2, 4, 5, 5, 4]);
    expect(res.join(',')).to.be.equal('1,2,3,4,5');
  });
});
