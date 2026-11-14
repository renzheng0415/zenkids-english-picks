'use strict';
const $ = id => document.getElementById(id);
const KEYS = {done:'zenkids-en-done-v1',missions:'zenkids-en-missions-v1',last:'zenkids-en-last-v1'};
let storageFailed = false;
function read(key, fallback) {try {const value=JSON.parse(localStorage.getItem(key));return value===null?fallback:value;} catch {return fallback;}}
function write(key,value) {try {localStorage.setItem(key,JSON.stringify(value));} catch {storageFailed=true;toast('这次进度暂时存不住，请家长检查浏览器设置。');}}
const videoMap = new Map(DATA.videos.map(v=>[v.id,v]));
const doneValue=read(KEYS.done,[]), missionValue=read(KEYS.missions,[]);
const done=new Set(Array.isArray(doneValue)?doneValue.filter(id=>videoMap.has(id)):[]);
const missions=new Set(Array.isArray(missionValue)?missionValue.filter(id=>DATA.path.stages.some(s=>s.id===id)):[]);
let last=read(KEYS.last,null), selected=0, current=null, toastTimer;
function count(stage) {return stage.items.filter(item=>done.has(item.id)).length;}
function complete(index) {const s=DATA.path.stages[index];return count(s)===s.items.length&&missions.has(s.id);}
function unlocked(index) {return index===0||DATA.path.stages.slice(0,index).every((_,i)=>complete(i));}
function toast(text) {$('notice').textContent=text;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('notice').textContent='',4500);}
function node(tag,text,cls) {const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;}
function progress(value,max,label) {const p=node('progress');p.max=max;p.value=value;p.setAttribute('aria-label',label);return p;}
function render() {
 $('intro').textContent=DATA.path.intro;
 $('totalText').textContent=`${done.size} / ${DATA.videos.length} 条 · ${DATA.path.stages.filter((_,i)=>complete(i)).length} 枚徽章`;
 $('totalProgress').max=DATA.videos.length;$('totalProgress').value=done.size;
 $('stages').replaceChildren();$('badgeList').replaceChildren();
 DATA.path.stages.forEach((s,i)=>{
  const open=unlocked(i), earned=complete(i);
  const card=node('button',undefined,'stage'+(!open?' locked':'')+(selected===i?' selected':''));
  card.append(node('span',earned?'🏅':s.icon,'stage-icon'),node('small',`第 ${i+1} 关`),node('h3',s.name),node('small',`${count(s)} / ${s.items.length} 条已打卡`),progress(count(s),s.items.length,s.name+'观看进度'),node('span',earned?'获得徽章！再看一遍 →':open?'出发吧 →':'🔒 先完成上一关','status'));
  card.setAttribute('aria-expanded',String(selected===i&&!$('lesson').hidden));
  if(!open)card.setAttribute('aria-disabled','true');
  card.onclick=()=>{if(!unlocked(i))return toast('先完成上一关，再来找我吧！');selectStage(i,true);};$('stages').append(card);
  const badge=node('div',undefined,'stage');badge.append(node('span',earned?'🏅':'☆','stage-icon'),node('h3',s.name),node('small',earned?'你做到了！':`${count(s)} / ${s.items.length} 条 · ${missions.has(s.id)?'小任务完成':'等你来点亮'}`));$('badgeList').append(badge);
 });
 const resume=videoMap.has(last)&&unlocked(stageOf(last));
 $('continue').textContent=resume?'▶ 继续观看':'▶ 开始闯关';
 $('resumeHint').textContent=resume?videoMap.get(last).title:'从第一关开始，一起唱起来';
 if(!$('lesson').hidden)renderLesson();
}
function stageOf(id) {return DATA.path.stages.findIndex(s=>s.items.some(item=>item.id===id));}
function selectStage(index,scroll) {if(!unlocked(index))return;selected=index;$('lesson').hidden=false;render();if(scroll){$('lesson').scrollIntoView({block:'start',behavior:'auto'});$('stageTitle').focus({preventScroll:true});}}
function renderLesson() {
 const s=DATA.path.stages[selected];$('stageTitle').textContent=`${s.icon} 第 ${selected+1} 关 · ${s.name}`;$('stageGoal').textContent=s.goal;$('videoList').replaceChildren();
 s.items.forEach((item,i)=>{const v=videoMap.get(item.id);if(!v)return;const card=node('article',undefined,'video-card');
 if(v.cover){const img=node('img',undefined,'thumbnail');img.src=v.cover;img.alt='';img.loading='lazy';img.referrerPolicy='no-referrer';img.onerror=()=>{img.hidden=true;};card.append(img);}
 const copy=node('div',undefined,'video-copy');const sec=Number(v.duration)||0;copy.append(node('h3',`${i+1}. ${v.title}`),node('p',`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')} · ${item.note}`));const play=node('button',done.has(v.id)?'✓ 再看一遍':'▶ 播放');play.setAttribute('aria-label',`${done.has(v.id)?'再看':'播放'} ${v.title}`);play.onclick=()=>openVideo(v.id);card.append(copy,play);$('videoList').append(card);});
 $('missionText').textContent=s.mission.text;const watched=count(s)===s.items.length;
 $('missionButton').textContent=missions.has(s.id)?'✓ 小任务完成':s.mission.label+' ✓';$('missionButton').disabled=!watched||missions.has(s.id);
 $('missionHint').textContent=complete(selected)?'这枚徽章是你的啦！':watched?'和爸爸妈妈做完，就点一下！':'先看完这关，再一起做任务。';
}
function openVideo(id) {
 const v=videoMap.get(id);const stage=stageOf(id);if(!v||stage<0||!unlocked(stage))return toast('先完成上一关吧！');
 current=id;last=id;write(KEYS.last,id);$('playerTitle').textContent=v.title;$('playerNote').textContent=v.reason;$('parentNote').textContent=[v.caution,v.orig?'原作者：'+v.orig:'',`上传者：${v.channel}`].filter(Boolean).join(' ');$('sourceLink').href=v.url;
 const frame=node('iframe');frame.title=v.title;frame.src='https://player.bilibili.com/player.html?bvid='+encodeURIComponent(v.id)+'&page='+encodeURIComponent(v.page||1)+'&high_quality=1&danmaku=0&autoplay=0&as_wide=1';frame.allow='fullscreen; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';$('playerMount').replaceChildren(frame);updatePlayer();
 if(!$('playerDialog').open){$('playerDialog').showModal();document.body.style.overflow='hidden';}render();
}
function updatePlayer() {$('doneButton').textContent=done.has(current)?'✓ 已打卡':'✓ 看完打卡';$('doneButton').disabled=done.has(current);const s=DATA.path.stages[stageOf(current)];$('nextButton').disabled=s.items.at(-1).id===current;$('nextButton').textContent=$('nextButton').disabled?'本关最后一条':'下一条 →';}
$('doneButton').onclick=()=>{if(!current)return;done.add(current);write(KEYS.done,[...done]);updatePlayer();render();if(!storageFailed)toast('打卡成功！你又前进了一小步！');};
$('nextButton').onclick=()=>{const s=DATA.path.stages[stageOf(current)],i=s.items.findIndex(v=>v.id===current);if(i<s.items.length-1)openVideo(s.items[i+1].id);};
$('closePlayer').onclick=()=>$('playerDialog').close();
$('playerDialog').addEventListener('close',()=>{$('playerMount').replaceChildren();document.body.style.overflow='';current=null;});
$('missionButton').onclick=()=>{const s=DATA.path.stages[selected];if(!unlocked(selected)||count(s)!==s.items.length)return;missions.add(s.id);write(KEYS.missions,[...missions]);render();if(!storageFailed)toast(selected===2?'三枚徽章集齐啦！太棒了！':'徽章到手！下一关开门啦！');};
$('continue').onclick=()=>{if(videoMap.has(last)&&unlocked(stageOf(last))){selectStage(stageOf(last),false);openVideo(last);return;}const i=DATA.path.stages.findIndex((s,i)=>unlocked(i)&&!complete(i));selectStage(i<0?0:i,true);};
document.querySelectorAll('[data-tab]').forEach(button=>button.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(b=>b.removeAttribute('aria-current'));button.setAttribute('aria-current','page');['adventure','badges','about'].forEach(id=>$(id).hidden=id!==button.dataset.tab);window.scrollTo(0,0);});
render();
