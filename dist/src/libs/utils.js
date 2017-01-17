var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const fs = require("fs");
const path = require("path");
function asyncWrapper(fn) {
    return function (...args) {
        return new Promise((r, j) => {
            const callback = function (err, ..._args) {
                if (!!err)
                    j(err);
                else
                    r.apply(null, _args);
            };
            fn.apply(null, args.concat([callback]));
        });
    };
}
exports.asyncWrapper = asyncWrapper;
exports.fsAsync = {
    readdir: asyncWrapper(fs.readdir),
    stat: asyncWrapper(fs.stat),
    readFile: asyncWrapper(fs.readFile),
    exists: asyncWrapper(fs.exists),
};
class TaskCompletionSource {
    constructor() {
        this.promise = new Promise((r, j) => {
            this.setResult = r;
            this.setError = j;
        });
    }
}
exports.TaskCompletionSource = TaskCompletionSource;
;
exports.forEachAsync = function (list, fn, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const tcs = new TaskCompletionSource();
        const len = list.length;
        for (let i = 0; i < len; i++) {
            yield fn.call(ctx, list[i], i, list);
        }
        tcs.setResult();
        return tcs.promise;
    });
};
exports.mapAsync = function (list, fn, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const tcs = new TaskCompletionSource();
        const len = list.length;
        const res = [];
        for (let i = 0; i < len; i++) {
            res[i] = yield fn.call(ctx, list[i], i, list);
        }
        tcs.setResult(res);
        return tcs.promise;
    });
};
function iifabsolutePath(addr, base) {
    if (path.isAbsolute(addr))
        return addr;
    if (!base)
        return path.resolve(addr);
    else if (path.isAbsolute(base)) {
        return path.resolve(base, addr);
    }
    else {
        return path.resolve(process.cwd(), addr);
    }
}
exports.iifabsolutePath = iifabsolutePath;
function hasValidExtension(filename, validExts = []) {
    if (!filename || filename.charAt(0) === '.')
        return null;
    const tokens = filename.split('.');
    if (tokens.length === 0)
        return null;
    const lastToken = tokens.pop();
    let exts = [];
    if (validExts.length) {
        exts = validExts.map(ext => ext.charAt(0) === '.' ? ext.substr(1) : ext);
    }
    return (lastToken.length >= 2 && lastToken.length <= 4
        || validExts.length && exts.some(ext => ext === lastToken))
        ? `.${lastToken}` : null;
}
exports.hasValidExtension = hasValidExtension;
function flatten(array = [], preRes = []) {
    const res = [...preRes];
    array.forEach(t => {
        if (Object.prototype.toString.call(t) === '[object Array]') {
            flatten(t).forEach(d => res.push(d));
        }
        else {
            res.push(t);
        }
    });
    return res;
}
exports.flatten = flatten;
function uniq(array) {
    const res = [];
    let len = array.length;
    while (len > 0) {
        const v = array[--len];
        const idx = array.indexOf(v);
        if (idx >= 0 && idx < len) {
            continue;
        }
        else {
            res.unshift(v);
        }
    }
    return res;
}
exports.uniq = uniq;
//# sourceMappingURL=utils.js.map