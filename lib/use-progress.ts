'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {type RecordMap,todayKey,validateChange} from './plan';
export function useProgress(){
 const [records,setRecords]=useState<RecordMap>({});const recordRef=useRef<RecordMap>({});
 const [ready,setReady]=useState(false);const readyRef=useRef(false);const [busy,setBusy]=useState(false);const busyRef=useRef(false);
 const [error,setError]=useState('');const [auth,setAuth]=useState(false);const [today,setToday]=useState(todayKey());const seq=useRef(0);
 const failedRef=useRef<{key:string,value:number,expected:number}|null>(null);
 const [failed,setFailed]=useState<{key:string,value:number,expected:number}|null>(null);
 const refresh=useCallback(async()=>{
  if(busyRef.current)return;
  const n=++seq.current;
  try{const r=await fetch('/api/progress',{cache:'no-store',signal:AbortSignal.timeout(15000)});if(r.status===401)setAuth(true);if(!r.ok)throw new Error(r.status===401?'请登录后打开你的成长手账。':'暂时无法读取记录，请联网后重试。');const data=await r.json() as {records:RecordMap,today:string};if(n!==seq.current)return;recordRef.current=data.records;setRecords(data.records);setToday(data.today);readyRef.current=true;setReady(true);setAuth(false);if(failedRef.current){const f=failedRef.current;if((data.records[f.key]||0)===f.value){failedRef.current=null;setFailed(null);setError('');}else{const next={...f,expected:data.records[f.key]||0};failedRef.current=next;setFailed(next);}}else setError('');}
  catch(e){if(n===seq.current)setError(e instanceof Error?e.message:'暂时无法读取记录。');}
 },[]);
 const save=useCallback(async(key:string,value:number,expected?:number)=>{
  if(!readyRef.current||busyRef.current)throw new Error('请等待记录加载或保存完成。');
  if(!validateChange(key,value))throw new Error('历史日期仅供查看，不能补卡。');
  busyRef.current=true;setBusy(true);++seq.current;setError('');failedRef.current=null;setFailed(null);
  const old=recordRef.current[key]||0;const previous=expected??old;
  recordRef.current={...recordRef.current,[key]:value};setRecords(recordRef.current);
  try{const r=await fetch('/api/progress',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key,value,expected:previous}),signal:AbortSignal.timeout(15000)});const data=await r.json() as {error?:string};if(!r.ok){if(r.status===401)setAuth(true);throw new Error(data.error||'打卡还没有保存，请重试。');}return {key,value,saved:true};}
  catch(e){recordRef.current={...recordRef.current,[key]:old};setRecords(recordRef.current);failedRef.current={key,value,expected:previous};setFailed(failedRef.current);setError(e instanceof Error&&e.name!=='TimeoutError'?e.message:'保存超时，请重试确认这次打卡。');throw e;}
  finally{busyRef.current=false;setBusy(false);}
 },[]);
 useEffect(()=>{void refresh();const interval=setInterval(()=>{setToday(todayKey());if(document.visibilityState==='visible')void refresh();},60000);const focus=()=>{setToday(todayKey());void refresh();};window.addEventListener('focus',focus);window.addEventListener('online',focus);return()=>{clearInterval(interval);window.removeEventListener('focus',focus);window.removeEventListener('online',focus);};},[refresh]);
 useEffect(()=>{
  const context=(document as Document & {modelContext?:{registerTool:(tool:unknown,options:unknown)=>void}}).modelContext;if(!context?.registerTool)return;
  const life=new AbortController();
  try{context.registerTool({name:'read_study_progress',title:'查看学习打卡',description:'读取已加载的每日、每周和学期打卡记录。日期按北京时间。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>{if(!readyRef.current)throw new Error('记录尚未加载');return {today:todayKey(),records:recordRef.current};}},{signal:life.signal});
  context.registerTool({name:'set_study_checkin',title:'记录学习打卡',description:'记录或撤销今天的每日任务、本周任务次数或学期里程碑。key 使用读取记录的格式；d:日期:listen|word|bath|teeth|read，w:周一日期:math|test|story|robot|review，g:p1|p2|p3|p4|dental|math-all|s-class。',inputSchema:{type:'object',properties:{key:{type:'string'},value:{type:'integer',minimum:0,maximum:7}},required:['key','value'],additionalProperties:false},annotations:{readOnlyHint:false},execute:async(input:unknown)=>{const a=input as {key:string,value:number};if(!a||!validateChange(a.key,a.value))throw new Error('无效的打卡任务、日期或次数');return await save(a.key,a.value);}},{signal:life.signal});}catch(e){console.warn('Study tools unavailable',e);}return()=>life.abort();
 },[save]);
 return {records,ready,busy,error,auth,today,refresh,save,failed};
}
