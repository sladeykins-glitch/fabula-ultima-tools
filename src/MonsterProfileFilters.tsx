import { useEffect } from 'react'
import './monsterProfileFilters.css'

type State = {
  minLevel: number | null
  maxLevel: number | null
  role: 'All' | 'Spellcaster' | 'No Spells' | 'Has Crisis Rule'
  damage: string
  affinityType: string
  affinityValue: string
}

const KEY = 'fu-monster-profile-filters'
const types = ['','physical','air','bolt','dark','earth','fire','ice','light','poison']
const affinities = ['','Vulnerable','Resistant','Immune','Absorb']

function readState(): State {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}')
    return {
      minLevel: Number.isFinite(Number(saved.minLevel)) && saved.minLevel !== null ? Number(saved.minLevel) : null,
      maxLevel: Number.isFinite(Number(saved.maxLevel)) && saved.maxLevel !== null ? Number(saved.maxLevel) : null,
      role: ['All','Spellcaster','No Spells','Has Crisis Rule'].includes(saved.role) ? saved.role : 'All',
      damage: types.includes(saved.damage) ? saved.damage : '',
      affinityType: types.includes(saved.affinityType) ? saved.affinityType : '',
      affinityValue: affinities.includes(saved.affinityValue) ? saved.affinityValue : '',
    }
  } catch {
    return { minLevel:null, maxLevel:null, role:'All', damage:'', affinityType:'', affinityValue:'' }
  }
}

function writeState(state: State) { localStorage.setItem(KEY, JSON.stringify(state)) }
function records(): any[] { try { const v=JSON.parse(localStorage.getItem('fu-monsters')||'[]'); return Array.isArray(v)?v:[] } catch { return [] } }

function hasCrisisRule(record:any) {
  const text = [...(record?.skills || []).map((s:any)=>`${s.name} ${s.summary}`), ...(record?.notes || [])].join(' ').toLowerCase()
  return text.includes('crisis') || text.includes('first time') && text.includes('hp')
}

function matches(record:any,state:State) {
  const level=Number(record?.level)||0
  if(state.minLevel!==null && level<state.minLevel) return false
  if(state.maxLevel!==null && level>state.maxLevel) return false
  if(state.role==='Spellcaster' && !(record?.spells?.length>0)) return false
  if(state.role==='No Spells' && record?.spells?.length>0) return false
  if(state.role==='Has Crisis Rule' && !hasCrisisRule(record)) return false
  if(state.damage) {
    const attack=(record?.attacks||[]).some((a:any)=>String(a?.damageType||'').toLowerCase()===state.damage)
    const spell=(record?.spells||[]).some((s:any)=>String(s?.effect||'').toLowerCase().includes(`${state.damage} damage`))
    if(!attack&&!spell) return false
  }
  if(state.affinityType&&state.affinityValue&&String(record?.affinities?.[state.affinityType]||'Normal')!==state.affinityValue) return false
  return true
}

function option(value:string,label?:string){return `<option value="${value}">${label||value||'Any'}</option>`}

export default function MonsterProfileFilters(){
  useEffect(()=>{
    const apply=()=>{
      const section=Array.from(document.querySelectorAll<HTMLElement>('main > section')).find(s=>s.querySelector('input[placeholder^="Search monsters"]'))
      if(!section||!section.querySelector('.databaseSummary')) return
      const state=readState()
      const byId=new Map(records().map(r=>[r?.id,r]))
      section.querySelectorAll<HTMLElement>('.monsterCard').forEach(card=>{
        const record=byId.get(card.dataset.dbRecordId)
        card.classList.toggle('dbHiddenByMonsterInfo',!!record&&!matches(record,state))
      })
      let bar=section.querySelector<HTMLElement>('.dbMonsterProfileFilters')
      if(!bar){
        bar=document.createElement('div');bar.className='dbMonsterProfileFilters'
        const advanced=section.querySelector('.dbAdvancedSearchBar'); const toolbar=section.querySelector('.toolbar')
        ;(advanced||toolbar)?.insertAdjacentElement('afterend',bar)
      }
      if(!bar)return
      const signature=JSON.stringify(state)
      if(bar.dataset.signature===signature)return
      bar.dataset.signature=signature
      bar.innerHTML=`<span class="dbProfileFilterTitle">Profile filters</span>
        <label>Lv <input type="number" min="1" max="99" data-db-profile="minLevel" placeholder="min" value="${state.minLevel??''}"></label>
        <span>–</span><label><input type="number" min="1" max="99" data-db-profile="maxLevel" placeholder="max" value="${state.maxLevel??''}"></label>
        <label>Role <select data-db-profile="role">${['All','Spellcaster','No Spells','Has Crisis Rule'].map(v=>option(v)).join('')}</select></label>
        <label>Deals <select data-db-profile="damage">${types.map(v=>option(v,v||'Any type')).join('')}</select></label>
        <label>Affinity <select data-db-profile="affinityType">${types.map(v=>option(v,v||'Any type')).join('')}</select><select data-db-profile="affinityValue">${affinities.map(v=>option(v,v||'Any')).join('')}</select></label>
        <button type="button" data-db-profile-clear>Clear</button>`
      ;(bar.querySelector('[data-db-profile="role"]') as HTMLSelectElement).value=state.role
      ;(bar.querySelector('[data-db-profile="damage"]') as HTMLSelectElement).value=state.damage
      ;(bar.querySelector('[data-db-profile="affinityType"]') as HTMLSelectElement).value=state.affinityType
      ;(bar.querySelector('[data-db-profile="affinityValue"]') as HTMLSelectElement).value=state.affinityValue
    }
    const onInput=(event:Event)=>{
      const control=(event.target as HTMLElement).closest<HTMLInputElement|HTMLSelectElement>('[data-db-profile]');if(!control)return
      const state=readState();const key=control.dataset.dbProfile as keyof State
      if(key==='minLevel'||key==='maxLevel') (state as any)[key]=control.value===''?null:Number(control.value)
      else (state as any)[key]=control.value
      writeState(state);apply()
    }
    const onClick=(event:MouseEvent)=>{if(!(event.target as HTMLElement).closest('[data-db-profile-clear]'))return;writeState({minLevel:null,maxLevel:null,role:'All',damage:'',affinityType:'',affinityValue:''});apply()}
    apply();const observer=new MutationObserver(()=>requestAnimationFrame(apply));observer.observe(document.body,{childList:true,subtree:true})
    document.addEventListener('input',onInput);document.addEventListener('change',onInput);document.addEventListener('click',onClick)
    return()=>{observer.disconnect();document.removeEventListener('input',onInput);document.removeEventListener('change',onInput);document.removeEventListener('click',onClick)}
  },[])
  return null
}
