/// <reference path="../typings/index.d.ts" />
import { FileUtils } from '../src/file/readAllDirFiles';
import { TaskCompletionSource } from '../src/libs/utils';
import { expect } from 'chai';
import * as path from 'path';

describe('file.test', () => {
  const fileUtils = new FileUtils({ baseDir: './src', ext: ['.ts'] });

  it(' - FullFileName => FileInfo', () => {
    const testFileName = path.resolve('.', 'ts.test.json');
    const fileInfo = FileUtils.getFileInfoFromFullFileName(testFileName);
    const parsedFile = path.parse(testFileName);
    expect(fileInfo.ext).to.be.equal(parsedFile.ext);
    expect(fileInfo.path).to.be.equal(parsedFile.dir + path.sep);
    expect(fileInfo.fileName).to.be.equal(parsedFile.base);
  });

  it(' - AbsolutePath => RelativePath', () => {
    const testBaseDir = path.resolve('src');
    const testAbsoluteDir = path.resolve('src', 'file', 'fakedir');
    const relativePath = FileUtils.getRelativePathFromAbsolutePath(testBaseDir, testAbsoluteDir);
    expect(relativePath).to.be.equal('file' + path.sep + 'fakedir');
  });

  it(' - 获取文件夹下的文件', () => {
    const testPath = path.resolve('.', 'src');
    fileUtils.getCurrentFilesFromDir(testPath).then(files => {
      expect(files.length).to.be.equal(1);
      expect(files.some(file => file.fileName === 'index.ts'
        && file.ext === '.ts' && file.path === '')).to.be.ok;
    });
  });

  it(' - 获取文件夹', async () => {
    const tcs = new TaskCompletionSource();
    const directoryList = await FileUtils.getDirectoryList(path.resolve('./'));
    try {
      expect(directoryList.some(d => d === path.resolve('./src') + path.sep)).to.be.ok;
      tcs.setResult();
    } catch (e) {
      tcs.setError(e);
    }
    return tcs.promise;
  });

  it(' - isDirectory', async () => {
    const isDir = await FileUtils.isDirectory('./');
    const isNotDir = await FileUtils.isDirectory('./tsconfig.json');
    expect(isDir).to.be.ok;
    expect(isNotDir).to.not.be.ok;
  });

  it(' - isFile', async () => {
    const isNotFile = await FileUtils.isFile('./');
    const isFile = await FileUtils.isFile('./tsconfig.json');
    expect(isNotFile).to.not.be.ok;
    expect(isFile).to.be.ok;
  });

  it(' - 递归获取所有文件夹', async () => {
    const dirList = await FileUtils.getDirectoryListAll('./src');
    expect(dirList.some(p => p === path.resolve('src', 'interface') + path.sep)).to.be.ok;
    const blackListFilteredList = await FileUtils.getDirectoryListAll('./src', { blackList: [/interface/i] });
    expect(blackListFilteredList.length === dirList.length - 1).to.be.ok;
    const whiteListFilteredList = await FileUtils.getDirectoryListAll('.', { whiteList: [/typings/i] });
    expect(whiteListFilteredList.every(p => p.indexOf('typings') > -1)).to.be.ok;
  });


});
