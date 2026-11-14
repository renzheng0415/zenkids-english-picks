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
function toast(text,art) {const notice=$('notice');($('playerDialog').open?$('playerDialog'):document.body).append(notice);notice.replaceChildren();if(art){const img=node('img');img.src='assets/yinyin/'+art+'.webp';img.alt='';notice.append(img);}notice.append(node('span',text));clearTimeout(toastTimer);toastTimer=setTimeout(()=>notice.replaceChildren(),2800);}
function allComplete() {return DATA.path.stages.every((_,i)=>complete(i));}
function celebrate() {if(!allComplete()||$('celebration').open)return;$('celebration').showModal();}
function showTab(id) {document.querySelectorAll('[data-tab]').forEach(b=>{if(b.dataset.tab===id)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});['adventure','badges','gallery','about'].forEach(tab=>$(tab).hidden=tab!==id);window.scrollTo(0,0);}

function node(tag,text,cls) {const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;}
function progress(value,max,label) {const p=node('progress');p.max=max;p.value=value;p.setAttribute('aria-label',label);return p;}
function render() {
 $('intro').textContent=DATA.path.intro;$('adventureTips').replaceChildren(...DATA.path.tips.map(t=>node('li',t)));
 $('totalText').textContent=`${done.size} / ${DATA.videos.length} 条 · ${DATA.path.stages.filter((_,i)=>complete(i)).length} 枚徽章`;
 $('totalProgress').max=DATA.videos.length;$('totalProgress').value=done.size;
 $('stages').replaceChildren();$('badgeList').replaceChildren();
 DATA.path.stages.forEach((s,i)=>{
  const open=unlocked(i), earned=complete(i);
  const card=node('button',undefined,'stage'+(!open?' locked':'')+(selected===i?' selected':''));
  const stageArt=earned?node('img',undefined,'stage-icon stage-badge'):node('span',open?s.icon:'🔒','stage-icon');if(earned){stageArt.src='assets/yinyin/badge-'+s.id+'.webp';stageArt.alt=s.name+'徽章';}card.append(stageArt,node('small',`第 ${i+1} 关`),node('h3',s.name),node('small',`${count(s)} / ${s.items.length} 条已打卡`),progress(count(s),s.items.length,s.name+'观看进度'),node('span',earned?'获得徽章！再看一遍 →':open?'出发吧 →':'🔒 先完成上一关','status'));
  card.setAttribute('aria-expanded',String(selected===i&&!$('lesson').hidden));
  if(!open)card.setAttribute('aria-disabled','true');
  card.onclick=()=>{if(!unlocked(i))return toast('先完成上一关，再来找我吧！');selectStage(i,true);};$('stages').append(card);
  const badge=node('div',undefined,'stage');if(earned){const art=node('img',undefined,'badge-art');art.src='assets/yinyin/badge-'+s.id+'.webp';art.alt=s.name+'徽章';art.loading='lazy';badge.append(art);}badge.append(node('span',earned?'🏅':'☆','stage-icon'),node('h3',s.name),node('small',earned?'你做到了！':`${count(s)} / ${s.items.length} 条 · ${missions.has(s.id)?'小任务完成':'等你来点亮'}`));$('badgeList').append(badge);
 });
 const finalBadge=$('rainbowBadge');finalBadge.replaceChildren();const finalArt=node('img');finalArt.src='assets/yinyin/'+(allComplete()?'yinyin-celebrate':'bunny-sidekick')+'.webp';finalArt.alt=allComplete()?'银银庆祝彩虹公主通关':'小兔子等你一起完成冒险';finalArt.loading='lazy';finalBadge.append(finalArt,node('p','Rainbow Princess','eyebrow'),node('h2','彩虹公主'),node('p',allComplete()?'最终徽章已点亮！银银，你做到了！':'完成八关的全部视频和小任务，就能点亮最终徽章。'));if(allComplete()){const replay=node('button','再庆祝一次 🌈','primary');replay.onclick=celebrate;finalBadge.append(replay);}
 const resume=videoMap.has(last)&&unlocked(stageOf(last));
 $('continue').textContent=resume?'▶ 继续观看':'▶ 开始闯关';
 $('resumeHint').textContent=resume?videoMap.get(last).title:'从第一关开始，一起唱起来';
 if(!$('lesson').hidden)renderLesson();
}
function stageOf(id) {return DATA.path.stages.findIndex(s=>s.items.some(item=>item.id===id));}
function selectStage(index,scroll) {if(!unlocked(index))return;selected=index;$('lesson').hidden=false;render();if(scroll){$('lesson').scrollIntoView({block:'start',behavior:'auto'});$('stageTitle').focus({preventScroll:true});}}
function renderLesson() {
 const s=DATA.path.stages[selected];$('stageGuide').src='assets/yinyin/'+('badge-'+s.id)+'.webp';$('stageTitle').textContent=`${s.icon} 第 ${selected+1} 关 · ${s.name}`;$('stageGoal').textContent=s.goal;$('videoList').replaceChildren();
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
$('doneButton').onclick=()=>{if(!current)return;done.add(current);write(KEYS.done,[...done]);updatePlayer();render();if(!storageFailed)toast('银银，打卡成功！小兔子也为你加油！','yinyin-cheer');if(allComplete())celebrate();};
$('nextButton').onclick=()=>{const s=DATA.path.stages[stageOf(current)],i=s.items.findIndex(v=>v.id===current);if(i<s.items.length-1)openVideo(s.items[i+1].id);};
$('closePlayer').onclick=()=>$('playerDialog').close();
$('playerDialog').addEventListener('close',()=>{$('playerMount').replaceChildren();document.body.append($('notice'));document.body.style.overflow='';current=null;});
$('missionButton').onclick=()=>{const s=DATA.path.stages[selected];if(!unlocked(selected)||count(s)!==s.items.length)return;missions.add(s.id);write(KEYS.missions,[...missions]);render();if(!storageFailed)toast('银银，星星徽章是你的啦！','yinyin-badge');if(allComplete())celebrate();};
$('continue').onclick=()=>{if(videoMap.has(last)&&unlocked(stageOf(last))){selectStage(stageOf(last),false);openVideo(last);return;}const i=DATA.path.stages.findIndex((s,i)=>unlocked(i)&&!complete(i));selectStage(i<0?0:i,true);};
document.querySelectorAll('[data-tab]').forEach(button=>button.onclick=()=>showTab(button.dataset.tab));
$('playPrincess').onclick=()=>{const playing=$('playPrincess').getAttribute('aria-pressed')==='true';$('princessAnimation').src='assets/yinyin/'+(playing?'rainbow-princess-poster.jpg':'rainbow-princess-web.gif');$('princessAnimation').alt=playing?'彩虹公主动画的静态预览':'银银的彩虹公主动起来了';$('playPrincess').setAttribute('aria-pressed',String(!playing));$('playPrincess').textContent=playing?'▶ 让彩虹公主动起来':'暂停动画，看看原画';};
$('closeCelebration').onclick=()=>$('celebration').close();
$('celebrationGallery').onclick=()=>{$('celebration').close();showTab('gallery');};
render();
// Existing completed progress unlocks the same reward without adding storage keys.
if(allComplete())celebrate();
