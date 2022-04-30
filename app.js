import WDSV from '../app-embed/WDSV.js'

var host = "http://devs-simulators.sce.carleton.ca:8080/Cell-DEVS-2.6.2";
var ace1 = ace;
var editor = ace1.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/javascript");
editor.getSession().setUseWorker(false);

var ace1 = ace;
var palEditor = ace1.edit("pal-editor");
palEditor.setTheme("ace/theme/monokai");
palEditor.session.setMode("ace/mode/javascript");
palEditor.getSession().setUseWorker(false);

var ace3 = ace;
var macroEditor = ace3.edit("macro-editor");
macroEditor.setTheme("ace/theme/monokai");
macroEditor.session.setMode("ace/mode/javascript");
macroEditor.getSession().setUseWorker(false);

var ace2 = ace;
var valEditor = ace2.edit("val-editor");
valEditor.setTheme("ace/theme/monokai");
valEditor.session.setMode("ace/mode/javascript");
valEditor.getSession().setUseWorker(false);



editor.resize();
palEditor.resize();
valEditor.resize();
macroEditor.resize();


const model = document.getElementById("model");
const macro = document.getElementById("macro");
const value = document.getElementById("value");
const pallate = document.getElementById("pallate");
const run = document.getElementById("run");
const download = document.getElementById("download");
const modelWindow = document.getElementById("editor");
const macroWindow = document.getElementById("macro-editor");
const valueWindow = document.getElementById("val-editor");
const palWindow = document.getElementById("pal-editor");
const expandWindow = document.getElementById("expand");
const expandCode = document.getElementById("expand-code");
const upload = document.getElementById("upload");
const clear = document.getElementById("erase");
const switchModal = document.getElementById("switchModal");


model.addEventListener("click",modelClick);
macro.addEventListener("click",macroClick);
value.addEventListener("click",valueClick);
pallate.addEventListener("click",palClick);
run.addEventListener("click",runSimulation);
download.addEventListener("click",downloadZIP);
expandWindow.addEventListener("click",expandEditor);
expandCode.addEventListener("click",expandCodeEditor);
upload.addEventListener("click",uploadFiles);
clear.addEventListener("click",clearScreen);
switchModal.addEventListener("click",setStateVariables);

function modelClick(e){
    modelWindow.style.display = "block";
    macroWindow.style.display = "none";
    valueWindow.style.display = "none";
    palWindow.style.display = "none";
    model.classList.add("active");
    macro.classList.remove("active");
    value.classList.remove("active");
    pallate.classList.remove("active");
    editor.resize();
}
function macroClick(e){
    macroWindow.style.display = "block";
    modelWindow.style.display = "none";
    valueWindow.style.display = "none";
    palWindow.style.display = "none";
    macro.classList.add("active");
    model.classList.remove("active");
    value.classList.remove("active");
    pallate.classList.remove("active");
    macroEditor.resize();
}
function valueClick(e){
    valueWindow.style.display = "block";
    modelWindow.style.display = "none";
    macroWindow.style.display = "none";
    palWindow.style.display = "none";
    value.classList.add("active");
    model.classList.remove("active");
    macro.classList.remove("active");
    pallate.classList.remove("active");
    valEditor.resize();
}
function palClick(e){
    palWindow.style.display = "block";
    modelWindow.style.display = "none";
    valueWindow.style.display = "none";
    macroWindow.style.display = "none";
    pallate.classList.add("active");
    model.classList.remove("active");
    value.classList.remove("active");
    macro.classList.remove("active");
    palEditor.resize();
}

window.onload = function() {
    modelClick();
    loadProjects();
  };


function setStateVariables(){
    let stfileName = document.getElementById("stvalFilename").value;
    let stvalues = document.getElementById("stvalues").value;
    if(stfileName==="" || stvalues===""){
        return null;
    }
    else{
        return new File([stvalues], stfileName, {
            type: "text/plain",
        });
    }
}
/**
 * Run Simulation and Make ZIP file
 */
