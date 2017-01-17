import * as path from 'path';
import { flatten } from '../libs/utils';

import {
  IFileInfo,
  IGetDirectoryListAllOptions,
  IGetAllFilesOptions
} from '../interface/IFile';

import FileInfo from './FileInfo';

import {
  fsAsync,
  TaskCompletionSource,
  forEachAsync,
  mapAsync,
  iifabsolutePath,
  hasValidExtension
} from '../libs/utils';

const DEPENDENCE_IGNORE_LIST: string[] = [
  'react', 'react-dom', 'moment', 'antd', 'react-router', 'lodash', 'classnames', 'babel-polyfill'
];

const DEAULT_OPTIONS: IGetAllFilesOptions = {
  ext: ['.jsx', '.js'], // 分析目标文件的后缀
  baseDir: './',
  blackList: [/node_modules/i, /typings/i],
  whiteList: [],
  ignoreModule: DEPENDENCE_IGNORE_LIST
};

export const allResult = new Set<Array<any>>([]);
// const allResult = new Set<Array<any>>([]);

export class FileUtils {
  constructor(options?: IGetAllFilesOptions) {
    const { ext = []} = options;
    if (ext.length) {
      options.ext = ext.map(d => /^\..+/i.test(d) ? d : `.${d}`);
    }
    this.options = Object.assign({}, DEAULT_OPTIONS, options);
    this.fullBaseDir = path.resolve(this.options.baseDir) + path.sep;
    this._cache_ = new Map<string, boolean>();
    this._allFiles = null;
  }
  readonly fullBaseDir: string;
  readonly options: IGetAllFilesOptions;
  private _allFiles?: IFileInfo[];

  // 标记是否存在
  private _cache_: Map<string, boolean>;

  get allFiles(): IFileInfo[] {
    return this._allFiles;
  }

  /**
   * @desc 获取当前路径下的所有 FileInfo
   * @param  {string} _path 路径
   * @returns Promise IFileInfo[]
   */
  async getCurrentFilesFromDir(_path: string = ''): Promise<IFileInfo[]> {
    return await FileUtils.getCurrentFilesFromDir(_path, this.fullBaseDir, this.options);
  }

  /**
   * @desc 获取所有文件
   * @returns Promise IFileInfo[]
   */
  async getAllFiles(): Promise<IFileInfo[]> {
    if (this._allFiles !== null) {
      return Promise.resolve(this._allFiles);
    }
    const files = await FileUtils.getAllFiles(this.options);
    this._allFiles = files;
    files.forEach(f => this._cache_.set(f.toString(), true));
    return files;
  }

  async analyzeDependence(): Promise<void> {
    const exts = this.options.ext;
    await forEachAsync(this._allFiles, async (fileInfo: IFileInfo) => {
      fileInfo.dependenceList = await FileUtils.getDependenceList(
        fileInfo,
        this.options.ignoreModule,
        (f) => {
          const _f = Object.assign({}, f);
          const validExt = hasValidExtension(_f.fileName, exts);
          if (validExt && exts.indexOf(validExt) >= 0) {
            if (this._cache_.get(f.toString())) {
              return f;
            }
          } else if (exts.some(ext => {
            f.ext = ext;
            f.fileName = f.fileName + ext;
            if (this._cache_.get(f.toString())) {
              return true;
            } else {
              f.ext = _f.ext;
              f.fileName = _f.fileName;
              return false;
            }
          })) {
            return f;
          } else if (exts.some(ext => { // start: 0.1.2 +support import foldername
            f.ext = ext;
            f.fileName = `${f.fileName}${path.sep}index${ext}`;
            if (this._cache_.get(f.toString())) {
              return true;
            } else {
              f.ext = _f.ext;
              f.fileName = _f.fileName;
              return false;
            }
          })) {
            return f;
          } // end: 0.1.2
          return null;
        }
      );
    });
  }

