/// <reference path="../typings/index.d.ts" />
import { FileUtils } from '../src/file/readAllDirFiles';
import { expect } from 'chai';
import * as path from 'path';

describe('file.test', () => {
  const fileUtils = new FileUtils({ baseDir: './src', ext: ['.ts'] });

  it(' - FullFileName => FileInfo', (done) => {
    const testFileName = path.resolve('.', 'ts.test.json');
    const fileInfo = FileUtils.getFileInfoFromFullFileName(testFileName);
    const parsedFile = path.parse(testFileName);
    expect(fileInfo.ext).to.be.equal(parsedFile.ext);
    expect(fileInfo.path).to.be.equal(parsedFile.dir + path.sep);
    expect(fileInfo.fileName).to.be.equal(parsedFile.base);
    done();
  });

  it(' - AbsolutePath => RelativePath', () => {
    const testBaseDir = path.resolve('src');
    const testAbsoluteDir = path.resolve('src', 'file', 'fakedir');
    const relativePath = FileUtils.getRelativePathFromAbsolutePath(testBaseDir, testAbsoluteDir);
    expect(relativePath).to.be.equal('file' + path.sep + 'fakedir');
  });

  it(' - 获取文件夹下的文件', (done) => {
    const testPath = path.resolve('.', 'src');
    fileUtils.getCurrentFilesFromDir(testPath).then(files => {
      expect(files.length).to.be.equal(1);
      expect(files.some(file => file.fileName === 'index.ts'
        && file.ext === '.ts' && file.path === '')).to.be.ok;
      done();
    });
  });
});
