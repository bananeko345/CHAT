import {
getDatabase,
ref,
set,
remove,
onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const db=getDatabase();

/* =========================
管理者設定
========================= */

const ADMIN="Bananeko345";

const username=localStorage.getItem("chatName");

/* =========================
管理者パネル
========================= */

if(username===ADMIN){

createAdminPanel();

}

/* =========================
パネル作成
========================= */

function createAdminPanel(){

const panel=document.createElement("div");

panel.style.position="fixed";
panel.style.bottom="10px";
panel.style.left="10px";
panel.style.background="#2f3136";
panel.style.padding="10px";
panel.style.borderRadius="10px";
panel.style.width="220px";
panel.style.zIndex="999";

panel.innerHTML=`

<div style="font-weight:bold;margin-bottom:6px">
🛠 ADMIN PANEL
</div>

<div id="ban-list"></div>

`;

document.body.appendChild(panel);

loadBans();

}

/* =========================
BAN一覧
========================= */

function loadBans(){

const box=document.getElementById("ban-list");

onValue(ref(db,"bans"),(snap)=>{

box.innerHTML="<b>BANユーザー</b><br>";

if(!snap.exists()){

box.innerHTML+="なし";

return;

}

const data=snap.val();

for(let user in data){

const div=document.createElement("div");

div.style.marginTop="4px";

div.innerHTML=`
🚫 ${user}
<button onclick="unbanUser('${user}')">解除</button>
`;

box.appendChild(div);

}

});

}

/* =========================
BAN
========================= */

window.banUser=(user)=>{

if(username!==ADMIN)return;

if(!confirm(user+" をBANする？"))return;

set(ref(db,"bans/"+user),true);

alert("BANしました");

};

/* =========================
BAN解除
========================= */

window.unbanUser=(user)=>{

if(username!==ADMIN)return;

remove(ref(db,"bans/"+user));

alert("BAN解除しました");

};

/* =========================
KICK
========================= */

window.kickUser=(user)=>{

if(username!==ADMIN)return;

remove(ref(db,"onlineUsers/"+user));

alert("KICKしました");

};

/* =========================
メッセージ削除
========================= */

window.deleteMessage=(msgKey)=>{

if(username!==ADMIN)return;

if(!confirm("メッセージ削除する？"))return;

remove(ref(db,"messages/"+msgKey));

};
