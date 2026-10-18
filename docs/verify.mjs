import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=process.cwd();
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+path.join(root,'.preview-profile'),'--allow-file-access-from-files','about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
let socket;
const checks=[],errors=[];
const pause=ms=>new Promise(r=>setTimeout(r,ms));
try{
 const endpoint=await new Promise((resolve,reject)=>{let output='';const timer=setTimeout(()=>reject(new Error('Browser startup timed out')),20000);chrome.stderr.on('data',chunk=>{output+=chunk.toString();const match=output.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match){clearTimeout(timer);resolve(match[1]);}});chrome.on('error',reject);});
 socket=new WebSocket(endpoint);
 await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
 let seq=0,session;
 const pending=new Map();
 socket.addEventListener('message',event=>{const msg=JSON.parse(event.data);if(msg.id&&pending.has(msg.id)){const p=pending.get(msg.id);pending.delete(msg.id);clearTimeout(p.timer);msg.error?p.reject(new Error(JSON.stringify(msg.error))):p.resolve(msg.result);}
 if(msg.method==='Runtime.exceptionThrown')errors.push(msg.params.exceptionDetails.text+': '+(msg.params.exceptionDetails.exception?.description||''));});
 function send(method,params={},useSession=true){return new Promise((resolve,reject)=>{const id=++seq;const timer=setTimeout(()=>{pending.delete(id);reject(new Error('Timeout: '+method));},20000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params,...(session&&useSession?{sessionId:session}:{})}));});}
 const target=await send('Target.createTarget',{url:'about:blank'},false);
 session=(await send('Target.attachToTarget',{targetId:target.targetId,flatten:true},false)).sessionId;
 await send('Runtime.enable');await send('Page.enable');
 async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.text+' '+r.exceptionDetails.exception?.description);return r.result.value;}
 function check(name,result){checks.push({name,passed:!!result});if(!result)console.log('FAIL: '+name);}
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:pathToFileURL(path.join(root,'dist','index.html')).href});
 await pause(3500);
 check('Page initializes',await evaluate('document.querySelectorAll(".memory-card").length===6 && document.querySelectorAll(".garden-flower").length===5'));
 check('No horizontal overflow at desktop',await evaluate('document.documentElement.scrollWidth<=innerWidth'));
 await evaluate('document.querySelector(".hero-photo").click()');
 check('Photo dialog opens',await evaluate('document.querySelector("#memory-dialog").open && document.querySelector("#dialog-count").textContent==="1 / 6"'));
 await evaluate('document.querySelector("#previous-memory").click()');
 check('Previous photo wraps',await evaluate('document.querySelector("#dialog-count").textContent==="6 / 6"'));
 await evaluate('document.querySelector("#next-memory").click()');
 check('Next photo wraps',await evaluate('document.querySelector("#dialog-count").textContent==="1 / 6"'));
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
 await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
 await pause(100);
 check('Escape closes dialog and restores focus',await evaluate('!document.querySelector("#memory-dialog").open && document.activeElement.classList.contains("hero-photo")'));
 await evaluate('document.querySelector(".note").click()');
 check('Personal note reveals',await evaluate('document.querySelector(".note").getAttribute("aria-expanded")==="true" && !document.querySelector(".note-text").hidden'));
 await evaluate('document.querySelector(".note").click()');
 check('Personal note closes',await evaluate('document.querySelector(".note-text").hidden'));
 await evaluate('document.querySelector("#open-letter").click()');
 check('Letter opens',await evaluate('!document.querySelector("#letter-paper").hidden && document.activeElement.id==="close-letter"'));
 await evaluate('document.querySelector("#close-letter").click()');
 check('Letter closes with focus return',await evaluate('document.querySelector("#letter-paper").hidden && document.activeElement.id==="open-letter"'));
 await evaluate('document.querySelector("#bloom-button").click()');
 check('Garden blooms',await evaluate('document.querySelector("#garden").classList.contains("bloomed")'));
 await evaluate('document.querySelector(".garden-flower").click()');
 check('Garden flower opens a memory',await evaluate('document.querySelector("#memory-dialog").open'));
 await evaluate('document.querySelector("#memory-dialog").close()');
 await evaluate('document.querySelector("#effects-toggle").click()');
 check('Reduced effects toggle',await evaluate('document.documentElement.classList.contains("reduced-motion")'));
 await evaluate('document.querySelector("#effects-toggle").click()');
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await pause(100);
 check('System reduced-motion preference respected',await evaluate('document.documentElement.classList.contains("reduced-motion") && document.querySelector("#effects-toggle").disabled'));
 await send('Emulation.setEmulatedMedia',{features:[]});
 await evaluate('document.querySelector("#sound-toggle").click()');
 await pause(500);
 check('Music starts after activation',await evaluate('document.querySelector("#sound-toggle").getAttribute("aria-pressed")==="true"'));
 await evaluate('document.querySelector("#sound-toggle").click()');await pause(100);
 check('Music stops',await evaluate('document.querySelector("#sound-toggle").getAttribute("aria-pressed")==="false"'));
 await evaluate("document.querySelectorAll('img').forEach(i=>i.loading='eager')"); await pause(500); const assets=await evaluate('Array.from(document.images).map(i=>({alt:i.alt,loaded:i.complete&&i.naturalWidth>0}))');
 await evaluate('document.querySelectorAll(".reveal").forEach(e=>e.classList.add("visible"));scrollTo(0,0)');
 await pause(400);
 await fs.mkdir(path.join(root,'docs'),{recursive:true});
 const desktop=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
 await fs.writeFile(path.join(root,'docs','preview-desktop.png'),Buffer.from(desktop.data,'base64'));
 for(const width of [390,360,768]){
 await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
 await pause(200);
 check('No horizontal overflow at '+width+'px',await evaluate('document.documentElement.scrollWidth<=innerWidth'));
 if(width===390){const mobile=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(path.join(root,'docs','preview-mobile.png'),Buffer.from(mobile.data,'base64'));}
 }
 check('No browser JavaScript exceptions',errors.length===0);
 const report={checks,errors,images:assets};
 await fs.writeFile(path.join(root,'docs','verification.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
 await send('Browser.close',{},false).catch(()=>{});
 if(checks.some(c=>!c.passed))process.exitCode=1;
}finally{socket?.close();chrome.kill();}
