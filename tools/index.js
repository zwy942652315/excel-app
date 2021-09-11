var fs = require("fs");
const path = require("path");
var xlsx = require("node-xlsx");
/**
 * 删除文件夹以及文件夹里的文件
 * @param {*} url 地址
 */
function deleteFolderRecursive(url) {
  var files = [];
  /**
   * 判断给定的路径是否存在
   */
  if (fs.existsSync(url)) {
    /**
     * 返回文件和子目录的数组
     */
    files = fs.readdirSync(url);
    files.forEach(function (file, index) {
      var curPath = path.join(url, file);
      /**
       * fs.statSync同步读取文件夹文件，如果是文件夹，在重复触发函数
       */
      if (fs.statSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    /**
     * 清除文件夹
     */
    fs.rmdirSync(url);
  } else {
    console.log("给定的路径不存在");
  }
}

/**
 *生成excel文件
 * @param {*} dir 读取文件夹目录
 * @param {*} excelName 生成的excel文件名称
 */
function generateExcel(dir, excelName) {
  // 读取doc文件目录下的所有的文件数组对象
  var dirArr = fs.readdirSync(dir);
  var doc = [];
  for (var i = 0; i < dirArr.length; i++) {
    var strArr = dirArr[i].slice(0, -4).split("-");
    if (strArr[2]) {
      strArr[2] = strArr[2].slice(0, -1); // 去掉元的单位
    }
    str = strArr.join(",");
    doc.push(str);
  }

  var arr = [];
  for (var i = 0; i < doc.length; i++) {
    arr.push(doc[i].split(","));
  }

  var data = [
    {
      name: "sheet1",
      data: arr,
    },
  ];

  // 写xlsx
  var buffer = xlsx.build(data, {
    // !cols 指定列的宽度
    "!cols": [{ wch: 50 }, { wch: 50 }, { wch: 50 }, { wch: 50 }],
  });
  fs.writeFile("./" + excelName + ".xlsx", buffer, function (err) {
    if (err) throw err;
    console.log("生成excel成功");

    // 读xlsx
    var obj = xlsx.parse("./" + excelName + ".xlsx");
    console.log(JSON.stringify(obj));
  });
}

module.exports = {
  deleteFolderRecursive,
  generateExcel,
};
