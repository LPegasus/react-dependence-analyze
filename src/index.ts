import { FileUtils } from './file/readAllDirFiles';

const args: string[] = process.argv.slice(2);
const fileUtil = new FileUtils({
  baseDir: args[0],
  ext: args[1].split(';').filter(arg => !!arg),
});

fileUtil.getAllFiles().then(files => {
  console.log(files);
});
