var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const FileUtils_1 = require("./src/file/FileUtils");
const path = require("path");
const chalk = require("chalk");
const args = process.argv.slice(2);
const indexes = {
    ext: args.indexOf('-e') + 1,
    blackList: args.indexOf('-b') + 1,
    whiteList: args.indexOf('-w') + 1,
    ignoreModule: args.indexOf('-i') + 1
};
let showFullPath = false;
if (args.indexOf('-full') >= 0) {
    showFullPath = true;
}
let target = '';
let ti = args.indexOf('-t');
if (ti >= 0) {
    target = args[ti + 1];
    target = path.resolve(process.cwd(), target);
}
else {
    throw new Error(chalk.red('no target file was defined'));
}
const options = {
    baseDir: args[0]
};
Object.keys(indexes).forEach(i => {
    if (indexes[i]) {
        const field = i;
        switch (field) {
            case 'ext':
                options.ext = args[indexes.ext].split(/,(\s+)?/).filter(d => !!d);
                break;
            case 'blackList':
            case 'whiteList':
                try {
                    options[field] = args[indexes[field]].match(/\/.+?\/(\w+)?/g).map(d => {
                        const mc = d.match(/\/(.+?)\/(\w+)?/i);
                        return new RegExp(mc[1], mc[2]);
                    });
                }
                catch (e) {
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
const fileUtil = new FileUtils_1.FileUtils(options);
fileUtil.getAllFiles()
    .then(() => __awaiter(this, void 0, void 0, function* () {
    yield fileUtil.analyzeDependence();
    FileUtils_1.FileUtils.getDependanceRecursive(fileUtil.allFiles, target);
    console.log(chalk.blue('dependence trace:'));
    FileUtils_1.allResult.forEach(d => {
        let line = '';
        d.forEach(i => {
            const thePath = !showFullPath ? path.relative(options.baseDir, i) : i;
            line += `-> ${thePath} `;
        });
        console.log(chalk.green(line));
    });
})).catch(e => console.log(chalk.red(e)));
//# sourceMappingURL=cli.js.map