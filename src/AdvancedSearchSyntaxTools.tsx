import { useEffect } from 'react'

type Kind='monster'|'item'
const MONSTER_KEY='fu-monster-profile-filters'

function kind(section:HTMLElement):Kind|null{if(section.querySelector('input[placeholder^="Search monsters"]'))return'monster';if(section.querySelector('input[placeholder^="Search items"]'))return'item';return null}
function setInput(input:HTMLInputElement,value:string){const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set;setter?.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}))}
function setSelect(section:HTMLElement,value:string){const selects=Array.from(section.querySelectorAll<HTMLSelectElement>('.toolbar select'));const match=selects.find(select=>Array.from(select.options).some(option=>option.value.toLowerCase()===value.toLowerCase()));const option=match&&Array.from(match.options).find(option=>option.value.toLowerCase()===value.toLowerCase());if(!match||!option)return false;const setter=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value')?.set;setter?.call(match,option.value);match.dispatchEvent(new Event('change',{bubbles:true}));return true}
function readMonster(){try{return JSON.parse(localStorage.getItem(MONSTER_KEY)||'{}')}catch{return{}}}
function writeMonster(value:any){localStorage.setItem(MONSTER_KEY,JSON.stringify(value))}
function range(value:string){const m=value.match(/^(\d+)(?:-(\d+))?$/);if(!m)return null;const a=Number(m[1]),b=m[2]?Number(m[2]):a;return{min:Math.min(a,b),max:Math.max(a,b)}}

export default function AdvancedSearchSyntaxTools(){useEffect(()=>{
 const onFocus=(event:FocusEvent)=>{const input=event.target instanceof HTMLInputElement?event.target:null;if(!input||!input.closest('section')?.querySelector('.databaseSummary'))return;input.title=input.placeholder.startsWith('Search monsters')?'Advanced: level:20-40 has:spell damage:fire affinity:ice=vulnerable source:natural rank:Champion species:Undead style:Controller':'Advanced: source:techno type:Weapon martial:true category:Sword. Combine with ordinary search words.'}
 const onKey=(event:KeyboardEvent)=>{if(event.key!=='Enter')return;const input=event.target instanceof HTMLInputElement?event.target:null;const section=input?.closest<HTMLElement>('main > section');if(!input||!section||!section.querySelector('.databaseSummary')||!input.value.includes(':'))return;const k=kind(section);if(!k)return;const parts=input.value.match(/"[^"]+"|\S+/g)||[];const plain:string[]=[];let changed=false;const monster=readMonster();
  for(const token of parts){const m=token.match(/^([a-z]+):(.*)$/i);if(!m){plain.push(token);continue}const key=m[1].toLowerCase(),raw=m[2].replace(/^"|"$/g,''),value=raw.toLowerCase();
   if(k==='monster'&&key==='level'){const r=range(value);if(r){monster.min=r.min;monster.max=r.max;changed=true;continue}}
   if(k==='monster'&&key==='has'&&value==='spell'){monster.role='Spellcaster';changed=true;continue}
   if(k==='monster'&&key==='has'&&value==='crisis'){monster.role='Has Crisis Rule';changed=true;continue}
   if(k==='monster'&&key==='damage'){monster.damage=value;changed=true;continue}
   if(k==='monster'&&key==='affinity'){const a=value.match(/^([a-z]+)[=/-](vulnerable|resistant|immune|absorb)$/);if(a){monster.affinityType=a[1];monster.affinityValue=a[2][0].toUpperCase()+a[2].slice(1);changed=true;continue}}
   if(key==='source'){const map:Record<string,string>={core:'Core Rulebook',high:'High Fantasy',natural:'Natural Fantasy',techno:'Techno Fantasy',custom:'Generated / Custom',generated:'Generated / Custom'};if(map[value]&&setSelect(section,map[value])){changed=true;continue}}
   if(k==='monster'&&['rank','species','style'].includes(key)&&setSelect(section,raw)){changed=true;continue}
   if(k==='item'&&key==='type'&&setSelect(section,raw)){changed=true;continue}
   if(k==='item'&&key==='category'&&setSelect(section,raw)){changed=true;continue}
   if(k==='item'&&key==='martial'&&setSelect(section,['true','yes','1'].includes(value)?'Martial':'Non-martial')){changed=true;continue}
   if(key==='official'&&setSelect(section,['true','yes','1'].includes(value)?(k==='monster'?'Core Rulebook':'Core Rulebook'):'Generated / Custom')){changed=true;continue}
   plain.push(token)
  }
  if(k==='monster')writeMonster(monster);if(changed){event.preventDefault();setInput(input,plain.join(' '))}
 }
 document.addEventListener('focusin',onFocus);document.addEventListener('keydown',onKey);return()=>{document.removeEventListener('focusin',onFocus);document.removeEventListener('keydown',onKey)}
 },[]);return null}
