const $ = require('jquery');
const fs = require("fs");
const moment = require("moment");
const {remote} = require("electron");
const {app} = remote;
const {ipcRenderer} = require("electron");

/*
https://stackoverflow.com/questions/46307797/how-to-get-the-original-path-of-a-portable-electron-app
https://discuss.atom.io/t/can-electron-be-used-to-do-all-things-that-can-be-done-by-nodejs/29389/8
https://stackoverflow.com/questions/16091823/get-clicked-element-using-jquery-on-event

*/
const appPath = app.getAppPath();
//const appPath = process.env.PORTABLE_EXECUTABLE_DIR;

const teamFilePath = appPath + '/teamFiles';

refreshFilesList();

$('#record').on('click', () => {
    ipcRenderer.send('RecordWindow');
});

$('#memorableDraw').on('click', () => {
    ipcRenderer.send('memorableDrawWindow');
});

$('#indexDraw').on('click', () => {
    ipcRenderer.send('indexWindow');
});



$('#Record').on('click', () => {
    ipcRenderer.send('RecordWindow');
});

$('#draw').on('click',() => {
    let quantity = $('#quantity').val();

    let list = getSplitedTextArea();

    let result = getRandomItems(list, quantity);
    $('#result').text(result);
    
 });

 $('#refreshFilesList').on('click', () =>{
     refreshFilesList();
 });

$('body').on('click', '#files .file', function(event){
    let fileName = event.target.innerText;
    console.log(fileName);

    putContextToTextArea(fileName);
});

$('#createNewFile').on('click', ()=>{
    console.log("create New File clicked");
    let list = getSplitedTextArea();
    let date = generateNewFileName();
    createFileWithContext(date, list);
});

function generateNewFileName(){
    return moment().format("YYYYMMDD_HHmmssS");
}

function getSplitedTextArea(){
    return mainTextAreaContext().split(/[\s,;]+/);
}

function mainTextAreaContext(){
    return $('#mainTextArea').val().trim();
}

function setMainTextAreaContext(newContext){
    console.log("Context:" + newContext);
    $('#mainTextArea').val(newContext);
}

function getRandomItems(list, quantity){
    let resultArray = [];
    for(let i = 0; i < quantity; i++){
        let randomIndex = getRandomNumber(0, list.length);
        resultArray.push(list.splice(randomIndex, 1));
    }
    
    return resultArray;
 }


 //min=0, max=100, returns a random integer from 0 to 99
 function getRandomNumber(min, max){
    return Math.floor(Math.random() * (max - min)) + min;     
 }

 function refreshFilesList(){
    $('#files').empty();
    fs.readdir(teamFilePath, function(err, files) {
        console.log(files);
        for (let i=0; i<files.length; i++) {
            let newDiv = document.createElement('li');
            newDiv.setAttribute("class", "file");
            newDiv.innerHTML = files[i];
            $('#files').append(newDiv);
        }
    });
 }


 function putContextToTextArea(fileName){
    let path = teamFilePath + "/" + fileName;

     fs.readFile(path, function(err, content){
         if(err){
             console.log(err);
             return;
         }
         setMainTextAreaContext(content);
     });
 }

 function createFileWithContext(fileName, content){
    let path = teamFilePath + "/" + fileName + ".json";
    let obj = {context: content, count: 0};
    let json = JSON.stringify(obj, null, 2);
    if(!fs.existsSync(path)){
        fs.writeFile(path, json, function(err){
            if(err){
                console.log(err);
                return;
            }
            console.log("Created on " + path);
            console.log("context:" + content);
            refreshFilesList();
        });
    }else{
        console.log(path+ " already exist");
    }
 }