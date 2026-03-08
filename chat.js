import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
getDatabase,
ref,
push,
onChildAdded,
set,
remove,
onValue,
get,
query,
limitToLast
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* =======================
Firebase設定
======================= */

const firebaseConfig={
apiKey:"AIzaSyBRE5BJBF-fOMJKq3yIq9IQkCFcQUYL900",
authDomain:"my-safe-chat-c814f.firebaseapp.com",
databaseURL:"https://my-safe-chat-c814f-default-rtdb.firebaseio.com",
projectId:"my-safe-chat-c814f",
storageBucket:"my-safe-chat-c814f.appspot.com",
messagingSenderId:"126454688177",
appId:"1:126454688177:web:24b9bba7d71b759f38819"
};

const app=initializeApp(firebaseConfig);
const db=getDatabase(app);

const ADMIN="Bananeko345";

/* =======================
ユーザー情報
======================= */

let username=localStorage.getItem("chatName");

if(!username){
username=prompt("名前を決めてください");
localStorage.setItem("chatName",username);
}

let icon=localStorage.getItem("chatIcon");

if(!icon){
icon="https://cdn-icons-png.flaticon.com/512/149/149071.png";
localStorage.setItem("chatIcon",icon);
}

/* =======================
BANチェック
======================= */

const banCheck=await get(ref(db,"bans/"+username));

if(banCheck.exists()){
alert("あなたはBANされています");
document.body.innerHTML="<h1 style='color:white;text-align:center;margin-top:40vh;'>BANされています</h1>";
throw new Error("banned");
}

/* =======================
データ参照
======================= */

const chatRef=query(ref(db,"messages"),limitToLast(50));
const usersRef=ref(db,"onlineUsers");

const userRef=ref(db,"onlineUsers/"+username);

set(userRef,true);

/* =======================
入室メッセージ
======================= */

push(ref(db,"messages"),{
system:true,
text:username+" さんいらっしゃい！"
});

/* =======================
退出処理
======================= */

window.addEventListener("beforeunload",()=>{

remove(userRef);

push(ref(db,"messages"),{
system:true,
text:username+" さんが退出しました"
});

});

/* =======================
通知許可
======================= */

if(Notification.permission!=="granted"){
Notification.requestPermission();
}

const notifySound=new Audio(
"https://cdn.pixabay.com/download/audio/2022/03/15/audio_4f6f7a1a9b.mp3"
);

/* =======================
ユーザー一覧
======================= */

onValue(usersRef,(snap)=>{

const users=snap.val();
const box=document.getElementById("users");

if(!box)return;

box.innerHTML="";

for(let u in users){

const div=document.createElement("div");

div.textContent="🟢 "+u;

div.onclick=()=>openUserMenu(u);

box.appendChild(div);

}

});

/* =======================
ユーザーメニュー
======================= */

function openUserMenu(user){

if(user===username)return;

let menu="DMする\n";

if(username===ADMIN){
menu+="KICK\nBAN\n";
}

const act=prompt(user+"\n"+menu);

if(act==="DMする"){

if(window.startDM){
window.startDM(user);
}

}

if(act==="BAN" && username===ADMIN){

set(ref(db,"bans/"+user),true);

alert("BANしました");

}

if(act==="KICK" && username===ADMIN){

remove(ref(db,"onlineUsers/"+user));

alert("KICKしました");

}

}

/* =======================
画像読み込み
======================= */

function readImage(file){

return new Promise(resolve=>{

const reader=new FileReader();

reader.onload=e=>resolve(e.target.result);

reader.readAsDataURL(file);

});

}

/* =======================
メッセージ送信
======================= */

window.sendMessage=async()=>{

const text=document.getElementById("msg-input").value.trim();
const imgFile=document.getElementById("img").files[0];

if(text==="" && !imgFile)return;

let image=null;

if(imgFile){
image=await readImage(imgFile);
}

push(ref(db,"messages"),{

name:username,
icon:icon,
text:text,
image:image,
time:Date.now()

});

document.getElementById("msg-input").value="";
document.getElementById("img").value="";

};

/* =======================
Enter送信
======================= */

document
.getElementById("msg-input")
.addEventListener("keydown",e=>{

if(e.key==="Enter"){

sendMessage();

}

});

/* =======================
メッセージ受信
======================= */

onChildAdded(chatRef,(snapshot)=>{

const data=snapshot.val();

const chatBox=document.getElementById("chat-box");

if(!chatBox)return;

/* --- システム --- */

if(data.system){

const div=document.createElement("div");

div.className="system";

div.textContent=data.text;

chatBox.appendChild(div);

chatBox.scrollTop=chatBox.scrollHeight;

return;

}

/* --- 通知 --- */

if(data.name!==username){

notifySound.play();

if(Notification.permission==="granted"){

new Notification(data.name,{
body:data.text || "画像を送信しました"
});

}

}

/* --- メッセージUI --- */

const msg=document.createElement("div");

msg.className="msg";

const avatar=document.createElement("img");

avatar.className="avatar";

avatar.src=data.icon;

avatar.onclick=()=>openUserMenu(data.name);

const bubble=document.createElement("div");

bubble.className="bubble";

const name=document.createElement("div");

name.className="name";

name.textContent=data.name;

bubble.appendChild(name);

/* テキスト */

if(data.text){

const text=document.createElement("div");

text.textContent=data.text;

bubble.appendChild(text);

}

/* 画像 */

if(data.image){

const img=document.createElement("img");

img.src=data.image;

img.className="chat-img";

bubble.appendChild(img);

}

msg.appendChild(avatar);

msg.appendChild(bubble);

chatBox.appendChild(msg);

chatBox.scrollTop=chatBox.scrollHeight;

});

/* =======================
DMボタン
======================= */

window.toggleDM=()=>{

const panel=document.getElementById("dm-panel");

if(!panel)return;

panel.style.display=

panel.style.display==="block"

? "none"

: "block";

};

/* =======================
ユーザー表示
======================= */

window.showUsers=()=>{

const list=document.getElementById("user-list");

if(!list)return;

list.style.display=

list.style.display==="block"

? "none"

: "block";

};
