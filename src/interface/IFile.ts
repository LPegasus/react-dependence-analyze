export interface IFileInfo {
  path: string;
  fileName: string;
  ext: string;
}

export interface IGetAllFilesOptions {
  baseDir: string;
  ext?: string[];
  blackList?: RegExp[];
  whiteList?: RegExp[];
}

export interface IGetDirectoryListAllOptions {
  blackList?: RegExp[];
  whiteList?: RegExp[];
}
