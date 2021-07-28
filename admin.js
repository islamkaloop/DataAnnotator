function index() {
    window.location.href = "index.html";
}

function admin(){
    psswrd = document.getElementById("password").value
    if(psswrd === password){
        document.getElementById("startpoint").style.display = "none";
        document.getElementById("mainfunctions").style.display = "block";
        document.getElementById("content").style.display = "block";
    }else{
        alert("Incorrect Password!");
    }
}

firebase.initializeApp(firebaseConfig);

var database = firebase.database();

const dbRef = firebase.database().ref();

async function getAllConfig() {
    return new Promise((resolve, reject) => {
        dbRef.child("Config").get()
            .then((snapshot) => {
                return snapshot.val();
            })
            .then(data => {
                resolve(data);
            });
    })
}
async function getConfig(ID) {
    return new Promise((resolve, reject) => {
        dbRef.child("Config").child(ID).get()
            .then((snapshot) => {
                return snapshot.val();
            })
            .then(data => {
                resolve(data);
            });
    })
}

async function getData() {
    return new Promise((resolve, reject) => {
        dbRef.get()
            .then((snapshot) => {
                return snapshot.val();
            })
            .then(data => {
                resolve(data);
            });
    })
}

async function getSentance(sentNo) {
    return new Promise((resolve, reject) => {
        dbRef.child("Tokens").child(sentNo.toString()).get()
            .then((snapshot) => {
                return snapshot.val();
            })
            .then(data => {
                resolve(data);
            });
    })
}

async function deleteAnnotator(id){
    if(confirm("Are You Sure that you want to delete \""+id+"\" Annotator?")){
        dbRef.child("Config").child(id).remove();
        fillTable();
    }
}
function loadTableData(items) {
    const table = document.getElementById("data");
    table.innerHTML = "";
    for (const key of Object.keys(items)) {
      let row = table.insertRow();
      row.insertCell(0).innerHTML = key;
      row.insertCell(1).innerHTML = items[key].StartSent;
      row.insertCell(2).innerHTML = items[key].StartToken;
      row.insertCell(3).innerHTML = items[key].CurSentance;
      row.insertCell(4).innerHTML = items[key].CurToken;
      row.insertCell(5).innerHTML = items[key].CurToken - items[key].StartToken;
      var btn = document.createElement("button");
      btn.innerHTML = "DELETE";                
      row.insertCell(6).appendChild(btn); 
      btn.id = key;
      btn.setAttribute("onclick", "deleteAnnotator(this.id)");
    };
}

async function fillTable(){
    var Data = {};
    await getAllConfig().then(data => {
        Data = data;
    })
    loadTableData(Data);
}

function monitor(){
    document.getElementById("mainfunctions").style.display = "none";
    document.getElementById("monitor").style.display = "block";
    fillTable();
}

function backMonitor(){
    document.getElementById("monitor").style.display = "none";
    document.getElementById("help").style.display = "none";
    document.getElementById("mainfunctions").style.display = "block";
}

function showHelp(){
    document.getElementById("mainfunctions").style.display = "none";
    document.getElementById("help").style.display = "block";
}

function newAnnotator(){
    document.getElementById("monitor").style.display = "none";
    document.getElementById("newAnnotator").style.display = "block";
}

function backNewAnnotator(){
    document.getElementById("newAnnotator").style.display = "none";
    document.getElementById("monitor").style.display = "block";
}

async function createNewAnnotator(){
    ID = document.getElementById("ID").value
    StartSent = document.getElementById("startsent").value
    if(ID === "" || StartSent === ""){
        alert("Make sure that you entered ID and Start Sentance values!");
    }else{
        annotator = ID.toString().toUpperCase();
        var allData = {};
        await getConfig(annotator).then(data => {
            allData["config"] = data;
        })
        if(allData["config"] === null){
            await getSentance(StartSent).then(data => {
                allData["data"] = data;
            })
            var updates = {};
            updates['/Config/' + annotator] = {
                "CurSentance":parseInt(StartSent),
                "CurToken":parseInt(Object.keys(allData["data"])[0]),
                "StartSent":parseInt(StartSent),
                "StartToken":parseInt(Object.keys(allData["data"])[0])
            };
            firebase.database().ref().update(updates);
            document.getElementById("newAnnotator").style.display = "none";
            document.getElementById("monitor").style.display = "block";
            fillTable();
            ID = document.getElementById("ID").value = ""
            StartSent = document.getElementById("startsent").value = ""
        }else{
            alert("This ID is already exist!");
        }
        
    }
}

function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

async function downloadJSON(){
    console.log("d")
    Data = {}
    await getData().then(data => {
        downloadObjectAsJson(data,"data");
        Data["Data"] = data;
    })
    console.log(Data)
}