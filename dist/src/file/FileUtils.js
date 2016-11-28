var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const path = require('path');
const lodash_1 = require('lodash');
const FileInfo_1 = require('./FileInfo');
const utils_1 = require('../libs/utils');
const DEPENDENCE_IGNORE_LIST = [
    'react', 'react-dom', 'moment', 'antd', 'react-router'
];
const DEAULT_OPTIONS = {
    ext: ['.jsx', '.js'],
    baseDir: './',
    blackList: [/node_modules/i, /typings/i],
    whiteList: [],
    ignoreModule: DEPENDENCE_IGNORE_LIST
};
class FileUtils {
    constructor(options) {
        const { ext = [] } = options;
        if (ext.length) {
            options.ext = ext.map(d => /^\..+/i.test(d) ? d : `.${d}`);
        }
        this.options = Object.assign({}, DEAULT_OPTIONS, options);
        this.fullBaseDir = path.resolve(this.options.baseDir) + path.sep;
        this._cache_ = new Map();
        this._allFiles = null;
    }
    get allFiles() {
        return this._allFiles;
    }
    getCurrentFilesFromDir(_path = '') {
        return __awaiter(this, void 0, void 0, function* () {
            return yield FileUtils.getCurrentFilesFromDir(_path, this.fullBaseDir, this.options);
        });
    }
    getAllFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._allFiles !== null) {
                return Promise.resolve(this._allFiles);
            }
            const files = yield FileUtils.getAllFiles(this.options);
            this._allFiles = files;
            files.forEach(f => this._cache_.set(f.toString(), true));
            return files;
        });
    }
    analyzeDependence() {
        return __awaiter(this, void 0, void 0, function* () {
            const exts = this.options.ext;
            yield utils_1.forEachAsync(this._allFiles, (fileInfo) => __awaiter(this, void 0, void 0, function* () {
                fileInfo.dependenceList = yield FileUtils.getDependenceList(fileInfo, this.options.ignoreModule, (f) => {
                    const _f = Object.assign({}, f);
                    const validExt = utils_1.hasValidExtension(_f.fileName, exts);
                    if (validExt && exts.indexOf(validExt) >= 0) {
                        if (this._cache_.get(f.toString())) {
                            return f;
                        }
                    }
                    else if (exts.some(ext => {
                        f.ext = ext;
                        f.fileName = f.fileName + ext;
                        if (this._cache_.get(f.toString())) {
                            return true;
                        }
                        else {
                            f.ext = _f.ext;
                            f.fileName = _f.fileName;
                            return false;
                        }
                    })) {
                        return f;
                    }
                    return null;
                });
            }));
        });
    }
    static getCurrentFilesFromDir(_path, fullBaseDir = '', options = DEAULT_OPTIONS) {
        return __awaiter(this, void 0, void 0, function* () {
            const curDir = utils_1.iifabsolutePath(_path, fullBaseDir) + path.sep;
            const files = yield utils_1.fsAsync.readdir(curDir);
            const fileList = [];
            files.forEach(filename => {
                if (options.ext.some(ext => filename.endsWith(ext))) {
                    const fullFileName = path.resolve(_path, filename);
                    const fileInfo = FileUtils.getFileInfoFromFullFileName(fullFileName);
                    fileList.push(fileInfo);
                }
            });
            return fileList;
        });
    }
    static getFileInfoFromFullFileName(fullFileName) {
        const lastIndexOfSeparator = fullFileName.lastIndexOf(path.sep);
        const separatorLength = path.sep.length;
        const fileName = fullFileName.substr(lastIndexOfSeparator + separatorLength);
        const _path = fullFileName.substr(0, lastIndexOfSeparator + separatorLength);
        const lidx = fileName.lastIndexOf('.');
        const ext = lidx > 0 ? fileName.substr(lidx) : null;
        return new FileInfo_1.default({
            ext, path: _path, fileName: fileName
        });
    }
    static getRelativePathFromAbsolutePath(baseDir, absolutePath) {
        const idx = absolutePath.indexOf(baseDir);
        if (idx !== 0)
            return absolutePath;
        return absolutePath.substr(baseDir.length + path.sep.length);
    }
    static getDirectoryList(_path) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield utils_1.fsAsync.readdir(path.resolve(_path))
                .then(d => d.map(file => path.resolve(_path, file)));
            const res = [];
            yield utils_1.forEachAsync(files, function (file) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (yield FileUtils.isDirectory(file)) {
                        res.push(file + path.sep);
                    }
                });
            });
            return res;
        });
    }
    static getDirectoryListAll(rootPath, opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const { blackList, whiteList } = opts;
            let directoryList = [];
            const directoryToScan = [utils_1.iifabsolutePath(rootPath)];
            while (directoryToScan.length > 0) {
                const _path = directoryToScan.pop();
                const swapper = yield FileUtils.getDirectoryList(_path);
                if (swapper.length === 0)
                    continue;
                const filteredPathList = whiteList && whiteList.length ?
                    swapper.filter(dirName => whiteList.some(reg => reg.test(dirName))) :
                    blackList && blackList.length
                        ? swapper.filter(dirName => !blackList.some(reg => reg.test(dirName))) : swapper;
                directoryList = directoryList.concat(filteredPathList);
                directoryToScan.push(...filteredPathList);
            }
            return directoryList;
        });
    }
    static isDirectory(fullFileName) {
        return __awaiter(this, void 0, void 0, function* () {
            const stat = yield utils_1.fsAsync.stat(fullFileName);
            return stat.isDirectory();
        });
    }
    static isFile(fullFileName) {
        return __awaiter(this, void 0, void 0, function* () {
            const stat = yield utils_1.fsAsync.stat(fullFileName);
            return stat.isFile();
        });
    }
    static getAllFiles(opts = {
            baseDir: '',
            ext: [],
            blackList: [],
            whiteList: []
        }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { baseDir, ext, blackList, whiteList, } = opts;
            const fullBaseDir = utils_1.iifabsolutePath(baseDir);
            const allDirList = yield FileUtils.getDirectoryListAll(fullBaseDir, { blackList, whiteList });
            allDirList.push(fullBaseDir);
            const fileInfoList = lodash_1.flatten(yield utils_1.mapAsync(allDirList, (dir) => __awaiter(this, void 0, void 0, function* () {
                return yield FileUtils.getCurrentFilesFromDir(dir, fullBaseDir, { baseDir, ext });
            })));
            return fileInfoList;
        });
    }
    static getDependenceList(file, ignoreList = DEPENDENCE_IGNORE_LIST, ifRecord) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = path.resolve(file.path, file.fileName);
            const fileMeta = yield utils_1.fsAsync.readFile(filePath, 'utf-8');
            const tcs = new utils_1.TaskCompletionSource();
            const res = [];
            const mc = fileMeta.replace(/\n/g, ' ').replace(/>.+/, '').replace(/\(.+/, '').match(/import.+?from\s(["']).+?\1/g);
            if (mc && mc.length > 0) {
                mc.forEach(m => {
                    const v = m.match(/(["'])(.+)\1/);
                    if (v && v.length === 3 && ignoreList.indexOf(v[2]) === -1) {
                        let depInfo = FileUtils.getFileInfoFromFullFileName(path.resolve(file.path, v[2]));
                        if (ifRecord) {
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
        });
    }
}
exports.FileUtils = FileUtils;
//# sourceMappingURL=FileUtils.js.map