const $ = require('jquery');
const fs = require("fs");
const moment = require("moment");
const {remote} = require("electron");
const {app} = remote;
const {ipcRenderer} = require("electron");

const appPath = app.getAppPath();
//const appPath = process.env.PORTABLE_EXECUTABLE_DIR;

const teamFilePath = appPath + '/teamFiles';
const table = document.getElementById('recordTable');
const tbody = document.createElement('tbody');
table.appendChild(tbody);

let allRecords = [];
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

$('body').on('click', '#files .file', function(event){
    let fileName = event.target.innerText;
    console.log(fileName);

    refreshTable(fileName);
    refreshFuture(fileName);
});

function showTable(allRecords){
    $('#recordTable tbody').empty();
    for(let i = 0; i < allRecords.length ; i++){
        let tr = document.createElement('tr');
        
        let th = document.createElement('th');
        th.setAttribute("scope", "row");
        th.innerHTML = i + 1;
        tr.appendChild(th);

        let content_td = document.createElement('td');
        content_td.innerHTML = allRecords[i].content;
        console.log(allRecords[i].content);
        tr.appendChild(content_td);

        let drawTime_td = document.createElement('td');
        drawTime_td.innerHTML = allRecords[i].drawTime;
        tr.appendChild(drawTime_td);

        tbody.appendChild(tr);
    }
}

function showFuture(teams){
    let totalWeight = 0;
    for(let i = 0; i < teams.length; i++){
        totalWeight += teams[i].weight;
    }

    let result = "";
    for(let i = 0; i <teams.length; i++){
        result = result + teams[i].name + "_" + Math.floor((teams[i].weight/totalWeight) * 100) + "_" + teams[i].count + "\n";
    }
    console.log(result);
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

 function refreshTable(fileName){
    let path = teamFilePath + "/" + fileName;
    fs.readFile(path, function(err, content){
        if(err){
            console.log(err);
            return;
        }
        json = JSON.parse(content);
        let records = json.record;
        
        let list = [];
        for(let i = 0; i < records.length;i++){
            list.push(records[i]);
        }

        showTable(list);
    });
 }


 function refreshFuture(fileName){
    let path = teamFilePath + "/" + fileName;
    fs.readFile(path, function(err, content){
        if(err){
            console.log(err);
            return;
        }
        json = JSON.parse(content);
        let records = json.teams;
        
        let list = [];
        for(let i = 0; i < records.length;i++){
            list.push(records[i]);
        }

        showFuture(list);
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