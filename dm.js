import {
getDatabase,
ref,
push,
onChildAdded,
onValue,
set
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const db=getDatabase();

const username=localStorage.getItem("chatName");

let currentDM=null;
let currentUser=null;

/* ======================
ルームID
====================== */

function roomId(a,b){

return [a,b].sort().join("_");

}

/* ======================
DM開始
====================== */

window.startDM=(target)=>{

currentUser=target;

const room=roomId(username,target);

currentDM=room;

saveFriend(target);

openDM(target,room);

};

/* ======================
フレンド保存
====================== */

function saveFriend(user){

set(ref(db,"friends/"+username+"/"+user),true);
set(ref(db,"friends/"+user+"/"+username),true);

}

/* ======================
DM一覧
====================== */

const dmList=document.getElementById("dm-list");

onValue(ref(db,"friends/"+username),(snap)=>{

if(!snap.exists())return;

dmList.innerHTML="";

const data=snap.val();

for(let user in data){

const div=document.createElement("div");

div.textContent="💬 "+user;

div.style.cursor="pointer";

div.onclick=()=>{

currentUser=user;

const room=roomId(username,user);

currentDM=room;

openDM(user,room);

};

dmList.appendChild(div);

}

});

/* ======================
DMウィンドウ
====================== */

function openDM(user,room){

let win=document.getElementById("dm-chat");

if(win)win.remove();

win=document.createElement("div");

win.id="dm-chat";

win.innerHTML=`

<div style="padding:8px;background:#111214">
DM : ${user}
<button onclick="closeDM()" style="float:right">×</button>
</div>

<div id="dm-messages" style="flex:1;overflow:auto;padding:10px"></div>

<div style="display:flex">

<input id="dm-input" placeholder="メッセージ" style="flex:1;padding:6px">

<button onclick="sendDM()">送信</button>

</div>

`;

document.body.appendChild(win);

/* Enter送信 */

setTimeout(()=>{

const input=document.getElementById("dm-input");

input.addEventListener("keydown",(e)=>{

if(e.key==="Enter"){

sendDM();

}

});

},100);

/* メッセージ履歴 */

const msgRef=ref(db,"dmChats/"+room);

onChildAdded(msgRef,(snap)=>{

const data=snap.val();

const box=document.getElementById("dm-messages");

if(!box)return;

const div=document.createElement("div");

div.style.marginBottom="6px";

if(data.name===username){

div.style.textAlign="right";

}

div.textContent=data.name+" : "+data.text;

box.appendChild(div);

box.scrollTop=box.scrollHeight;

});

}

/* ======================
DM送信
====================== */

window.sendDM=()=>{

const input=document.getElementById("dm-input");

if(!input)return;

const text=input.value.trim();

if(text==="")return;

push(ref(db,"dmChats/"+currentDM),{

name:username,
text:text,
time:Date.now()

});

input.value="";

};

/* ======================
DM閉じる
====================== */

window.closeDM=()=>{

const win=document.getElementById("dm-chat");

if(win)win.remove();

};
