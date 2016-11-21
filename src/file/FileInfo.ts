import { IFileInfo, IFileInfoMeta } from '../interface/IFile';

export default class FileInfo implements IFileInfo {
  public readonly ext: string;
  public readonly path: string;
  public readonly fileName: string;
  public readonly dependenceList: IFileInfo[];
  constructor(opts: IFileInfoMeta) {
    this.ext = opts.ext;
    this.path = opts.path;
    this.fileName = opts.fileName;
    this.dependenceList = [];
  }

  public toString(): string {
    return `${this.path}${this.fileName}`;
  }

  public equals(fileInfo: IFileInfo | string): boolean {
    return this.toString() === fileInfo.toString();
  }
}