var projectName;
var macroName;
var zip;
function runSimulation(e){
    zip = new JSZip();
    projectName = document.getElementById("projectInput").value;
    macroName = document.getElementById("macroInput").value;
    let simulationTime = document.getElementById("simulationTime");
    if(!validateSimulationTime(simulationTime.value)){
        simulationTime.classList.add('is-invalid');
        return;
    }
    simulationTime.classList.remove('is-invalid');
    simulationTime.classList.add('is-valid');
    let simulator = document.querySelector('input[name="flexRadioDefault"]:checked').id;
    let url = host+'/cell-devs/upload?simTime='+simulationTime.value+'&simulator='+simulator;
    var myModalEl = document.getElementById('staticBackdrop');
    var modal = bootstrap.Modal.getInstance(myModalEl)
    modal.hide();
    let vis = document.getElementById("visulization");
    vis.innerHTML = "";
    vis.style.display = "block";
    vis.innerHTML = '<div id="overlay"><span class="loader1-text">Running Simulation</span><br><span class="loader1"><span class="loader1-inner"></span></span></div>'
    var formData = new FormData();
    var files = [];
    let cnt = 0;
    if(editor.getValue()!==""){
        files[cnt++] = new File([editor.getValue()], "model.ma", {
            type: "text/plain",
          });
    }
    if(palEditor.getValue()!==""){
        files[cnt++] = new File([palEditor.getValue()], "style.pal", {
            type: "text/plain",
          });
    }
    if(valEditor.getValue()!==""){
        files[cnt++] = new File([valEditor.getValue()], "initial.val", {
            type: "text/plain",
          });
    }
    if(macroEditor.getValue()!==""){
        files[cnt++] = new File([macroEditor.getValue()],macroName, {
            type: "text/plain"
        });
        url += '&macro='+macroName;
    }

    let stvalue = setStateVariables();
    if(stvalue!=null){
        files[cnt++] = stvalue;
    }
    Array.from(files).forEach(file => {
        formData.append('files', file);
    });
    console.log(files);
    url += "&debug="+document.getElementById("debug").checked;
    
    fetch(url,{
        method: 'POST',
        body: formData
    }).then(function (response) {
    if (response.ok) {
        download.classList.remove('d-none');
        if(document.getElementById("editor-tool").style.display!=="block"){
            expandCodeEditor();
        }
        document.getElementById("projectInput").value = "";
        document.getElementById("macroInput").value = "";
        document.getElementById("simulationTime").value = "";
        simulationTime.classList.remove('is-valid');
        return response.blob();
    } else {
        if(document.getElementById("editor-tool").style.display!=="block"){
            expandCodeEditor();
        }
        let errorText = "Error while running the simulation, Please check the model files. Run with debug mode for more information.";
        // console.log(response.blob());
        let new_zip = new JSZip();
            new_zip.loadAsync(response.blob()).then(content => {
                Object.keys(content.files).forEach(function (filename) {
                    content.files[filename].async('string').then(function (fileData) {
                        if(filename==="stdout.log"){
                            vis.innerHTML="";
                            let errorDiv = document.createElement("div");
                            if(document.getElementById("debug").checked){
                                download.classList.remove('d-none');
                                
                            }
                            errorDiv.innerHTML = fileData.replace(/\n/g, '<br>');
                            errorDiv.classList.add("blink_me");
                            vis.appendChild(errorDiv);
                        }
                        zip.file(filename, new File([fileData],filename, {
                                type: "text/plain"
                            })
                        )
                    })
                })
            })
            
            throw Error("Error");
    }
    }).then(data => {
            let new_zip = new JSZip();
            new_zip.loadAsync(data).then(content => {
                Object.keys(content.files).forEach(function (filename) {
                    content.files[filename].async('string').then(function (fileData) {
                        if(filename.includes("messages.log")){
                            files[cnt++] = new File([fileData],"messages.log", {
                                    type: "text/plain"
                            });
                            vis.innerHTML="";
                            var viewer = new WDSV(vis, {},files);
                            viewer.On("Error", (error) => alert(error.toString())); 
                        }
                        zip.file(filename, new File([fileData],filename, {
                                type: "text/plain"
                            })
                        );
                    })
                })
            })
        }
    ).catch(error => {
        console.log("Error while running")
    });
}

function expandEditor(){
    let codeTool = document.getElementById("code-tool");
    let simulationTool = document.getElementById("editor-tool");
    let vis = document.getElementById("visulization");
    if(simulationTool.style.width==="100%"){
        simulationTool.style.width = "50%";
        simulationTool.style.display = "block";
        codeTool.style.display = "block";
        vis.style.display = "block";
        vis.style.width = "50%";
        modelWindow.style.width = "50%";
        macroWindow.style.width = "50%";
        valueWindow.style.width = "50%";
        palWindow.style.width = "50%";
        modelWindow.style.display = "block";
        macroWindow.style.display = "block";
        valueWindow.style.display = "block";
        palWindow.style.display = "block";
    }
    else{
        simulationTool.style.width = "100%";
        codeTool.style.display = "none";
        modelWindow.style.display = "none";
        macroWindow.style.display = "none";
        valueWindow.style.display = "none";
        palWindow.style.display = "none";
        vis.style.display = "block";
        vis.style.width = "100%";
    }
    editor.resize();
    macroEditor.resize();
    valEditor.resize();
    palEditor.resize();
}

