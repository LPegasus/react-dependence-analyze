# react-dependence-analyze [![Build Status](https://travis-ci.org/LPegasus/react-dependence-analyze.svg?branch=master)](https://travis-ci.org/LPegasus/react-dependence-analyze) [![npm version](https://badge.fury.io/js/react-dependence-analyze.svg)](https://badge.fury.io/js/react-dependence-analyze)

> 只支持 import 依赖的解析，赞不支持 require

## 使用说明

### FileUtils

* 实例属性
  * **allFiles** 显示所有文件
* 实例方法
  * **constructor(options)**
    * **options.baseDir** _string_ 工程路径（默认：'./'）
    * **options.ext** _string[]_ 解析的文件后缀（默认：['.jsx', '.js']）
    * **options.blackList** _RegExp[]_ 用文件绝对路径名过滤，不包含在分析中
    * **options.whiteList** _RegExp[]_ 用文件绝对路径名过滤，包含在分析中（whiteList 存在则无视 blackList）
    * **options.ignoreModule** _string[]_ 忽略分析的模块（默认：['react', 'react-router', 'react-dom', 'antd', 'moment', 'lodash', 'classnames', 'babel-polyfill']）
  * **getCurrentFilesFromDir(path: _string_): _Promise\<IFileInfo>_**  获取所有目录下的文件
    * **path** 相对工程目录的路径
  * **getAllFiles(): _Promise\<void>_** 获取工程下的所有文件
    * 解析后 allFiles 才有值
  * **analyzeDependence(): _Promise\<void>_** 获取依赖
    * 解析后 每个 FileInfo.dependenceList 才有值
* 静态方法
  * 待完成...

### FileInfo

* 实例属性
  * **ext** _string_    后缀
  * **path** _string_   路径
  * **filename** _string_    文件名
  * **dependenceList** _FileInfo[]_    依赖文件
* 实例方法
  * **equals(fileInfo: _string | FileInfo_): _boolean_** 比较是否相同（dependenceList 中的文件存放的并不是 FileInfo 的引用，而是重新生成的 FileInfo）
  * **toString(): _string_** 路径 + 文件名

### example 1

``` js
var rcDepAnalyze = require('react-dependence-analyze');

var options = {
  baseDir: '/home/usr1/project/react-proj', // 工程路径
}
var fileUtil = new rcDepAnalyze.FileUtils(options);
fileUtil.getAllFiles()
  .then(function() {
    return fileUtil.analyzeDependence();
  }).then(function() {
    console.log(fileUtil.allFiles); // 依赖获取完成
  });
```

### example 2

> For command line syntax:
>
> ​rda-cli 工程根目录 -t filename _依赖分析对象_  \[-e ext（逗号分隔）]  \[-b blackList（逗号分隔 RegExp 表达式）]  \[-w whiteList（逗号分隔 RegExp 表达式）]  \[-i ignoreModule（逗号分隔）]  \[-full（显示为绝对路径）]

``` shell
node_modules/.bin/rda-cli test/testData -t test/testData/components/MainMenu.jsx
// => dependence trace:
// => .../react-dependence-analyze/test/testData/containers/Application.jsx
```


## history log

### 0.1.1 => 0.1.2

* 支持 import 指定到文件夹、默认取文件夹下 index.js 或者 index.jsx 的这种情况
* cli 默认输出相对路径，添加 cli 参数 -full，若设置 -full 则输出绝对路径

### 0.1.0 => 0.1.1

* 修剪 npm 包内容、依赖