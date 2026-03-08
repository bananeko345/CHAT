import {
getDatabase,
ref,
push,
onChildAdded,
onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const db=getDatabase();

/* =========================
現在のユーザー
========================= */

const username=localStorage.getItem("chatName");

/* =========================
DMパネル
========================= */

const dmPanel=document.getElementById("dm-panel");
const dmList=document.getElementById("dm-list");

let currentDM=null;

/* =========================
DM開始
========================= */

window.startDM=(target)=>{

const room=getRoomId(username,target);

currentDM=room;

openDMWindow(target,room);

addFriend(target);

};

/* =========================
ルームID作成
========================= */

function getRoomId(a,b){

return [a,b].sort().join("_");

}

/* =========================
フレンド保存
========================= */

function addFriend(user){

const refFriends=ref(db,"friends/"+username+"/"+user);

push(refFriends,{
name:user
});

}

/* =========================
DM一覧表示
========================= */

onValue(ref(db,"friends/"+username),(snap)=>{

if(!snap.exists())return;

dmList.innerHTML="";

const data=snap.val();

for(let key in data){

const user=data[key].name;

const div=document.createElement("div");

div.textContent="💬 "+user;

div.style.cursor="pointer";

div.onclick=()=>{

const room=getRoomId(username,user);

openDMWindow(user,room);

};

dmList.appendChild(div);

}

});

/* =========================
DMウィンドウ
========================= */

function openDMWindow(user,room){

let win=document.getElementById("dm-chat");

if(win)win.remove();

win=document.createElement("div");

win.id="dm-chat";

win.style.position="fixed";
win.style.bottom="0";
win.style.right="10px";
win.style.width="300px";
win.style.height="400px";
win.style.background="#2f3136";
win.style.borderRadius="10px";
win.style.display="flex";
win.style.flexDirection="column";

win.innerHTML=`

<div style="padding:8px;background:#111214">
DM : ${user}
<button onclick="closeDM()" style="float:right">×</button>
</div>

<div id="dm-messages" style="flex:1;overflow:auto;padding:10px"></div>

<div style="display:flex">
<input id="dm-input" style="flex:1;padding:6px">
<button onclick="sendDM()">送信</button>
</div>

`;

document.body.appendChild(win);

/* メッセージ読み込み */

const msgRef=ref(db,"dmChats/"+room);

onChildAdded(msgRef,(snap)=>{

const data=snap.val();

const box=document.getElementById("dm-messages");

const div=document.createElement("div");

div.style.marginBottom="6px";

div.textContent=data.name+" : "+data.text;

box.appendChild(div);

box.scrollTop=box.scrollHeight;

});

}

/* =========================
DM送信
========================= */

window.sendDM=()=>{

const input=document.getElementById("dm-input");

const text=input.value.trim();

if(text==="")return;

push(ref(db,"dmChats/"+currentDM),{

name:username,
text:text,
time:Date.now()

});

input.value="";

};

/* =========================
DM閉じる
========================= */

window.closeDM=()=>{

const win=document.getElementById("dm-chat");

if(win)win.remove();

};
