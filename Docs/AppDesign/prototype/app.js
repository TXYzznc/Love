(function(){
"use strict";
var key="love-prototype-v1", page="today", modal=null, toastTimer=null, undo=null;
var $=function(s){return document.querySelector(s)};
var vibration=function(pattern){if(navigator.vibrate)navigator.vibrate(pattern)};
var esc=function(s){return String(s||"").replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]})};
var now=function(){return Date.now()}, fmt=function(v){return new Date(v).toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit"})};
var kinds={state:["TA 的状态","☁","coral"],tarot:["对方事件","✦","lilac"],topic:["每日主题","☼","mint"],ai:["小兔助手","◌","blue"]};
var gestures=[["🫂","拥抱"],["💋","亲亲"],["🤝","牵手"],["🫳","拍拍"],["💭","想你"],["🌙","晚安"]];
var seed=function(){return {actor:"a",interactions:2,draws:0,threads:[
{id:"state-1",kind:"state",owner:"b",title:"想被陪着 · 心里有点乱",note:"今天的事情有点多。先陪我待一会儿就好。",created:now()-600000,responses:[]},
{id:"tarot-1",kind:"tarot",owner:"b",title:"帮我摇一摇：今天中午吃什么",created:now()-900000,responses:[]},
{id:"topic-1",kind:"topic",owner:"a",title:"最近什么小事让你觉得被理解？",created:now()-86400000,messages:[{by:"b",text:"你记得我不喜欢香菜，还特意帮我备注了。"}]},
{id:"ai-1",kind:"ai",owner:"a",title:"今天最让你累的部分是什么？",created:now()-172800000}
],logs:[]}};
var data;try{data=JSON.parse(localStorage.getItem(key))||seed()}catch(e){data=seed()}
var save=function(){localStorage.setItem(key,JSON.stringify(data))}, thread=function(id){return data.threads.filter(function(t){return t.id===id})[0]}, other=function(){return data.actor==="a"?"b":"a"};
var toast=function(msg,canUndo){clearTimeout(toastTimer);$("#toast").innerHTML=esc(msg)+(canUndo?"<button class='undo-button' data-action='undo'>撤回</button>":"");$("#toast").classList.add("is-visible");toastTimer=setTimeout(function(){$("#toast").classList.remove("is-visible")},canUndo?3200:2400)};
var sec=function(title,screen,label){return "<div class='section-heading'><h2>"+title+"</h2>"+(screen?"<button class='text-button' data-screen='"+screen+"'>"+(label||"查看全部")+"</button>":"")+"</div>"};
var open=function(t,compact){var k=kinds[t.kind]||["互动记录","♡","coral"];return "<button class='"+(compact?"event-card":"session-item")+"' data-action='detail' data-id='"+t.id+"'><span class='session-icon session-icon--"+k[2]+"'>"+k[1]+"</span><span class='session-main'><span><b>"+k[0]+"</b><time>"+fmt(t.created)+"</time></span><small>"+esc(t.title)+"</small><label class='session-status "+(t.owner!==data.actor?"session-status--waiting":"")+"'>"+(t.owner!==data.actor?"等待你的参与":"进行中")+"</label></span><i>›</i></button>"};
function render(){
document.querySelectorAll(".screen").forEach(function(s){s.classList.toggle("is-active",s.id===page)});document.querySelectorAll(".nav-item").forEach(function(n){n.classList.toggle("is-active",n.dataset.screen===page)});
$("#pageTitle").textContent={today:"今天，也想靠近你",inbox:"每件心事，都有位置",timeline:"一起走过的日常",space:"属于你们的小小世界"}[page];
var pending=data.threads.filter(function(t){return t.owner!==data.actor&&!t.closed}),html="";
if(page==="today"){$("#today").innerHTML="<div class='pulse-card'><div class='pulse-orbit'><span>♡</span></div><div class='pulse-copy'><span class='section-label'>你们的关系天气</span><strong>有一点乱，但还在靠近</strong><p>今天已经有 <b>"+data.interactions+"</b> 次温柔互动</p></div><button class='icon-button' data-action='compose'>＋</button></div>"+sec("现在可以做什么")+"<div class='action-grid'><button class='action-card action-card--coral' data-action='compose'><span class='action-icon'>☁</span><span><b>告诉 TA 你的状态</b><small>不用组织好语言</small></span><i>›</i></button><button class='action-card action-card--lilac' data-action='new-tarot'><span class='action-icon'>✦</span><span><b>请 TA 帮你摇一摇</b><small>把一个小决定递给对方</small></span><i>›</i></button></div>"+sec("待回应","inbox")+"<div class='event-stack'>"+pending.slice(0,2).map(function(t){return open(t,true)}).join("")+"</div>"+sec("共同空间","space","回房间")+"<button class='room-card' data-screen='space'><div class='room-illustration'><span class='plant'>🌱</span><span class='pet'>🐰</span></div><div><span class='section-label'>小屋 · 第 12 天</span><b>完成一次主题，会有一点小变化</b><p>共同记忆由双方确认后保存</p></div><span class='room-arrow'>›</span></button>"}
if(page==="inbox"){$("#inbox").innerHTML="<div class='inbox-intro'><span class='section-label'>关系收件箱</span><p>普通聊天、事件和主题，各自在自己的上下文里。</p></div><div class='filter-row'><button class='filter is-selected'>全部 <em>"+data.threads.length+"</em></button><button class='filter'>待回应 <em>"+pending.length+"</em></button><button class='filter'>已归档</button></div><div class='session-list'>"+data.threads.map(function(t){return open(t)}).join("")+"</div><div class='archive-hint'>主题完成后独立归档，不会混进普通聊天。<br>从互动记录可以随时回到原窗口。</div>"}
if(page==="timeline"){$("#timeline").innerHTML="<div class='timeline-head'><div><span class='section-label'>关系轨迹</span><h2>把那些靠近，记下来</h2></div></div><div class='sub-tabs'><button class='sub-tab is-selected'>互动记录</button><button class='sub-tab' data-action='show-toast' data-message='共同记忆需要双方确认后出现'>共同记忆</button></div><div class='timeline-list'>"+data.logs.map(function(l){return "<button class='timeline-item' data-action='detail' data-id='"+l.ref+"'><span class='timeline-dot timeline-dot--"+(l.color||"coral")+"'>"+(l.icon||"♡")+"</span><span><small>"+fmt(l.at)+"</small><b>"+esc(l.label)+"</b><p>"+esc(l.sub||"回到原始窗口")+"</p></span><i>›</i></button>"}).join("")+"<p class='empty'>状态回应、塔罗事件和主题会话，都会在这里留下入口。</p></div>"}
if(page==="space"){$("#space").innerHTML="<div class='space-hero'><span class='section-label'>共同空间 · 第 12 天</span><h2>你们的小屋</h2><p>空间只展示一起完成的结果，不给关系打分。</p><div class='space-scene'><span class='window'>☼</span><span class='shelf'>▰ ▱</span><span class='sofa'>▰</span><span class='space-pet'>🐰</span><span class='plant-large'>🌿</span></div></div><div class='space-progress'><div><span><b>本周一起完成</b><small>"+data.logs.length+" 次互动</small></span><strong>"+Math.min(99,40+data.logs.length*10)+"%</strong></div><div class='progress-bar'><span style='width:"+Math.min(99,40+data.logs.length*10)+"%'></span></div><p>再完成一次主题，小屋会多一件小物。</p></div><div class='soft-card'><span>✨</span><span><b>下一件小变化</b><small>双方确认共同记忆后解锁</small></span><i>›</i></div>"}
}
var head=function(a,b,c){return "<div class='modal-header'><div><span class='section-label'>"+a+"</span><h2>"+b+"</h2><p class='modal-intro'>"+c+"</p></div><button class='close-modal' data-action='close'>×</button></div>"};
var btn=function(a,b,c,d){return "<button class='"+(d||"primary-button")+"' data-action='"+b+"' data-id='"+(c||"")+"'>"+a+"</button>"};
var ghtml=function(id){return "<div class='gesture-row'>"+gestures.map(function(g){return "<button class='gesture "+(g[1]==="拥抱"?"is-primary":"")+"' data-action='gesture' data-id='"+id+"' data-value='"+g[1]+"'><span>"+g[0]+"</span>"+g[1]+"</button>"}).join("")+"</div>"};
function detail(t){var k=kinds[t.kind]||["互动","♡","coral"],h=head(k[0],t.title,(t.owner===data.actor?"你":"TA")+"发起 · "+fmt(t.created));
if(t.kind==="state")h+="<div class='detail-hero detail-hero--coral'><span class='type-tag type-tag--coral'>想被陪着</span><h3>心里有点乱</h3><p>"+esc(t.note||"给一个拥抱，或者陪 TA 待一会儿。")+"</p></div>";
if(t.kind==="tarot")h+="<div class='tarot-stage'><div class='tarot-card "+(t.result?"is-flipped":"")+"' id='tarotCard'><span>"+(t.result?"🍜":"✦")+"</span></div><h3>"+(t.result?"今日签：热气腾腾":"等你来摇一摇")+"</h3><p>"+(t.result?"你们更想吃熟悉的，还是没试过的？":"结果不是命令，只是一个让你们开始讨论的借口。")+"</p></div>";
if(t.kind==="topic")h+="<div class='topic-box'><small>主题会话</small><b>"+esc(t.title)+"</b><p>内容只会保留在这个窗口，不混入普通聊天。</p></div><div class='messages'>"+(t.messages||[]).map(function(m){return "<div class='reply-bubble'><small>"+(m.by==="a"?"小满":"阿屿")+"</small><p>"+esc(m.text)+"</p></div>"}).join("")+"</div><textarea class='text-area' placeholder='写下你的回答'></textarea>";
if(t.kind==="ai")h+="<div class='ai-card'><div class='ai-mark'>◌</div><b>“"+esc(t.title)+"”</b><p>小兔只负责问一次，回答由真人完成。</p></div><textarea class='text-area' placeholder='用自己的话回答小兔'></textarea>"+btn("回答小兔","answer-ai",t.id)+btn("先跳过","close","","secondary-button");
if(t.owner!==data.actor&&t.kind==="state")h+="<div class='response-label'>快捷回应</div>"+ghtml(t.id)+"<textarea class='text-area' placeholder='想对 TA 说的话（可选）'></textarea>"+btn("发送真人回应","reply",t.id);
if(t.owner!==data.actor&&t.kind==="tarot"&&!t.result)h+=btn("帮 TA 摇一摇","draw",t.id,"shake-button");
if(t.result)h+=btn("继续聊 · 创建独立主题","upgrade",t.id);
if(t.kind==="topic")h+=btn("提交回答","topic-reply",t.id);
if(t.owner===data.actor&&t.kind==="state"&&!t.aiAnswer)h+=btn("让小兔问我一句","ask-ai",t.id);
if(t.kind==="state"&&t.aiAnswer)h+="<div class='success-note'>已回答小兔 · 对方可见</div>";
return h}
function modalHTML(){var v=modal,t=thread(v.id);if(v.type==="compose")return head("发布一个关系线索","让 TA 知道你现在怎样","选一个回应需求，再选一个当前状态。")+"<div class='choice-group'><span class='choice-label'>我希望 TA 怎么回应</span><div class='choice-grid'><button class='choice is-selected'>想被陪着</button><button class='choice'>想被听见</button><button class='choice'>想要抱抱</button><button class='choice'>想安静一下</button><button class='choice'>想一起庆祝</button></div></div><div class='choice-group'><span class='choice-label'>我现在的状态</span><div class='choice-grid choice-grid--state'><button class='choice is-selected'>心里有点乱</button><button class='choice'>今天能量低</button><button class='choice'>有点委屈</button><button class='choice'>很想你</button><button class='choice'>有件事想分享</button></div></div><textarea class='text-area' placeholder='还有一句想补充的话？（可选）'></textarea><div class='switch-row'><span>明确需求由真人回应</span><button class='switch is-on'></button></div>"+btn("发布给 TA","publish");
if(v.type==="tarot")return head("一次小邀请","请 TA 帮我抽一张","抽签只是打开话题的方式，决定仍然在你们手里。")+"<textarea class='text-area' placeholder='比如：今天中午吃什么？'></textarea>"+btn("发给 TA 来抽","create-tarot");
if(v.type==="ai")return head("小兔代为开口","今天最让你累的部分是什么？","这是小兔的一次询问，不是替伴侣回应。")+"<div class='ai-card'><div class='ai-mark'>◌</div><b>“我注意到你今天能量有点低，愿意告诉我最让你累的部分吗？”</b><p>只问一个具体问题 · 你可以跳过</p></div><textarea class='text-area' placeholder='用自己的话回答小兔'></textarea>"+btn("回答小兔","answer-ai",v.id)+btn("先跳过","close","",'secondary-button');
return t?detail(t):""}
function show(v){modal=v;$("#modalRoot").innerHTML="<div class='modal' role='dialog'>"+modalHTML()+"</div>";$("#modalRoot").classList.add("is-open")}
function close(){modal=null;$("#modalRoot").classList.remove("is-open");setTimeout(function(){if(!modal)$("#modalRoot").innerHTML=""},200)}
function log(t,label,color,icon){data.logs.unshift({ref:t.id,label:label,sub:t.title,at:now(),color:color||"coral",icon:icon||"♡"})}
function act(a,e){var t=thread(e.dataset.id),v=e.dataset.value;
if(a==="close"){close();return}if(a==="compose"){show({type:"compose"});return}if(a==="new-tarot"){show({type:"tarot"});return}if(a==="detail"){show({type:"detail",id:e.dataset.id});return}if(a==="show-toast"){toast(e.dataset.message);return}
if(a==="publish"){var n={id:"state-"+now(),kind:"state",owner:data.actor,title:"想被陪着 · 心里有点乱",need:"想被陪着",mood:"心里有点乱",note:"今天的事情有点多。先陪我待一会儿就好。",created:now(),responses:[]};data.threads.unshift(n);log(n,"分享了一个状态");save();close();render();show({type:"detail",id:n.id});toast("状态已发布，可以切换视角来回应。");return}
if(a==="create-tarot"){var q=$(".modal textarea").value.trim()||"今天中午吃什么？",n2={id:"tarot-"+now(),kind:"tarot",owner:data.actor,title:q,created:now(),responses:[]};data.threads.unshift(n2);log(n2,"发来一张抽签邀请","lilac","✦");save();close();render();show({type:"detail",id:n2.id});return}
if(a==="gesture"){t.responses=t.responses||[];t.responses.push({by:data.actor,gesture:v,at:now()});data.interactions++;log(t,"送来了一个"+v);save();vibration(40);close();render();toast("一个"+v+"，轻轻送到了。",v==="拥抱");return}
if(a==="undo"){if(undo){var tt=thread(undo.ref);if(tt&&tt.responses.length){tt.responses.pop();data.logs.shift();data.interactions--}}undo=null;save();render();toast("已撤回这次动作。");return}
if(a==="reply"){var text=$(".modal textarea").value.trim();if(!text){toast("写下一点内容，再发送吧。");return}t.responses.push({by:data.actor,text:text,at:now()});data.interactions++;log(t,"回应了这个状态");save();close();render();toast("你的话，已经送到了。");return}
if(a==="draw"){if(data.draws>=3){toast("今天的免费抽签已用完，明天再来。");return}e.disabled=true;$(".tarot-card").classList.add("is-shaking");vibration([80,80]);setTimeout(function(){t.result="热气腾腾";data.draws++;log(t,"帮对方抽到了「热气腾腾」","lilac","✦");save();close();render();show({type:"detail",id:t.id})},450);return}
if(a==="upgrade"){var topic={id:"topic-"+now(),kind:"topic",owner:data.actor,title:t.title,source:t.id,created:now(),messages:[]};data.threads.unshift(topic);t.topic=topic.id;log(topic,"从一次事件升级为主题会话","mint","☼");save();close();render();show({type:"detail",id:topic.id});return}
if(a==="ask-ai"){t.aiQuestion="今天最让你累的部分是什么？";save();show({type:"ai",id:t.id});return}
if(a==="answer-ai"){var ans=$(".modal textarea").value.trim();if(!ans){toast("用自己的话回答小兔吧。");return}t.aiAnswer=ans;log(t,"回答了小兔的问题","blue","◌");save();close();render();toast("已完成回答，TA 收到一条关系事件。");return}
if(a==="topic-reply"){var reply=$(".modal textarea").value.trim();if(!reply){toast("写下你的回答再提交。");return}t.messages=t.messages||[];t.messages.push({by:data.actor,text:reply,at:now()});log(t,"写下了主题回答","mint","☼");save();close();render();toast("已提交，等对方方便时继续。");return}
}
document.addEventListener("click",function(e){var el=e.target.closest("[data-screen],[data-action]");if(!el)return;if(el.dataset.screen){page=el.dataset.screen;render();return}act(el.dataset.action,el)});
$("#modalRoot").addEventListener("click",function(e){if(e.target===$("#modalRoot"))close()});
render();
})();
