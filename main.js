// app: 控制应用生命周期的模块  BrowserWindow: 创建原生浏览器窗口的模块
const { app, BrowserWindow } = require("electron");
var fs = require("fs");
const path = require("path");
const { ipcMain } = require("electron");
var adm_zip = require("adm-zip");
const { deleteFolderRecursive, generateExcel } = require("./tools");

try {
  // require("electron-reload")(__dirname, {});
} catch (error) {
  console.log(error);
}

function createWindow() {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // 加载应用的 index.html
  mainWindow.loadFile("index.html");

  // 判断当前是否是打包，启用开发工具
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }
}

// Electron 会在初始化后并准备创建浏览器窗口时，调用这个函数
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. 也可以拆分成几个文件，然后用 require 导入。

// 监听渲染进程发送的消息
ipcMain.on("exportFile", async (event, arg) => {
  const { pathName, fileName, excelName } = arg;
  try {
    // 解压  使用unzip解压会报错，先不用
    // var extract = unzip.Extract({ path: arg });
    // extract.on("finish", function () {
    //   console.log("解压完成!!");
    // });
    // extract.on("error", function (err) {
    //   console.log(err);
    // });
    // await fs.createReadStream("./demo").pipe(extract);
    // 清空解压文件夹
    await deleteFolderRecursive("./zip");
    // 解压 使用adm-zip
    var unzip = new adm_zip(pathName);
    const unzipFileName = fileName;
    await unzip.extractAllTo(`./zip/${unzipFileName}`, true);
    const unzipPath = fs.readdirSync(`./zip/${unzipFileName}`).find(file => !file.includes('__'))
    await generateExcel(
      `./zip/${unzipFileName}/${unzipPath}`,
      excelName
    );
    console.log('生成路径', path.resolve(`./${excelName}.xlsx`))
    // 后台Node进程通知前端上传成功
    event.sender.send("exportFileSuccess", {
      msg: "ok",
      path: path.resolve(`./${excelName}.xlsx`),
      code: 0,
    });
  } catch (error) {
    // 后台Node进程通知前端上传失败
    console.log("error", error);
    event.sender.send('exportFileError', {
      msg: error,
      code: 0
    })
  }
});
