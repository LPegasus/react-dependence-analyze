class FileInfo {
    constructor(opts) {
        this.ext = opts.ext;
        this.path = opts.path;
        this.fileName = opts.fileName;
        this.dependenceList = [];
    }
    toString() {
        return `${this.path}${this.fileName}`;
    }
    equals(fileInfo) {
        return this.toString() === fileInfo.toString();
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FileInfo;
//# sourceMappingURL=FileInfo.js.map