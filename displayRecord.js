const $ = require('jquery');
const fs = require("fs");
const moment = require("moment");
const {remote} = require("electron");
const {app} = remote;

const appPath = app.getAppPath();
//const appPath = process.env.PORTABLE_EXECUTABLE_DIR;

const teamFilePath = appPath + '/teamFiles';

let allRecords = [];


function readRecord(fileName){
    let path = teamFilePath + "/" + fileName;
    fs.readFile(path, function(err, content){
        if(err){
            console.log(err);
            return;
        }
        json = JSON.parse(content);

        allRecords.push(json.record);
        
    });
 }

function show(){
    let table = document.getElementById('');
    let newDiv = document.createElement('li');
            newDiv.setAttribute("class", "file");
            newDiv.innerHTML = files[i];
            $('#files').append(newDiv);
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