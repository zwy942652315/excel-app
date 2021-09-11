// 引入 ipcRenderer 模块。
const { ipcRenderer } = require("electron");
document.getElementById("export-btn").onclick = function () {
  const files = document.getElementById("file").files[0];
  if (!files) {
    alert("请上传文件");
    return;
  }
  const { path: pathName } = files;
  const lastIndex = pathName.indexOf(".");
  const pathArr = pathName.slice(0, lastIndex).split("/");
  const fileName = pathArr[pathArr.length - 1];
  const excelName = fileName;
  // 使用 ipcRenderer.send 向主进程发送消息。
  ipcRenderer.send("exportFile", {
    pathName,
    fileName,
    excelName,
  });
};

// 监听主进程返回的消息
ipcRenderer.on("exportFileSuccess", function (event, arg) {
  if (arg.code === 0) {
    alert("生成excel成功");
  } else {
    alert("生成excel失败");
  }
});
