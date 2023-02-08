const express = require("express")
const browser = require("./browser")
const {newBrowser} = require("./testBS")
const teamBrowser = require("./teamBrowser")
// const zoomBrowser = require("./zoomBrowser")
const url = require('url');
const querystring = require('querystring');
const app = express()

const http = require('http').createServer(app)
const io = require('socket.io')(http, {
  cors: {
    origin: "https://lightbulb-core-app-fe.antino.ca",
    methods: ["GET", "POST"],
  }
})  


// zoomBrowser.newBrowserZoom("https://us05web.zoom.us/j/81027444394?pwd=QmlWVmVBQmp4am8yK0VMd2F6aXhKZz09")

app.use(express.json());
// browser.socketFunction(app);
browser.newBrowser()
// teamBrowser.newBrowser()
// let routeUrl = 'https://us05web.zoom.us/j/84389285256?pwd=M1NQYXEzZlN0QkFXYStkM2tGVHZiZz09';

// let parsedRouteUrl = url.parse(routeUrl);
// console.log("parsedRouteUrl===> ",parsedRouteUrl);
// let abc = querystring.parse(parsedRouteUrl.pathname);
// let requiredQueryString = querystring.parse(parsedRouteUrl.query);
// console.log("Queries ===> ",requiredQueryString);
// console.log("Query ===> ",abc);

app.get('/msTeams', async (req, res) => {
    res.send("Called Successfully!!!")

})

http.listen(9000, () => {
    console.log("server is running on 9000");
})