export interface IFileInfo {
  path: string;
  fileName: string;
  ext: string;
}

export interface IReadAllDirFilesOptions {
  baseDir?: string;
  ext?: string[];
}

export interface IGetAllFilesOptions {
  baseDir: string;
  ext?: string[];
  filter?: IGetDirectoryListAllOptions;
}

export interface IGetDirectoryListAllOptions {
  blackList?: RegExp[];
  whiteList?: RegExp[];
}
