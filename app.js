var ace1 = ace;
var editor = ace1.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/javascript");

var ace1 = ace;
var palEditor = ace1.edit("pal-editor");
palEditor.setTheme("ace/theme/monokai");
palEditor.session.setMode("ace/mode/text");

var ace2 = ace;
var valEditor = ace2.edit("val-editor");
valEditor.setTheme("ace/theme/monokai");
valEditor.session.setMode("ace/mode/text");

var ace3 = ace;
var macroEditor = ace3.edit("macro-editor");
macroEditor.setTheme("ace/theme/monokai");
macroEditor.session.setMode("ace/mode/text");

editor.resize();
palEditor.resize();
valEditor.resize();
macroEditor.resize();


const model = document.getElementById("model");
const macro = document.getElementById("macro");
const value = document.getElementById("value");
const pallate = document.getElementById("pallate");
const run = document.getElementById("run");
const modelWindow = document.getElementById("editor");
const macroWindow = document.getElementById("macro-editor");
const valueWindow = document.getElementById("val-editor");
const palWindow = document.getElementById("pal-editor");

model.addEventListener("click",modelClick);
macro.addEventListener("click",macroClick);
value.addEventListener("click",valueClick);
pallate.addEventListener("click",palClick);
run.addEventListener("click",runSimulation);

function modelClick(e){
    modelWindow.style.display = "block";
    macroWindow.style.display = "none";
    valueWindow.style.display = "none";
    palWindow.style.display = "none";
    model.classList.add("active");
    macro.classList.remove("active");
    value.classList.remove("active");
    pallate.classList.remove("active");
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
}

window.onload = function() {
    modelClick();
  };

function runSimulation(e){

    var projectName = document.getElementById("projectInput").value;
    var formData = new FormData();
    var files = [];
    let cnt = 0;
    if(editor.getValue()!==""){
        files[cnt++] = new File([editor.getValue()], projectName+".ma", {
            type: "text/plain",
          });
    }
    if(palEditor.getValue()!==""){
        files[cnt++] = new File([editor.getValue()], projectName+".pal", {
            type: "text/plain",
          });
    }
    if(valEditor.getValue()!==""){
        files[cnt++] = new File([editor.getValue()], projectName+".val", {
            type: "text/plain",
          });
    }
    console.log(files);
    Array.from(files).forEach(file => {
        formData.append('files', file);
    });

    fetch('http://localhost:8080/cell-devs/upload',{
        method: 'POST',
        body: formData
    }).then(function (response) {
    if (response.ok) {
        console.log(response);
        document.getElementById("visulization").innerHTML='<iframe class="popup" src="http://localhost/app-embed/index.html?path='+projectName+'"></iframe>';
    } else {
        console.log("Error while running simulation")
    }
    });
}

  