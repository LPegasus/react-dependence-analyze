/// <reference path="../../typings/globals/node/index.d.ts" />
import * as path from 'path';
import { IFileInfo, IReadAllDirFilesOptions, IGetDirectoryListAllOptions } from '../interface/IFile';
import { fsAsync, TaskCompletionSource, forEachAsync, iifabsolutePath } from '../libs/utils';

export class FileUtils {
  constructor(options: IReadAllDirFilesOptions = {}) {
    this.options = Object.assign({}, options);
    this.fullBaseDir = path.resolve(this.options.baseDir) + path.sep;
  }
  fullBaseDir: string;
  options: IReadAllDirFilesOptions = {
    ext: ['.jsx', '.js'], // 分析目标文件的后缀
    baseDir: './',
  };

  /**
   * @desc 获取当前路径下的所有 FileInfo
   * @param  {string} _path 相对文件路径
   * @returns Promise IFileInfo[]
   */
  async getCurrentFilesFromDir(_path: string): Promise<IFileInfo[]> {
    const curDir: string = path.resolve(this.fullBaseDir, _path) + path.sep;
    const files: string[] = await fsAsync.readdir(curDir);
    const fileList: IFileInfo[] = [];
    files.forEach(filename => {
      if (this.options.ext.some(ext => filename.endsWith(ext))) {
        const fullFileName = path.resolve(_path, filename);
        const fileInfo: IFileInfo = FileUtils.getFileInfoFromFullFileName(fullFileName);
        fileInfo.path = FileUtils.getRelativePathFromAbsolutePath(this.fullBaseDir, fileInfo.path);
        fileList.push(fileInfo);
      }
    });
    return fileList;
  }

  /**
   * @desc 绝对路径文件名转 FileInfo
   * @param  {string} fullFileName 文件名
   * @returns IFileInfo
   */
  static getFileInfoFromFullFileName(fullFileName: string): IFileInfo {
    const lastIndexOfSeparator = fullFileName.lastIndexOf(path.sep);
    const separatorLength = path.sep.length;
    const fileName = fullFileName.substr(lastIndexOfSeparator + separatorLength);
    const _path = fullFileName.substr(0, lastIndexOfSeparator + separatorLength);
    const ext = fileName.substr(fileName.lastIndexOf('.'));
    return {
      ext, path: _path, fileName
    };
  }

  /**
   * @desc 绝对路径转相对路径
   * @param  {string} baseDir 基础路径
   * @param  {string} absolutePath 绝对路径
   * @returns string 相对路径
   */
  static getRelativePathFromAbsolutePath(baseDir: string, absolutePath: string): string {
    const idx: number = absolutePath.indexOf(baseDir);
    if (idx !== 0) return absolutePath;
    return absolutePath.substr(baseDir.length + path.sep.length);
  }

  /**
   * @desc 获取路径下的所有文件夹列表
   * @param  {string} _path 绝对路径
   * @returns Promise<string[]> 文件夹的绝对路径列表
   */
  static async getDirectoryList(_path: string): Promise<string[]> {
    const files: string[] = await fsAsync.readdir(path.resolve(_path))
      .then(d => d.map(file => path.resolve(_path, file)));
    const res: string[] = [];
    await forEachAsync(files, async function(file) {
      if (await FileUtils.isDirectory(file)) {
        res.push(file + path.sep);
      }
    });
    return res;
  }

  /**
   * @desc 获取路径下的所有文件夹及子文件夹
   * @param  {string} rootPath 根路径
   * @param  {{Array<RegExp>, Array<RegExp>}} 忽略的路径
   * @returns Promise<T> where T: string[]
   */
  static async getDirectoryListAll(rootPath: string,
  opts: IGetDirectoryListAllOptions = {}): Promise<string[]> {
    const {blackList, whiteList} = opts;
    let directoryList: string[] = [];
    const directoryToScan: string[] = [iifabsolutePath(rootPath)];

    while (directoryToScan.length > 0) {
      const _path = directoryToScan.pop();
      const swapper: string[] = await FileUtils.getDirectoryList(_path);
      if (swapper.length === 0) continue;
      const filteredPathList = whiteList && whiteList.length ?
        swapper.filter(dirName => whiteList.some(reg => reg.test(dirName))) :
          blackList && blackList.length
          ? swapper.filter(dirName => !blackList.some(reg => reg.test(dirName))) : swapper;
      directoryList = directoryList.concat(filteredPathList);
      directoryToScan.push(...filteredPathList);
    }
    return directoryList;
  }

  /**
   * @desc 是否是文件夹
   * @param  {string} fullFileName
   * @returns Promise
   */
  static async isDirectory(fullFileName: string): Promise<boolean> {
    const stat = await fsAsync.stat(fullFileName);
    return stat.isDirectory();
  }

  /**
   * @desc 是否是文件
   * @param  {string} fullFileName
   * @returns Promise
   */
  static async isFile(fullFileName: string): Promise<boolean> {
    const stat = await fsAsync.stat(fullFileName);
    return stat.isFile();
  }

  static async getAllFiles(): IFileInfo[] {

  }

}
