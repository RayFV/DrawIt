const electron = require("electron");
const url = require("url");
const path = require("path");
const fs = require("fs");

const { app, BrowserWindow, ipcMain, ipcRenderer } = electron;

//let appPath = app.getAppPath();
const appPath = process.env.PORTABLE_EXECUTABLE_DIR;

teamFilePath = appPath + '/teamFiles';

let mainWindow;
let addWindow;
let createWindow;

app.on('ready', indexWindow);
function indexWindow() {
    //Create
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 720
    });
    //Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "memorableDraw.html"),
        protocol: 'file',
        slashes: true
    }));
    //Quit app when close
    mainWindow.on('closed', function () {
        app.quit();
    });

};

if (!fs.existsSync(teamFilePath)) {
    fs.mkdir(teamFilePath, (err) => {
        if (err) throw err;
    });
} else {
    console.log("already exist");
}


// Load another window in runtime
function loadRecordWindow() {
    // Load HTML
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'displayRecord.html'),
        protocol: 'file:',
        slashes: true
    }));
}

function loadMemorableDrawWindow() {
    // Load HTML
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'memorableDraw.html'),
        protocol: 'file:',
        slashes: true
    }));
}

function loadNormalDrawWindow() {
    // Load HTML
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'normalDraw.html'),
        protocol: 'file:',
        slashes: true
    }));
}

//Handle create add window
function createInsertWindow() {
    //Create
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: '新增組別'
    });
    //Load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, "insertNewItem.html"),
        protocol: 'file',
        slashes: true
    }));
    // Garbage collection handle
    addWindow.on('closed', function () {
        addWindow = null;
    })
}

function createNewFileWindow() {
    //Create
    createWindow = new BrowserWindow({
        width: 600,
        height: 600,
        title: '新增檔案'
    });
    //Load html into window
    createWindow.loadURL(url.format({
        pathname: path.join(__dirname, "createFile.html"),
        protocol: 'file',
        slashes: true
    }));
    // Garbage collection handle
    createWindow.on('closed', function () {
        createWindow = null;
    })
}

// Catch switch another window request
ipcMain.on('RecordWindow', (event, arg) => {
    loadRecordWindow();
});

ipcMain.on('memorableDrawWindow', (event, arg) => {
    loadMemorableDrawWindow();
});

ipcMain.on('normalDrawWindow', (event, arg) => {
    loadNormalDrawWindow();
});

ipcMain.on('createNewFileWindow', (event, arg) => {
    createNewFileWindow();
});

ipcMain.on('insertItemWindow', (event, arg) => {
    createInsertWindow();
});

ipcMain.on('item:add', function (e, item) {
    console.log(item);
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

ipcMain.on('fileCreate', function (e, fileName, content) {
    mainWindow.webContents.send('fileCreate', fileName, content);
    createWindow.close();
});