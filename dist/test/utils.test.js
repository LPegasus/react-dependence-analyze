var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const utils_1 = require('../src/libs/utils');
const chai_1 = require('chai');
const path = require('path');
describe('utils.test', () => {
    it(' - forEachAsync', () => {
        const tcs = new utils_1.TaskCompletionSource();
        const res = [];
        utils_1.forEachAsync(['package.json', 'tslint.json', 'tsconfig.json'], function (filename) {
            return __awaiter(this, void 0, void 0, function* () {
                const ctx = this;
                const stats = yield utils_1.fsAsync.stat(path.resolve(filename));
                try {
                    chai_1.expect(stats.isFile() && ctx.a === 1).to.be.ok;
                }
                catch (e) {
                    tcs.setError(e);
                }
                res.push(filename);
                if (res.length === 3) {
                    tcs.setResult();
                }
            });
        }, { a: 1 });
        return tcs.promise;
    });
    it(' - iifabsolutePath', () => {
        const relativePath1 = './node_modules/chai';
        const relativePath2 = '.';
        const absolutePath1 = path.resolve(relativePath1);
        const absolutePath2 = path.resolve(relativePath2);
        chai_1.expect(utils_1.iifabsolutePath(absolutePath1, relativePath2)).to.be.equal(absolutePath1);
        chai_1.expect(utils_1.iifabsolutePath(relativePath1)).to.be.equal(absolutePath1);
        chai_1.expect(utils_1.iifabsolutePath(relativePath1, absolutePath2)).to.be.equal(absolutePath1);
        chai_1.expect(utils_1.iifabsolutePath(relativePath1, relativePath2)).to.be.equal(absolutePath1);
    });
    it(' - hasValidExtension', () => {
        chai_1.expect(utils_1.hasValidExtension('file1')).to.be.equal(null);
        chai_1.expect(utils_1.hasValidExtension('file1.j1')).to.be.equal('.j1');
        chai_1.expect(utils_1.hasValidExtension('file1.coffee')).to.be.equal(null);
        chai_1.expect(utils_1.hasValidExtension('file1.coffee', ['coffee'])).to.be.equal('.coffee');
        chai_1.expect(utils_1.hasValidExtension('file1.coffee', ['.coffee'])).to.be.equal('.coffee');
    });
    it(' - flatten', () => {
        const res = utils_1.flatten([[[1, 2]], 3]);
        chai_1.expect(res[0] === 1 && res[1] === 2 && res[2] === 3).to.be.ok;
    });
    it(' - uniq', () => {
        const res = utils_1.uniq([1, 1, 1, 2, 3, 3, 2, 2, 4, 5, 5, 4]);
        chai_1.expect(res.join(',')).to.be.equal('1,2,3,4,5');
    });
});
//# sourceMappingURL=utils.test.js.map