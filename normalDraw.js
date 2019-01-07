const $ = require('jquery');
const fs = require("fs");
const {remote} = require("electron");
const {app} = remote;
const {ipcRenderer} = require("electron");

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

$('#normalDraw').on('click', () => {
    ipcRenderer.send('normalDrawWindow');
});



$('#Record').on('click', () => {
    ipcRenderer.send('RecordWindow');
});

$('#draw').on('click',() => {
    let quantity = $('#quantity').val();

    let list = getSplitedTextArea();

    let result = getRandomItems(list, quantity);
    $('#result').show();
    $('#result').text("恭喜：" + result);
    
 });

 $('#refreshFilesList').on('click', () =>{
     refreshFilesList();
 });

$('body').on('click', '#files .file', function(event){
    let fileName = event.target.innerText;
    console.log(fileName);

    putContextToTextArea(fileName);
});

$("#clearTextArea").on('click', ()=>{
    setMainTextAreaContext(""); 
});

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
        json = JSON.parse(content);
        currentFileName = fileName;
        currentTeams = json.teams;
        currentRecord = json.record;
        
        let list = [];
        for(let i = 0; i < currentTeams.length;i++){
            list.push(currentTeams[i].name);
        }

        setMainTextAreaContext(list);
    });    
 }

 
$('#result').hide();
