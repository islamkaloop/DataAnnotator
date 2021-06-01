document.getElementById("prev").innerHTML = "<<";
var firebaseConfig = {
    apiKey: "AIzaSyAiK_KRw568VgJ9J3jxrk1ojxcOi2M-28A",
    authDomain: "data-annotator-d31b7.firebaseapp.com",
    databaseURL: "https://data-annotator-d31b7-default-rtdb.firebaseio.com",
    projectId: "data-annotator-d31b7",
    storageBucket: "data-annotator-d31b7.appspot.com",
    messagingSenderId: "870056724106",
    appId: "1:870056724106:web:ad167446ae97711ee40f73"
};


firebase.initializeApp(firebaseConfig);

var database = firebase.database();

const dbRef = firebase.database().ref();

async function getConfig() {
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
async function loadData() {
    var allData = {};
    await getConfig().then(data => {
        allData["config"] = data;
    })
    await getSentance(allData["config"]["CurSentance"]).then(data => {
        allData["data"] = data;
    })
    sentNo = allData["config"]["CurSentance"]
    tokenNo = allData["config"]["CurToken"]

    document.getElementById("sent-No").innerHTML = "Sentence #: " + sentNo;
    document.getElementById("token-No").innerHTML = "Token #: " + tokenNo;
    var Sentance = "";
    for (let token in allData["data"]) {
        if (allData["data"][token]["ID"] == tokenNo) {
            var tokensent = allData["data"][token]["Token"];
            Sentance += "<em style='color: red;'> <[ " + tokensent + " ]> </em>";
            document.getElementById("token").innerHTML = tokensent;
            Token = tokensent;
            refreshToken = tokensent;
        } else {
            Sentance += allData["data"][token]["Token"] + " ";
        }
    }
    document.getElementById("sentance").innerHTML = Sentance;


    content = document.getElementById("content");
    linkerrorMsg = document.getElementById("linkerror-msg");
    linkerrorMsg.style.display = "none";
    content.style.display = "block";
    data = allData;
};
loadData();

function nextVar() {
    if (tokensegi < Token.length - 2) {
        var first = Token.substr(0, tokensegi);
        var second = Token.substr(tokensegi + 1);
        Token = first + second.substr(0, 1) + "#" + second.substr(1);
        console.log(Token);
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
        console.log(Token);
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
    document.getElementById("segment").innerHTML = Token;
    document.getElementById("segmentinput").style.display = "none";
    document.getElementById("segmentTag").style.display = "block";
    remTag = Token.split(",").length
    console.log(remTag);
    document.getElementById("rem-tag").innerHTML = remTag;

    console.log(Token);
}

function addTag(tagValue) {
    if (tag === "") {
        tag += tagValue;
    } else {
        tag += "," + tagValue;
    }
    remTag -= 1;
    document.getElementById("rem-tag").innerHTML = remTag;
    document.getElementById("tag").innerHTML = tag;
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
    document.getElementById("tag").innerHTML = tag;
    document.getElementById("segmentTag").style.display = "block";
    document.getElementById("tag-mixed").style.display = "none";
}

function tagNonMixed(tagVal) {
    document.getElementById("tag").innerHTML = tagVal;
    document.getElementById("segment").innerHTML = refreshToken;
    document.getElementById("submit").style.display = "block";

    // firebase.database().ref().remove()
    // firebase.database().ref().get().then((snapshot) => {
    //     console.log(snapshot.val());
    // })
}

mixed = false;
function showSegment() {
    console.log(data);
    if (!mixed) {
        document.getElementById("segmentinput").style.display = "block";
        document.getElementById("not-mixed").style.display = "none";
        refreshToken = Token;
        Token = Token.substr(0, 1) + "#" + Token.substr(1, Token.length);
        document.getElementById("segment-id").innerHTML = Token;
        mixed = true;
    }
    else {
        document.getElementById("segmentinput").style.display = "none";
        document.getElementById("not-mixed").style.display = "block";
        mixed = false;
    }

}
function submit() {
    tag = ""
    mixedTag = ""
    if (mixed) {
        tag = "MIXED"
        mixedTag = document.getElementById("tag").innerHTML
    }
    else {
        tag = document.getElementById("tag").innerHTML
        mixedTag = tag
    }
    segm = document.getElementById("segment").innerHTML
    segLen = ""
    segArray = segm.split(",");
    for (let se in segArray) {
        console.log(segArray[se]);
        console.log(segArray[se].length);
        if (segLen === "") segLen += segArray[se].length
        else segLen += "," + segArray[se].length
    }
    console.log(tag, mixedTag, segm, segLen);

    data["data"][tokenNo]["Tag"] = tag
    data["data"][tokenNo]["MixedTag"] = mixedTag
    data["data"][tokenNo]["Segem"] = segm
    data["data"][tokenNo]["SegemN"] = segLen

    firebase.database().ref().child("Tokens").child(sentNo).child(tokenNo).update(data["data"][tokenNo]);

    tokenNo += 1
    if (typeof data["data"][tokenNo] === 'undefined') sentNo += 1
    data["config"]["CurSentance"] = sentNo
    data["config"]["CurToken"] = tokenNo
    firebase.database().ref().child("Config").update(data["config"])

    location.reload();
}