function expandCodeEditor(){
    let codeTool = document.getElementById("code-tool");
    let simulationTool = document.getElementById("editor-tool");
    let vis = document.getElementById("visulization");
    if(codeTool.style.width==="50%"){
        codeTool.style.width = "100%";
        simulationTool.style.display = "none";
        vis.style.display = "none";
        modelWindow.style.width = "100%";
        macroWindow.style.width = "100%";
        valueWindow.style.width = "100%";
        palWindow.style.width = "100%";
    }
    else{
        codeTool.style.width = "50%";
        simulationTool.style.display = "block";
        vis.style.display = "block";
        modelWindow.style.width = "50%";
        macroWindow.style.width = "50%";
        valueWindow.style.width = "50%";
        palWindow.style.width = "50%";
    }
    editor.resize();
    macroEditor.resize();
    valEditor.resize();
    palEditor.resize();
}

function downloadZIP(){
    zip.generateAsync({type:"blob"})
    .then(function(content) {
        saveAs(content, projectName+".zip");
    });
}


function validateSimulationTime(simulationTime){
    let valid = /([0-9][0-9]:[0-5][0-9]:[0-5][0-9])/.exec(simulationTime);
    return valid;
}

function uploadFiles(){
    let fileList = document.getElementById("formFileMultiple").files;
    Array.from(fileList).forEach(file => {
        var reader = new FileReader();
        reader.onloadend = function () {
            if(file.name.toLowerCase().includes(".ma")){
                editor.session.setValue(reader.result);   
            }
            if(file.name.toLowerCase().includes(".inc")){
                macroEditor.session.setValue(reader.result);
            }
            else if(file.name.toLowerCase().includes(".val")){
                valEditor.session.setValue(reader.result);
            }
            else if(file.name.toLowerCase().includes(".pal")){
                palEditor.session.setValue(reader.result);
            }
            if(file.name.toLowerCase().includes(".stvalues")){
                document.getElementById("stvalFilename").value = file.name;
                document.getElementById("stvalues").value = reader.result;
            }
        }
        reader.readAsText(file);
    })
    var myModalEl = document.getElementById('exampleModal');
    var modal = bootstrap.Modal.getInstance(myModalEl)
    modal.hide();
}
  
function loadProjects(){
    fetch(host+'/cell-devs/projects',{
        method: 'GET'
    }).then(function (response) {
        if(response.ok){
            return response.json();
        }
        else{
            console.log("Error while loading projects");
        }
    }).then(data => {
        data.forEach(d => {
            let modal = document.getElementById("projects");
            modal.innerHTML += '<div class="d-grid gap-2"> <button class="btn btn-outline-light" style="color:black;" id="project-button" type="button">'+d+'</button></div>';
        })
    })
}

document.addEventListener("click", async function(e){
    if(e.target.id==="project-button"){
        fetch(host+'/cell-devs/project/'+e.target.innerHTML,{
            method: 'GET'
        }).then(function (response) {
            if(response.ok){
                let myModalEl = document.getElementById('exampleModal1');
                let modal = bootstrap.Modal.getInstance(myModalEl)
                modal.hide();
                clearScreen();
                return response.blob();
            }
            else{
                console.log("Error while loading projects");
            }
        }).then(data => {
            var new_zip = new JSZip();
            new_zip.loadAsync(data).then(content => {
                Object.keys(content.files).forEach(function (filename) {
                    content.files[filename].async('string').then(function (fileData) {
                        if(filename.includes(".ma")){
                            editor.session.setValue(fileData);
                        }   
                        else if(filename.includes(".pal")){
                            palEditor.session.setValue(fileData);
                        }  
                        else if(filename.includes(".inc")){
                            macroEditor.session.setValue(fileData);
                        }
                        else if(filename.includes(".val")){
                            valEditor.session.setValue(fileData);
                        }
                        else if(filename.toLowerCase().includes(".stvalues")){
                            document.getElementById("stvalFilename").value = filename;
                            document.getElementById("stvalues").value =fileData;
                        }
                    })
                })
            })
        })
    }
    else if(e.target.id==="santi"){
        document.getElementById('stval').style.display = 'block';
    }
})

function clearScreen(){
    return new Promise((resolve,reject)=>{
        editor.session.setValue("");
        palEditor.session.setValue("");
        macroEditor.session.setValue("");
        valEditor.session.setValue("");
        projectName = "";
        download.classList.add('d-none');
        document.getElementById("visulization").style.display="none";
        document.getElementById("stvalFilename").value = "";
        document.getElementById("stvalues").value = "";
        resolve();
    });
}