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

//const appPath = app.getAppPath();
const appPath = process.env.PORTABLE_EXECUTABLE_DIR;

const teamFilePath = appPath + '/teamFiles';
let table = null;

let currentFileName = null;
let currentRecords = null;

//datatable

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

    putRecordToTable(fileName);
});



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
        $("#files .file:first").trigger('click');
    });
 }

 function setTableData(){   
    table.clear();
    let count = 1;
    for(let i = 0; i < currentRecords.length;i++){
        let obj = currentRecords[i];
            table.row.add( [
            count++,
            obj.drawTime,
            obj.content
        ] ).draw();  
    }
}

function createTable(){
    $("#recordTable").dataTable( {
        "lengthChange": false,
        "searching": false,
        "paging": false,
        "info": false
    } );
    table = $("#recordTable").DataTable();
}

function putRecordToTable(fileName){
    let path = teamFilePath + "/" + fileName;
    fs.readFile(path, function(err, content){
        if(err){
            console.log(err);
            return;
        }
        json = JSON.parse(content);
        currentFileName = fileName;
        currentRecords = json.record;
        
        setTableData();
    });    
 }


function Record(content, drawTime){
    this.content = content.join(",");
    this.drawTime = drawTime;
}

refreshFilesList()
createTable();