const { app, BrowserWindow, Menu } = require('electron')

let win;
let toolBar;
let slider;
function loadToolBar(title, file) {
  toolBar = new BrowserWindow({
    width: 700,
    height: 600 ,
    title: title,

    frame: false,
    webPreferences: {
      nodeIntegration: true
    }


  })
  toolBar.webContents.openDevTools();
  toolBar.loadFile("./toolbars/devs.html")
}
function loadSlider() {
  slider = new BrowserWindow({
    width: 700,
    height: 145,
    frame: false,
    webPreferences: {
      nodeIntegration: true
    }
  }) 
  slider.loadFile("./toolbars/slider.html")

  
}




function createWindow () {
   win = new BrowserWindow({
    width: 1600,
    height: 1080,
    title: "ecobourne",
    icon: __dirname + "/ui-images/leaf.ico",
    resizeable: false,
    fullscreen: true,
    darkTheme: true,
    webPreferences: {
      nodeIntegration: true
    }

  })
  win.loadFile('index.html')
  win.on("closed", () => {
    win = null;
  })
  let menu = Menu.buildFromTemplate([
    {
      label:"File",
      submenu : [
        {label: "Developer Info",
          click() {
            loadToolBar("Dev Info")

          }
          
        },
        {label: "Exit",
          click() {
            app.quit()
          }
        }
      ]
    },
    {
      label:"View",
      submenu : [
        {label: "Speed",
        click() {
          loadSlider()
        }}
      ]


    }
  ])
  Menu.setApplicationMenu(menu)
    
    
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
