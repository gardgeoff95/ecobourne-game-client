$(document).ready(() => {
    const {BrowserWindow} = require('electron').remote
    $("#close").on("click", function() {
        console.log("CLICKED")
        var window = BrowserWindow.getFocusedWindow();
        window.close();

    })
    $("#geoff").on("click", () => {
        console.log("Geoff")
    })
    
})
