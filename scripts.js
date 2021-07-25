document.getElementById("prev").innerHTML = "<<";
function admin() {
    window.location.href = "admin.html";
}

firebase.initializeApp(firebaseConfig);

var database = firebase.database();

const dbRef = firebase.database().ref();

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

async function postConfig(ID) {
    var updates = {};
    updates['/Config/' + ID] = {
        "CurSentance":1,
        "CurToken":1,
    };
  return firebase.database().ref().update(updates)
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

Token = "token"
refreshToken = "token"
tokensegi = 1
sentNo = 0
tokenNo = 0
var data = {}
annotator = ""

async function loadData() {
    document.getElementById("submit").style.display = "none";
    document.getElementById("annotatorSpan").innerHTML = "Annotator ID: " + annotator;
    
    var allData = {};
    await getConfig(annotator).then(data => {
        allData["config"] = data;
    })
    if(allData["config"] === null){
        postConfig(annotator)
        await getConfig(annotator).then(data => {
            allData["config"] = data;
        })
    }
    await getSentance(allData["config"]["CurSentance"]).then(data => {
        allData["data"] = data;
    })
    sentNo = allData["config"]["CurSentance"]
    tokenNo = allData["config"]["CurToken"]

    document.getElementById("sent-No").innerHTML = "Sentence #: " + sentNo;
    document.getElementById("token-No").innerHTML = "Token #: " + tokenNo;

    document.getElementById("tag").innerHTML = "Tag: Not Yet!";
    document.getElementById("segment").innerHTML = "Segment: Not Yet!";
    var Sentance = "";
    for (let token in allData["data"]) {
        if (allData["data"][token]["ID"] == tokenNo) {
            var tokensent = allData["data"][token]["Token"];
            Sentance += "<em style='color: red;'> <[ " + tokensent + " ]> </em>";
            document.getElementById("token").innerHTML = "Token: " +tokensent;
            Token = tokensent;
            refreshToken = tokensent;
        } else {
            Sentance += allData["data"][token]["Token"] + " ";
        }
    }
    document.getElementById("sentance").innerHTML = "Sentance: " +Sentance;


    content = document.getElementById("content");
    linkerrorMsg = document.getElementById("linkerror-msg");
    linkerrorMsg.style.display = "none";
    content.style.display = "block";
    data = allData;
};


async function startAnnotation(){
    annotator = document.getElementById("annotatorID").value
    if(annotator === "")
        alert("The ID should not be Empty!");
    else{
        annotator = annotator.toString().toUpperCase();
        var allData = {};
        await getConfig(annotator).then(data => {
            allData["config"] = data;
        })
        if(allData["config"] === null){
            alert("This ID is not exist!");
        }else{
            document.getElementById("startpoint").style.display = "none";
            document.getElementById("linkerror-msg").style.display = "block";
            loadData();
        }
    }
}

function nextVar() {
    if (tokensegi < Token.length - 2) {
        var first = Token.substr(0, tokensegi);
        var second = Token.substr(tokensegi + 1);
        Token = first + second.substr(0, 1) + "#" + second.substr(1);
        tokensegi += 1;
        document.getElementById("segment-id").innerHTML = Token;
    }
}

function prevVar() {
    if (tokensegi > 1) {
        var first = Token.substr(0, tokensegi);
        var second = Token.substr(tokensegi + 1);
        Token = first.substr(0, tokensegi - 1) + "#" + first.substr(tokensegi - 1, tokensegi) + second;
        tokensegi -= 1;
        document.getElementById("segment-id").innerHTML = Token;
    }
}

function segment() {
    Token = Token.substr(0, tokensegi) + "," + Token.substr(tokensegi, Token.length);
    tokensegi += 1;
    document.getElementById("segment-id").innerHTML = Token;
}


function refresh() {
    tokensegi = 1;
    Token = refreshToken.substr(0, 1) + "#" + refreshToken.substr(1, refreshToken.length);
    document.getElementById("segment-id").innerHTML = Token;
}

remTag = 1;
tag = ""

function doneWithSegmentation() {
    Token = Token.substr(0, tokensegi) + Token.substr(tokensegi + 1, Token.length);
    document.getElementById("segment").innerHTML = "Segment: "+Token;
    document.getElementById("segmentinput").style.display = "none";
    document.getElementById("segmentTag").style.display = "block";
    remTag = Token.split(",").length
    document.getElementById("rem-tag").innerHTML = remTag;
}

function addTag(tagValue) {
    if (tag === "") {
        tag += tagValue;
    } else {
        tag += "," + tagValue;
    }
    remTag -= 1;
    document.getElementById("rem-tag").innerHTML = remTag;
    document.getElementById("tag").innerHTML ="Tag: "+ tag;
    if (remTag == 0) {
        document.getElementById("segmentTag").style.display = "none";
        document.getElementById("tag-mixed").style.display = "block";
        document.getElementById("submit").style.display = "block";
    }
}

function refreshTag() {
    remTag = Token.split(",").length
    tag = ""
    document.getElementById("rem-tag").innerHTML = remTag;
    document.getElementById("tag").innerHTML ="Tag: "+ tag;
    document.getElementById("segmentTag").style.display = "block";
    document.getElementById("tag-mixed").style.display = "none";
}

function tagNonMixed(tagVal) {
    document.getElementById("tag").innerHTML = "Tag: "+tagVal;
    document.getElementById("segment").innerHTML = "Segment: "+refreshToken;
    document.getElementById("submit").style.display = "block";
}

mixed = false;
function showSegment() {
    if (!mixed) {
        document.getElementById("segmentinput").style.display = "block";
        document.getElementById("not-mixed").style.display = "none";
        Token = refreshToken.substr(0, 1) + "#" + refreshToken.substr(1, refreshToken.length);
        document.getElementById("segment-id").innerHTML = Token;
        mixed = true;
    }
    else {
        refresh();
        document.getElementById("segmentinput").style.display = "none";
        document.getElementById("tag-mixed").style.display = "none";
        document.getElementById("segmentTag").style.display = "none";
        document.getElementById("not-mixed").style.display = "block";
        mixed = false;
    }

}
function submit() {
  
    mixedTag = document.getElementById("tag").innerHTML.replace('Tag: ','')
    segm = document.getElementById("segment").innerHTML.replace('Segment: ','')
    
    Annotation = {}
    Annotation[annotator] = {
        "Tag" : mixedTag,
        "Segment" : segm
    }

    firebase.database().ref().child("Tokens").child(sentNo).child(tokenNo).child("Annotation").update(Annotation);

    tokenNo += 1
    if (typeof data["data"][tokenNo] === 'undefined') sentNo += 1
    data["config"]["CurSentance"] = sentNo
    data["config"]["CurToken"] = tokenNo
    firebase.database().ref().child("Config").child(annotator).update(data["config"])

    content = document.getElementById("content");
    linkerrorMsg = document.getElementById("linkerror-msg");
    linkerrorMsg.style.display = "block";
    content.style.display = "none";

    loadData();
}