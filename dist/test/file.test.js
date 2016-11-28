var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const FileUtils_1 = require('../src/file/FileUtils');
const utils_1 = require('../src/libs/utils');
const FileInfo_1 = require('../src/file/FileInfo');
const chai_1 = require('chai');
const path = require('path');
describe('file.test', () => {
    const fileUtils = new FileUtils_1.FileUtils({ baseDir: './src', ext: ['.ts'] });
    it(' - FullFileName => FileInfo', () => {
        const testFileName = path.resolve('.', 'ts.test.json');
        const fileInfo = FileUtils_1.FileUtils.getFileInfoFromFullFileName(testFileName);
        const parsedFile = path.parse(testFileName);
        chai_1.expect(fileInfo.ext).to.be.equal(parsedFile.ext);
        chai_1.expect(fileInfo.path).to.be.equal(parsedFile.dir + path.sep);
        chai_1.expect(fileInfo.fileName).to.be.equal(parsedFile.base);
    });
    it(' - AbsolutePath => RelativePath', () => {
        const testBaseDir = path.resolve('src');
        const testAbsoluteDir = path.resolve('src', 'file', 'fakedir');
        const relativePath = FileUtils_1.FileUtils.getRelativePathFromAbsolutePath(testBaseDir, testAbsoluteDir);
        chai_1.expect(relativePath).to.be.equal('file' + path.sep + 'fakedir');
    });
    it(' - 获取文件夹下的文件', () => {
        const testPath = path.resolve('.', 'src');
        fileUtils.getCurrentFilesFromDir(testPath).then(files => {
            chai_1.expect(files.length).to.be.equal(1);
            chai_1.expect(files.some(file => file.fileName === 'index.ts'
                && file.ext === '.ts' && file.path === '')).to.be.ok;
        });
    });
    it(' - 获取文件夹', () => __awaiter(this, void 0, void 0, function* () {
        const tcs = new utils_1.TaskCompletionSource();
        const directoryList = yield FileUtils_1.FileUtils.getDirectoryList(path.resolve('./'));
        try {
            chai_1.expect(directoryList.some(d => d === path.resolve('./src') + path.sep)).to.be.ok;
            tcs.setResult();
        }
        catch (e) {
            tcs.setError(e);
        }
        return tcs.promise;
    }));
    it(' - isDirectory', () => __awaiter(this, void 0, void 0, function* () {
        const isDir = yield FileUtils_1.FileUtils.isDirectory('./');
        const isNotDir = yield FileUtils_1.FileUtils.isDirectory('./tsconfig.json');
        chai_1.expect(isDir).to.be.ok;
        chai_1.expect(isNotDir).to.not.be.ok;
    }));
    it(' - isFile', () => __awaiter(this, void 0, void 0, function* () {
        const isNotFile = yield FileUtils_1.FileUtils.isFile('./');
        const isFile = yield FileUtils_1.FileUtils.isFile('./tsconfig.json');
        chai_1.expect(isNotFile).to.not.be.ok;
        chai_1.expect(isFile).to.be.ok;
    }));
    it(' - 递归获取所有文件夹', () => __awaiter(this, void 0, void 0, function* () {
        const dirList = yield FileUtils_1.FileUtils.getDirectoryListAll('./src');
        chai_1.expect(dirList.some(p => p === path.resolve('src', 'interface') + path.sep)).to.be.ok;
        const blackListFilteredList = yield FileUtils_1.FileUtils.getDirectoryListAll('./src', { blackList: [/interface/i] });
        chai_1.expect(blackListFilteredList.length === dirList.length - 1).to.be.ok;
        const whiteListFilteredList = yield FileUtils_1.FileUtils.getDirectoryListAll('.', { whiteList: [/typings/i] });
        chai_1.expect(whiteListFilteredList.every(p => p.indexOf('typings') > -1)).to.be.ok;
    }));
    it(' - 获取所有文件', () => __awaiter(this, void 0, void 0, function* () {
        const fileUtil1 = new FileUtils_1.FileUtils({
            baseDir: process.cwd(),
            ext: ['.ts'],
            whiteList: [/test/i, /src/]
        });
        const res1 = yield fileUtil1.getAllFiles();
        chai_1.expect(res1.every(file => file.ext === '.ts')).to.be.ok;
        const fileUtil2 = new FileUtils_1.FileUtils({
            baseDir: 'dist',
            ext: ['.js', '.map'],
            blackList: [/test/i]
        });
        const res2 = yield fileUtil2.getAllFiles();
        chai_1.expect(res2.every(file => ['.js', '.map'].indexOf(file.ext) > -1 && file.path.indexOf('test') === -1)).to.be.ok;
    }));
    it(' - 获取依赖', () => __awaiter(this, void 0, void 0, function* () {
        const fileInfo = new FileInfo_1.default({
            path: path.relative('.', 'test/testData/containers') + path.sep,
            fileName: 'Application.jsx',
            ext: '.jsx'
        });
        const res = yield FileUtils_1.FileUtils.getDependenceList(fileInfo);
        chai_1.expect(res.length).to.be.equal(4);
        const fileUtil = new FileUtils_1.FileUtils({
            baseDir: path.resolve('./test', './testData'),
            ext: ['.js', '.jsx']
        });
        yield fileUtil.getAllFiles();
        yield fileUtil.analyzeDependence();
        const fileWithDepInfo = fileUtil.allFiles.filter(file => file.dependenceList.length > 0)[0];
        chai_1.expect(fileWithDepInfo.dependenceList.length).to.be.equal(2);
        chai_1.expect(!!fileWithDepInfo.dependenceList.find(file => file.fileName === 'MainMenu.jsx')).to.be.ok;
        const fileUtil2 = new FileUtils_1.FileUtils({
            baseDir: path.resolve('./test', './testData'),
            ext: ['.js', '.jsx', 'css']
        });
        yield fileUtil2.getAllFiles();
        yield fileUtil2.analyzeDependence();
        const fileWithDepInfo2 = fileUtil2.allFiles.filter(file => file.dependenceList.length > 0)[0];
        chai_1.expect(fileWithDepInfo2.dependenceList.length).to.be.equal(3);
        chai_1.expect(!!fileWithDepInfo2.dependenceList.find(file => file.fileName === 'Application.css')).to.be.ok;
    }));
});
//# sourceMappingURL=file.test.js.map