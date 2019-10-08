const { app, BrowserWindow } = require('electron')
let win;
function createWindow () {
   win = new BrowserWindow({
    width: 1600,
    height: 1080,
    webPreferences: {
      nodeIntegration: true
    }
  })
  win.loadFile('index.html')
  win.on("closed", () => {
    win = null;
  })
}
app.on('ready', createWindow)
app.on("window-all-closed", () => {
  if(process.platform !== "darwin") {
    app.quit();
  }
})
app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
})
