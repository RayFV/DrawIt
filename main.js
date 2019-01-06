const electron = require("electron");
const url = require("url");
const path = require("path");
const fs = require("fs");

const {app, BrowserWindow, ipcMain, ipcRenderer} = electron;

let appPath = app.getAppPath();
//const appPath = process.env.PORTABLE_EXECUTABLE_DIR;

teamFilePath = appPath + '/teamFiles';

let mainWindow;

app.on('ready', indexWindow);
function indexWindow(){
    //Create
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 720
    }); 
    //Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "recordDraw.html"),
        protocol:'file',
        slashes: true
    })); 
    //Quit app when close
    mainWindow.on('closed', function(){
        app.quit();
    });

};


// Load another window in runtime
function loadRecordWindow() {
    // Load HTML
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'Record.html'),
        protocol: 'file:',
        slashes: true
    }));
}

function loadMemorableDrawWindow() {
    // Load HTML
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'MemorableDraw.html'),
        protocol: 'file:',
        slashes: true
    }));
}

function loadIndexWindow() {
    // Load HTML
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
}

// Catch switch another window request
ipcMain.on('RecordWindow', (event, arg)=>{
    loadRecordWindow();
});

ipcMain.on('memorableDrawWindow', (event, arg)=>{
    loadMemorableDrawWindow();
});

ipcMain.on('indexWindow', (event, arg)=>{
    loadIndexWindow();
});

if(!fs.existsSync(teamFilePath)){
    fs.mkdir(teamFilePath, (err) => {
        if (err) throw err;
    });
}else{
    console.log("already exist");
}


