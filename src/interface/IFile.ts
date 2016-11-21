export interface IFileInfo {
  path: string;
  fileName: string;
  ext: string;
  dependenceList: IFileInfo[];
  toString: () => string;
  equals: (fileInfo: string | IFileInfo) => boolean;
}

export interface IFileInfoMeta {
  path: string;
  fileName: string;
  ext: string;
}

export interface IGetAllFilesOptions {
  baseDir: string;
  ext?: string[];
  blackList?: RegExp[];
  whiteList?: RegExp[];
  ignoreModule?: string[];
}

export interface IGetDirectoryListAllOptions {
  blackList?: RegExp[];
  whiteList?: RegExp[];
}
