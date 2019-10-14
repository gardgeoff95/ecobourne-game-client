$(document).ready(() => {
    const geoffText = "Primarily worked with both the logic from the simulation itself, working with D3.js to create dynamic graphs, and also creating the electron app you see before you."
    const ggh = "https://github.com/gardgeoff95"
    const gli = "https://www.linkedin.com/in/geoffrey-gard-89b194192/"

    const jamieText = "Worked heavily with React to produce the counterpart of this app complete with account creation, live stat tracking, and chat functionality."
    const jgh = "https://github.com/jbarton10"
    const jli = "https://www.linkedin.com/in/jamie-barton-202530181/"

    const morganText = "Morgan, put his time into styling the entire web application from creating smooth animated logos, to mobile responsive React components. He also created all of the animal sprites seen within the simulation as well as the original contruction of the D3 graphs."
    const mgh = "https://github.com/CodesByMo"
    const mli = "https://www.linkedin.com/in/morgan-arnold-aa5b0a64/"

    const andyText = "Working on the backbone of the React app, Andy provided the front end with API routing, secure input validation, and database management."
    const agh = "https://github.com/aznchronos"
    const ali = "https://www.linkedin.com/in/andy-ren-821506100/"
    const lauraText = "Laura worked right alongside Morgan, styling and flushing out the app to create a sleek and polished UI experience for the user."
    const lgh = "https://github.com/ldsc617"
    const lli = "https://www.linkedin.com/in/laura-salomon-305113184/"



    const {BrowserWindow} = require('electron').remote
    $("#close").on("click", function() {
        console.log("CLICKED")
        var window = BrowserWindow.getFocusedWindow();
        window.close();

    })
    $("#geoff").on("click", () => {
        $("#name").text("Geoff");
        $("#text").text(geoffText);
        $("#github")
        $("#github").attr("href", ggh);
        $("#linkedin").attr("href", gli);
    })
    $("#andy").on("click", () => {
        $("#name").text("Andy");
        $("#text").text(andyText);
        $("#github").attr("href", agh);
        $("#linkedin").attr("href", ali);
    })
    $("#jamie").on("click", () => {
        $("#name").text("Jamie");
        $("#text").text(jamieText);
        $("#github").attr("href", jgh);
           $("#linkedin").attr("href", jli);
    })
    $("#morgan").on("click", () => {
        $("#name").text("Morgan")
        $("#text").text(morganText);
        $("#github").attr("href", mgh);
        $("#linkedin").attr("href", mli);
    })
    $("#laura").on("click", () => {
        $("#name").text("Laura")
        $("#text").text(lauraText);
        $("#github").attr("href", lgh);
        $("#linkedin").attr("href", lli);
    })
       
})