  /**
   * @param  {string} _path 路径
   * @param  {string} fullBaseDir 基础路径 default: ''
   * @param  {IReadAllDirFilesOptions} options 配置 default: DEAULT_OPTIONS
   * @returns Promise<IFileInfo[]>
   */
  static async getCurrentFilesFromDir(
    _path: string,
    fullBaseDir: string = '',
    options: IGetAllFilesOptions = DEAULT_OPTIONS
  ): Promise<IFileInfo[]> {
    const curDir: string = iifabsolutePath(_path, fullBaseDir) + path.sep;
    const files: string[] = await fsAsync.readdir(curDir);
    const fileList: IFileInfo[] = [];
    files.forEach(filename => {
      if (options.ext.some(ext => filename.endsWith(ext))) {
        const fullFileName = path.resolve(_path, filename);
        const fileInfo: IFileInfo = FileUtils.getFileInfoFromFullFileName(fullFileName);
        // fileInfo.path = FileUtils.getRelativePathFromAbsolutePath(fullBaseDir, fileInfo.path);
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
    const separatorLength: number = path.sep.length;
    const fileName: string = fullFileName.substr(lastIndexOfSeparator + separatorLength);
    const _path: string = fullFileName.substr(0, lastIndexOfSeparator + separatorLength);
    const lidx: number = fileName.lastIndexOf('.');
    const ext = lidx > 0 ? fileName.substr(lidx) : null;
    return new FileInfo({
      ext, path: _path, fileName: fileName
    });
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
    await forEachAsync(files, async function (file) {
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

  /**
   * @desc 获取所有文件
   * @param  {IGetAllFilesOptions} opts 参数
   *    default: {
   *      baseDir: string       根路径
   *      ext: string[]         后缀
   *      blackList: RegExp[]   黑名单
   *      whiteList: RegExp[]   白名单
   *    }
   * @returns Promise
   */
  static async getAllFiles(
    opts: IGetAllFilesOptions = {
      baseDir: '',
      ext: [],
      blackList: [],
      whiteList: []
    }): Promise<IFileInfo[]> {
    const { baseDir, ext, blackList, whiteList, } = opts;
    const fullBaseDir = iifabsolutePath(baseDir);

    // 获取所有文件夹
    const allDirList = await FileUtils.getDirectoryListAll(fullBaseDir, { blackList, whiteList });
    allDirList.push(fullBaseDir);

    // 获取所有文件
    const fileInfoList: IFileInfo[] = flatten<IFileInfo>(await mapAsync<IFileInfo>(allDirList, async dir => {
      return await FileUtils.getCurrentFilesFromDir(dir, fullBaseDir, { baseDir, ext });
    }));

    return fileInfoList;
  }

  /**
   * @desc 获取文件的依赖 文件的依赖引入必须全部现在最前面
   * @param  {IFileInfo} file  读取的文件
   * @param  {string[]=DEPENDENCE_IGNORE_LIST} ignoreList
   * @param  {function} ifRecord 判断是否记录的钩子(比如，文件是否存在)
   * @returns Promise
   */
  static async getDependenceList(
    file: IFileInfo,
    ignoreList: string[] = DEPENDENCE_IGNORE_LIST,
    ifRecord?: (fileInfo: IFileInfo) => IFileInfo): Promise<IFileInfo[]> {
    const filePath = path.resolve(file.path, file.fileName);
    const fileMeta: string = await fsAsync.readFile(filePath, 'utf-8');

    const tcs: TaskCompletionSource<IFileInfo[]> = new TaskCompletionSource<IFileInfo[]>();
    const res: IFileInfo[] = [];
    const mc = fileMeta.replace(/\n/g, ' ').replace(/>.+/, '').replace(/\(.+/, '').match(/import.+?from\s(["']).+?\1/g);

    if (mc && mc.length > 0) {
      mc.forEach(m => {
        const v: string[] | null = m.match(/(["'])(.+)\1/);
        if (v && v.length === 3 && ignoreList.indexOf(v[2]) === -1) {
          let depInfo: IFileInfo = FileUtils.getFileInfoFromFullFileName(path.resolve(file.path, v[2]));
          if (ifRecord) {  // 钩子检测未通过则不记录为依赖
            depInfo = ifRecord(depInfo);
          }
          if (depInfo) {
            res.push(depInfo);
          }
        }
      });
    }
    tcs.setResult(res);
    return tcs.promise;
  }

  static getDependanceTrace(allFiles: IFileInfo[], tar: IFileInfo | string = null, res?: Set<string>): Set<string> {
    const result: Set<string> = new Set(res || []);
    const tmp: string[] = allFiles.filter(d => d.dependenceList.some(f => f.equals(tar)))
      .map(d => d.toString());
    tmp.forEach(d => {
      FileUtils.getDependanceTrace(allFiles, d, result).forEach(_d => result.add(_d));
      result.add(d);
    });
    return result;
  }

  static getDependanceRecursive(allFiles: IFileInfo[], tar: IFileInfo | string = null, res?: Array<string>): Array<string> {
    // console.log('target', tar);
    const tmp: string[] = allFiles.filter(d => d.dependenceList.some(f => f.equals(tar)))
      .map(d => d.toString());
    // console.log('tmp', tmp);
    if (tmp.length) {
      tmp.forEach(d => {
        const result: Array<string> = Array.from(res || []);
        result.push(d);
        // console.log('addResult', result);
        FileUtils.getDependanceRecursive(allFiles, d, result);

      });
    } else {
      const result: Array<string> = Array.from(res || []);
      // console.log('allResult', allResult);
      allResult.add(result);
    }

    return tmp;
  }
}
