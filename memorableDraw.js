const $ = require('jquery');
require( 'datatables.net-bs4' )();
require( 'datatables.net-buttons-bs4' )();
require( 'datatables.net-scroller-bs4' )();
require( 'datatables.net-select-bs4' )();
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
let table = null;
let currentFileName = null;
let currentTeams = null;
let currentRecord = null;
let firstTime = true;

$('#record').on('click', () => {
    ipcRenderer.send('RecordWindow');
});

$('#memorableDraw').on('click', () => {
    ipcRenderer.send('memorableDrawWindow');
});

$('#normalDraw').on('click', () => {
    ipcRenderer.send('normalDrawWindow');
});

$('#createNewFile').on('click', ()=>{
    ipcRenderer.send('createNewFileWindow');
    /*
    console.log("create New File clicked");
    */
});

ipcRenderer.on('fileCreate', function(e, fileName, content){
    let list = content.split(/[\s,;]+/);
    createFileWithContext(fileName, list);
});

$('#insertNewItem').on('click', () => {
    ipcRenderer.send('insertItemWindow');
});

ipcRenderer.on('item:add', function(e, item){
    insertItem(item);
    setTableData();
});


$('#draw').on('click',() => {
    //cooldown 3 seconds
    $('#draw').prop('disabled', true);
    window.setTimeout(function(){
        $('#draw').prop('disabled', false);
    }, 3000);
    
    let quantity = $('#quantity').val();

    let result = getRandomItemsWithRecord(currentTeams, quantity);
    $('#result').show();
    $('#result').text("恭喜：" + result);
    setTableData();
    
 });


 $('#refreshFilesList').on('click', () =>{
     refreshFilesList();
 });

$('body').on('click', '#files .file', function(event){
    let fileName = event.target.innerText;
    console.log(fileName);

    putContextToTable(fileName);
});



function generateTime(){
    return moment().format("YYYY-MM-DD_HH:mm:ssS");
}


$('body').on('click', '#teamTable tbody button', function () {
    var data = table.row( $(this).parents('tr') ).data();
    console.log("clicked " + data[0]);
    removeTeamItem(data[0]);
    setTableData();
} );

$("#deleteButton").on('click', (e)=>{
    e.preventDefault();

    let column = table.column(4);
    console.log(column);
    // Toggle the visibility
    if(!column.visible()){
        $("#deleteButton").text("完成");
    }else{
        $("#deleteButton").text("Delete");
    }
    column.visible( ! column.visible() );
})

function removeTeamItem(id){
    for(let i = 0; i < currentTeams.length ; i++){
        if(currentTeams[i].id === id){
            currentTeams.splice(i, 1);
        }
    }
    //儲存Json
    saveData(teamFilePath + "/" + currentFileName);
}

function insertItem(name){
    let newItem = new Team(currentTeams[currentTeams.length-1].id + 1, name, currentTeams.length+1, 0);
    currentTeams.push(newItem);
    //儲存Json
    saveData(teamFilePath + "/" + currentFileName);
}

function setTableData(){   
    table.clear();
    for(let i = 0; i < currentTeams.length;i++){
        let obj = currentTeams[i];
            table.row.add( [
            obj.id,
            obj.name,
            (Math.floor((obj.weight/getTotalWeight()) * 10000) / 100) + "%",
            obj.count,
            "<button type='button' class='btn btn-danger btn-sm'  id='" + obj.id + "'>Delete</button>"
        ] ).draw();  
    }
}

function createTable(){
    $("#teamTable").dataTable( {
        "lengthChange": false,
        "searching": false,
        "paging": false,
        "info": false
    } );
    table = $("#teamTable").DataTable();
}


 function removeAll(ary, value){
     index = ary.indexOf(value);
     while(index != -1){
         ary.splice(index, 1);
         index = ary.indexOf(value);
     }
 }

 function getTotalWeight(){
     let total = 0;
    for(let i = 0; i < currentTeams.length;i++){
        total += currentTeams[i].weight;
    }
    return total;
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
    currentRecord.push(new Record(resultArray, generateTime()));

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
        for (let i=files.length-1; i>=0; i--) {
            let newDiv = document.createElement('li');
            newDiv.setAttribute("class", "file");
            newDiv.innerHTML = files[i];
            $('#files').append(newDiv);
        }
        if(firstTime){
            console.log("first time");
            firstTime=false;
            $("#files .file:first").trigger('click');
        }else{
            
            setTableData();
        }
    });
 }


 function putContextToTable(fileName){
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
        setTableData();
    });    
 }

 function createFileWithContext(fileName, contentList){
    fileName = fileName + ".json";
    let path = teamFilePath + "/" + fileName;
    if(!fs.existsSync(path)){
        
        let contentAry = [];
        for(let i = 0; i < contentList.length; i++){
            contentAry.push(new Team(i+1, contentList[i], contentList.length, 0));
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

refreshFilesList();
createTable();
$('#result').hide();
$("#deleteButton").click();
