/// <reference path="../../typings/globals/node/index.d.ts" />
import * as path from 'path';
import { IFileInfo, IReadAllDirFilesOptions } from '../interface/IFile';
import { fsAsync } from '../libs/utils';

export class FileUtils {
  constructor(options: IReadAllDirFilesOptions = {}) {
    this.options = Object.assign({}, options);
    this.fullBaseDir = path.resolve(this.options.baseDir) + path.sep;
  }
  fullBaseDir: string;
  options: IReadAllDirFilesOptions = {
    ext: ['.jsx', '.js'], // 分析目标文件的后缀
    baseDir: './',
  }

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


  static async getDirectoryList(_path: string): Promise<string[]> {
    const files: string[] = await fsAsync.readdir(path.resolve(_path));
    const res: string[] = [];
    for (let i = 0; i++ < files.length;) {
      if (await FileUtils.isDirectory(files[i])) {
        res.push(files[i]);
      }
    }
    return res;
  }

  static async isDirectory(fullFileName: string): Promise<boolean> {
    const stat = await fsAsync.stat(fullFileName);
    return stat.isDirectory();
  }
}
