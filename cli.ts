import { FileUtils } from './src/file/FileUtils';
import { IGetAllFilesOptions } from './src/interface/IFile';
import * as path from 'path';
import * as chalk from 'chalk';

const args: string[] = process.argv.slice(2);

const indexes = {
  ext: args.indexOf('-e') + 1,
  blackList: args.indexOf('-b') + 1,
  whiteList: args.indexOf('-w') + 1,
  ignoreModule: args.indexOf('-i') + 1
};

let showFullPath: boolean = false;
if (args.indexOf('-full') >= 0) {
  showFullPath = true;
}

let target: string = '';
let ti: number = args.indexOf('-t');
if (ti >= 0) {
  target = args[ti + 1];
  target = path.resolve(process.cwd(), target);
} else {
  throw new Error(chalk.red('no target file was defined'));
}

const options: IGetAllFilesOptions = {
  baseDir: args[0]
};

Object.keys(indexes).forEach(i => {
  if (indexes[i]) {
    const field = i;
    switch (field) {
      case 'ext':
        options.ext = args[indexes.ext].split(/,(\s+)?/).filter(d => !!d);
        break;
      case 'blackList', 'whiteList':
        try {
          options[field] = args[indexes[field]].match(/\/.+?\/(\w+)?/g).map(d => {
            const mc = d.match(/\/(.+?)\/(\w+)?/i);
            return new RegExp(mc[1], mc[2]);
          });
        } catch (e) {
          throw new Error(chalk.red(`invalid param of ${field}`));
        }
        break;
      case 'ignoreModule':
        options[field] = args[indexes[field]].split(',').map(d => d.trim());
        break;
      default:
        options[field] = args[indexes[field]];
    }
  }
});

const fileUtil: FileUtils = new FileUtils(options);

fileUtil.getAllFiles()
  .then(async () => {
    await fileUtil.analyzeDependence();
    const res: Set<string> = FileUtils.getDependanceTrace(fileUtil.allFiles, target);
    console.log(chalk.blue('dependence trace:'));
    res.forEach(d => {
      console.log(chalk.green(!showFullPath ? path.relative(options.baseDir, d) : d));
    });
  }).catch(e => console.log(chalk.red(e)));
