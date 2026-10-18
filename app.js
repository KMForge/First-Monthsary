"use strict";
(() => {
const content = window.BLOOM_CONTENT;
const $ = (selector) => document.querySelector(selector);
const memories = content.memories;
let currentMemory = 0;
let opener = null;
let burst = 0;
const systemMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let userReduced = false;
try { userReduced = localStorage.getItem("bloom-reduced") === "true"; } catch {}
let reduced = systemMotion.matches || userReduced;
function flower(id) {
 return '<svg class="flower-svg" viewBox="0 0 360 480" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="petal-'+id+'" x1="0" y1="0" x2=".65" y2="1"><stop stop-color="#fff6ee"/><stop offset=".35" stop-color="#f3d2d0"/><stop offset=".72" stop-color="#d690a4"/><stop offset="1" stop-color="#a25177"/></linearGradient><linearGradient id="leaf-'+id+'"><stop stop-color="#7c8d6d"/><stop offset="1" stop-color="#465e50"/></linearGradient><radialGradient id="heart-'+id+'"><stop stop-color="#fff7d3"/><stop offset=".5" stop-color="#efd09e"/><stop offset="1" stop-color="#cb8c98" stop-opacity="0"/></radialGradient></defs><path d="M181 195C168 270 196 364 159 475" stroke="#60785f" stroke-width="5" fill="none"/><path d="M181 338C152 285 102 289 77 259C87 316 133 342 181 350Z" fill="url(#leaf-'+id+')"/><path d="M181 388C213 337 256 350 286 310C274 368 233 391 178 399Z" fill="url(#leaf-'+id+')"/><path d="M180 342L94 280M181 393L270 329" stroke="#c3c5a0" stroke-width="1" opacity=".45"/><g class="flower-petals" fill="url(#petal-'+id+')" stroke="#f4d5d2" stroke-width=".7"><path d="M180 201C138 159 131 77 170 16C176 67 222 112 180 201Z"/><path d="M181 202C186 128 258 70 318 82C276 103 272 183 181 202Z"/><path d="M180 201C221 155 308 177 340 225C295 209 243 262 180 201Z"/><path d="M180 199C243 222 263 286 241 332C226 280 171 267 180 199Z"/><path d="M180 201C166 263 111 295 56 274C104 258 111 188 180 201Z"/><path d="M180 201C111 216 54 165 25 105C78 126 144 118 180 201Z"/><g fill="none" stroke="#a8577a" stroke-width="1" opacity=".35"><path d="M180 201Q164 114 171 49M180 201Q246 114 294 92M180 201Q272 210 321 222M180 201Q216 252 237 307M180 201Q128 251 78 270M180 201Q93 150 46 122"/></g><g fill="#ad5979" opacity=".45"><ellipse cx="161" cy="171" rx="1.7" ry="3" transform="rotate(-25 161 171)"/><ellipse cx="151" cy="161" rx="1.4" ry="2.8"/><ellipse cx="174" cy="153" rx="1.5" ry="2.6"/><ellipse cx="207" cy="173" rx="2.7" ry="1.5" transform="rotate(-25 207 173)"/><ellipse cx="220" cy="165" rx="2" ry="1.3"/><ellipse cx="213" cy="208" rx="2.4" ry="1.4"/><ellipse cx="226" cy="215" rx="2.4" ry="1.4"/><ellipse cx="162" cy="223" rx="1.3" ry="2.5"/></g><ellipse cx="181" cy="199" rx="24" ry="22" fill="url(#heart-'+id+')" stroke="none"/><g fill="none" stroke="#ded4a0" stroke-width="2"><path d="M181 202Q163 168 137 157M181 202Q184 154 196 132M181 202Q206 168 227 158M181 202Q153 186 132 184M181 202Q195 176 209 145"/></g><g fill="#9d6a45" stroke="#d8b875" stroke-width="1"><ellipse cx="137" cy="157" rx="8" ry="3.5" transform="rotate(30 137 157)"/><ellipse cx="196" cy="132" rx="8" ry="3.5" transform="rotate(-55 196 132)"/><ellipse cx="227" cy="158" rx="8" ry="3.5" transform="rotate(-30 227 158)"/><ellipse cx="132" cy="184" rx="8" ry="3.5" transform="rotate(10 132 184)"/><ellipse cx="209" cy="145" rx="7" ry="3.5" transform="rotate(-45 209 145)"/></g></g></svg>';
}
$("[data-flower=hero]").innerHTML = flower("hero");
$("#couple-names").textContent = content.names;
$("#story-message").textContent = content.story;
function setImage(image, memory) {
 image.classList.remove("image-unavailable");
 image.alt = memory.alt; image.style.objectPosition = memory.position || "50% 50%";
 image.onerror = () => { image.onerror = null; image.removeAttribute("src"); image.classList.add("image-unavailable"); image.alt = "Photo placeholder — " + memory.alt; };
 image.src = memory.image;
}
setImage($("#hero-image"), memories[0]);
setImage($("#story-image"), memories[1] || memories[0]);
$("#sample-note").hidden = !content.sampleMode;
function element(tag, className, text) { const node = document.createElement(tag); if(className) node.className = className; if(text) node.textContent = text; return node; }
memories.forEach((memory, i) => {
 const card = element("button", "memory-card reveal"); card.dataset.memory = i; card.setAttribute("aria-label", "Open memory: " + memory.title);
 const wrap = element("div", "memory-image");
 const img = element("img"); img.loading = "lazy"; img.width = 600; img.height = 760; setImage(img, memory);
 const arrow = element("span", "image-arrow", "↗"); arrow.setAttribute("aria-hidden","true"); wrap.append(img, arrow);
 card.append(wrap, element("span","memory-chapter",memory.chapter), element("h3","",memory.title),element("span","handwritten",memory.label));
 $("#memory-grid").append(card);
});
content.reasons.forEach((reason, i) => {
 const note = element("button","note reveal"); note.setAttribute("aria-expanded","false");
 const answerId = "reason-" + i; note.setAttribute("aria-controls",answerId);
 const answer = element("p","note-text",reason.text); answer.id = answerId; answer.hidden = true;
 note.append(element("span","note-number","0"+(i+1)),element("h3","",reason.title),element("span","note-hint","a little reminder ↗"),answer);
 note.addEventListener("click",()=>{ const open=note.getAttribute("aria-expanded")==="true"; note.setAttribute("aria-expanded",String(!open)); answer.hidden=open; });
 $("#notes-grid").append(note);
});
for(let i=0;i<5;i++){
 const button=element("button","garden-flower"); button.dataset.memory=i%memories.length;
 button.setAttribute("aria-label","Open flower memory: "+memories[i%memories.length].title);
 button.innerHTML=flower("garden-"+i); $("#garden-flowers").append(button);
}
function updateDate() {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(content.startDate)) return;
 const [y,m,d]=content.startDate.split("-").map(Number);
 const start=new Date(Date.UTC(y,m-1,d));
 if(start.getUTCFullYear()!==y||start.getUTCMonth()!==m-1||start.getUTCDate()!==d)return;
 const todayParts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Manila",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
 const val=type=>Number(todayParts.find(part=>part.type===type).value);
 const days=Math.floor((Date.UTC(val("year"),val("month")-1,val("day"))-start.getTime())/86400000);
 if(days<0)return;
 $("#day-count").textContent=String(days).padStart(2,"0");
 $("#day-unit").textContent=days===1?"beautiful day together":"beautiful days together";
 $("#date-caption").textContent="Growing together since "+new Intl.DateTimeFormat("en",{dateStyle:"long",timeZone:"UTC"}).format(start);
}
updateDate();
const dialog=$("#memory-dialog");
function renderDialog(index){
 currentMemory=(index+memories.length)%memories.length;
 const memory=memories[currentMemory]; setImage($("#dialog-image"),memory);
 $("#dialog-title").textContent=memory.title; $("#dialog-date").textContent=memory.date;
 $("#dialog-description").textContent=memory.text; $("#dialog-count").textContent=(currentMemory+1)+" / "+memories.length;
}
document.querySelectorAll("[data-memory]").forEach(button=>button.addEventListener("click",()=>{
 opener=button;renderDialog(Number(button.dataset.memory));dialog.showModal();document.body.classList.add("modal-open");
}));
$(".dialog-close").addEventListener("click",()=>dialog.close());
dialog.addEventListener("click",event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener("close",()=>{document.body.classList.remove("modal-open");opener?.focus({preventScroll:true});});
$("#previous-memory").addEventListener("click",()=>renderDialog(currentMemory-1));
$("#next-memory").addEventListener("click",()=>renderDialog(currentMemory+1));
dialog.addEventListener("keydown",event=>{if(event.key==="ArrowLeft"){event.preventDefault();renderDialog(currentMemory-1);}if(event.key==="ArrowRight"){event.preventDefault();renderDialog(currentMemory+1);}});
let touchX=0;
$("#dialog-image").addEventListener("touchstart",event=>{touchX=event.changedTouches[0].screenX;},{passive:true});
$("#dialog-image").addEventListener("touchend",event=>{const delta=event.changedTouches[0].screenX-touchX;if(Math.abs(delta)>60)renderDialog(currentMemory+(delta<0?1:-1));},{passive:true});
$("#letter-greeting").textContent=content.letter.greeting;
content.letter.paragraphs.forEach(text=>$("#letter-body").append(element("p","",text)));
$("#letter-signature").textContent=content.letter.signature;
$("#open-letter").addEventListener("click",()=>{
 $("#open-letter").setAttribute("aria-expanded","true");$("#open-letter").hidden=true;$("#letter-paper").hidden=false;
 $("#close-letter").focus({preventScroll:true});
});
$("#close-letter").addEventListener("click",()=>{
 $("#letter-paper").hidden=true;$("#open-letter").hidden=false;$("#open-letter").setAttribute("aria-expanded","false");$("#open-letter").focus({preventScroll:true});
});
$("#bloom-button").addEventListener("click",()=>{
 $("#garden").classList.remove("bloomed");void $("#garden").offsetWidth;$("#garden").classList.add("bloomed");
 burst=reduced?0:100;$("#garden-status").textContent="To all the beautiful things still growing between us. ♡";
 $("#bloom-button").firstChild.textContent="A little more magic ";
});
let observer;
if("IntersectionObserver" in window){
 document.documentElement.classList.add("js-motion");
 observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target);}}),{threshold:.08});
 document.querySelectorAll(".reveal").forEach(item=>observer.observe(item));
}
let animationFrame=0;
let particles=[];
const canvas=$("#pollen"), ctx=canvas.getContext("2d");
let width=0,height=0,lastFrame=0;
function resizeCanvas(){width=window.innerWidth;height=window.innerHeight;const ratio=Math.min(window.devicePixelRatio||1,2);canvas.width=width*ratio;canvas.height=height*ratio;ctx?.setTransform(ratio,0,0,ratio,0,0);}
function particle(celebration=false){return {x:Math.random()*width,y:celebration?height:Math.random()*height,r:Math.random()*1.8+.5,speed:Math.random()*.45+.15,phase:Math.random()*Math.PI*2,life:celebration?200:Infinity,celebration};}
function draw(time){
 if(reduced||document.hidden||!ctx){animationFrame=0;return;}
 const delta=Math.min((time-lastFrame)/16.67||1,3);lastFrame=time;ctx.clearRect(0,0,width,height);
 if(burst>0){for(let i=0;i<4;i++)particles.push(particle(true));burst-=4;}
 particles=particles.filter(p=>p.life>0);
 particles.forEach(p=>{p.y-=p.speed*delta*(p.celebration?5:1);p.x+=Math.sin(time/2200+p.phase)*.15*delta;p.life-=delta;if(p.y<-10){p.y=height+10;}ctx.beginPath();ctx.fillStyle=p.celebration?"rgba(244,202,149,.8)":"rgba(184,142,91,.3)";ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();});
 animationFrame=requestAnimationFrame(draw);
}
function startParticles(){if(!reduced&&!document.hidden&&!animationFrame&&ctx){lastFrame=performance.now();animationFrame=requestAnimationFrame(draw);}}
function syncMotion(){
 reduced=systemMotion.matches||userReduced;document.documentElement.classList.toggle("reduced-motion",reduced);
 $("#effects-toggle").setAttribute("aria-pressed",String(reduced));$("#effects-toggle").textContent=systemMotion.matches?"Device motion setting: reduced":reduced?"Enable effects":"Reduce effects";
 $("#effects-toggle").disabled=systemMotion.matches;
 if(reduced){cancelAnimationFrame(animationFrame);animationFrame=0;ctx?.clearRect(0,0,width,height);}else startParticles();
}
$("#effects-toggle").addEventListener("click",()=>{userReduced=!userReduced;try{localStorage.setItem("bloom-reduced",String(userReduced));}catch{}syncMotion();});
systemMotion.addEventListener("change",syncMotion);
window.addEventListener("resize",resizeCanvas,{passive:true});
resizeCanvas();particles=Array.from({length:window.innerWidth<760?18:35},()=>particle());syncMotion();
let audioContext=null,musicTimer=null,audio=null,soundOn=false,noteIndex=0;
const melody=[261.63,329.63,392,523.25,440,392,329.63,293.66,261.63,349.23,440,523.25,392,349.23,329.63,293.66];
function playNote(){
 if(!audioContext||audioContext.state!=="running")return;
 const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();
 const now=audioContext.currentTime;oscillator.type="sine";oscillator.frequency.value=melody[noteIndex++%melody.length];
 gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.035,now+.04);gain.gain.exponentialRampToValueAtTime(.001,now+2.2);
 oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(now);oscillator.stop(now+2.3);
 oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
}
function syncSound(){
 $("#sound-toggle").setAttribute("aria-pressed",String(soundOn));$(".sound-label").textContent=soundOn?"Sound on":"Sound off";
 $("#sound-toggle").setAttribute("aria-label",soundOn?"Pause background melody":"Play gentle background melody");
}
async function setSound(on){
 clearInterval(musicTimer);musicTimer=null;
 if(!on){audio?.pause();if(audioContext?.state==="running")await audioContext.suspend();soundOn=false;syncSound();return;}
 try{
 if(content.musicUrl){if(!audio){audio=new Audio(content.musicUrl);audio.loop=true;audio.volume=.3;}await audio.play();}
 else{const AudioAPI=window.AudioContext||window.webkitAudioContext;if(!AudioAPI)throw new Error("Audio unavailable");if(!audioContext)audioContext=new AudioAPI();await audioContext.resume();playNote();musicTimer=setInterval(playNote,850);}
 soundOn=true;
 }catch{soundOn=false;$(".sound-label").textContent="Sound unavailable";$("#sound-toggle").setAttribute("aria-label","Audio unavailable. Try again.");$("#sound-toggle").setAttribute("aria-pressed","false");return;}
 syncSound();
}
$("#sound-toggle").addEventListener("click",async()=>{const button=$("#sound-toggle");button.disabled=true;await setSound(!soundOn);button.disabled=false;});
document.addEventListener("visibilitychange",()=>{if(document.hidden){cancelAnimationFrame(animationFrame);animationFrame=0;if(soundOn)setSound(false);}else{updateDate();startParticles();}});
})();
