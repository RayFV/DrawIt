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
let currentFileName = null;
let currentTeams = null;
let currentRecord = null;

refreshFilesList();

$('#record').on('click', () => {
    ipcRenderer.send('RecordWindow');
});

$('#normalDraw').on('click', () => {
    ipcRenderer.send('normalDrawWindow');
});

$('#draw').on('click',() => {
    //cooldown 3 seconds
    $('#draw').prop('disabled', true);
    window.setTimeout(function(){
        $('#draw').prop('disabled', false);
    }, 3000);
    
    let quantity = $('#quantity').val();

    let result = getRandomItemsWithRecord(currentTeams, quantity);
    $('#result').text(result);
    
 });

 $("#clearTextArea").on('click', ()=>{
    setMainTextAreaContext(""); 
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
    let date = generateNewFileNameByTime();
    createFileWithContext(date, list);
});

function generateNewFileNameByTime(){
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

 function removeAll(ary, value){
     index = ary.indexOf(value);
     while(index != -1){
         ary.splice(index, 1);
         index = ary.indexOf(value);
     }
 }

 function getRandomItemsWithRecord(list, quantity){
    //根據權重決定放入gonnaDraw陣列的數量
    let gonnaDraw = [];
    for(let i = 0; i < list.length;i++){
        let weight = Math.round(list[i].weight);
        for(let j = 0; j < weight;j++){
            gonnaDraw.push(list[i]);
        }
    }

    //打亂gonnaDraw
    console.log("length:" + gonnaDraw.length);
    console.log(JSON.stringify(gonnaDraw));
    gonnaDraw = gonnaDraw.sort(function() {
        return Math.random() - 0.5;
    });
    console.log("length:" + gonnaDraw.length);
    console.log(JSON.stringify(gonnaDraw));
    
    //抽取
    let resultArray = []
    for(let i = 0; i< quantity; i++){
        let randomIndex = getRandomNumber(0, gonnaDraw.length);
        let luckyGuy = gonnaDraw[randomIndex];
        resultArray.push(luckyGuy.name);
        luckyGuy.weight = Math.floor(list.length * 0.3);
        luckyGuy.count++;
        removeAll(gonnaDraw, luckyGuy);
    }

    //增加沒被抽到的權重
    while(gonnaDraw.length > 0){
        let unluckyGuy = gonnaDraw[0];
        unluckyGuy.weight = Math.round((unluckyGuy.weight + list.length * 0.1) * 100) / 100;

        removeAll(gonnaDraw, unluckyGuy);
    }

    //記錄一下
    currentRecord.push(new Record(resultArray, generateNewFileNameByTime()));

    //儲存Json
    saveData(teamFilePath + "/" + currentFileName);

    //回傳被抽到的Array
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

 function createFileWithContext(fileName, contentList){
    fileName = fileName + ".json";
    let path = teamFilePath + "/" + fileName;
    if(!fs.existsSync(path)){
        
        let contentAry = [];
        for(let i = 0; i < contentList.length; i++){
            contentAry.push(new Team(i, contentList[i], contentList.length, 0));
        }
        currentTeams = contentAry;
        currentRecord = [];
        saveData(path);
        currentFileName = fileName;
    }else{
        console.log(path+ " already exist");
    }
 }

function saveData(path){
    let content = {"teams":currentTeams, "record":currentRecord};
    let json = JSON.stringify(content, null, 2);
    fs.writeFile(path, json, function(err){
        if(err){
            console.log(err);
            return;
        }
        console.log("Update on " + path);
        console.log("json:" + json);
        refreshFilesList();
        
    });
}

function Team(id, name, weight, count){
    this.id = id;
    this.name = name;
    this.weight = weight;
    this.count = count;
}

function Record(content, drawTime){
    this.content = content.join(",");
    this.drawTime = drawTime;
}