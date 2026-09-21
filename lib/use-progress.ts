'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import {END,START,type RecordMap,todayKey,validateChange} from './plan';

const STORAGE_KEY='justin-plan-2026:progress:v1';
const dailyKey=/^d:(\d{4}-\d{2}-\d{2}):(listen|word|bath|teeth|read)$/;
const weeklyKey=/^w:(\d{4}-\d{2}-\d{2}):(math|test|story|robot|review)$/;
const goalKey=/^g:(p1|p2|p3|p4|dental|math-all|s-class)$/;

type StoredProgress={version:1;records:RecordMap;lastSavedAt:string|null};

function isRecordKey(key:string){
 const day=key.match(dailyKey);if(day)return day[1]>=START&&day[1]<=END;
 const week=key.match(weeklyKey);if(week)return week[1]>='2026-08-31'&&week[1]<=END;
 return goalKey.test(key);
}

function cleanRecords(value:unknown):RecordMap{
 if(!value||typeof value!=='object'||Array.isArray(value))return {};
 return Object.fromEntries(Object.entries(value).filter(([key,n])=>isRecordKey(key)&&Number.isInteger(n)&&Number(n)>=0&&Number(n)<=7).map(([key,n])=>[key,Number(n)]));
}

function readStored():StoredProgress{
 const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return {version:1,records:{},lastSavedAt:null};
 const data=JSON.parse(raw) as {records?:unknown,lastSavedAt?:unknown};
 return {version:1,records:cleanRecords(data.records),lastSavedAt:typeof data.lastSavedAt==='string'?data.lastSavedAt:null};
}

function writeStored(records:RecordMap,lastSavedAt:string){
 localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,records,lastSavedAt} satisfies StoredProgress));
}

export function useProgress(){
 const [records,setRecords]=useState<RecordMap>({});const recordRef=useRef<RecordMap>({});
 const [ready,setReady]=useState(false);const readyRef=useRef(false);const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');const [today,setToday]=useState(todayKey());
 const [lastSavedAt,setLastSavedAt]=useState<string|null>(null);

 const refresh=useCallback(async()=>{
  try{const data=readStored();recordRef.current=data.records;setRecords(data.records);setLastSavedAt(data.lastSavedAt);setToday(todayKey());readyRef.current=true;setReady(true);setError('');}
  catch{readyRef.current=false;setReady(false);setError('无法读取本机记录，请导入之前导出的备份。');}
 },[]);

 const save=useCallback(async(key:string,value:number)=>{
  if(!readyRef.current)throw new Error('请等待本机记录加载完成。');
  if(!validateChange(key,value))throw new Error('历史日期仅供查看，不能补卡。');
  const old=recordRef.current;const next={...old,[key]:value};const savedAt=new Date().toISOString();
  setBusy(true);setError('');recordRef.current=next;setRecords(next);
  try{writeStored(next,savedAt);setLastSavedAt(savedAt);return {key,value,saved:true};}
  catch(e){recordRef.current=old;setRecords(old);setError('本机空间不足，记录尚未保存。请先导出备份。');throw e;}
  finally{setBusy(false);}
 },[]);

 const exportData=useCallback(()=>{
  const payload=JSON.stringify({app:'JustinPlan2026',version:1,records:recordRef.current,exportedAt:new Date().toISOString()},null,2);
  const url=URL.createObjectURL(new Blob([payload],{type:'application/json'}));const link=document.createElement('a');
  link.href=url;link.download=`JustinPlan2026-${todayKey()}.json`;link.click();URL.revokeObjectURL(url);
 },[]);

 const importData=useCallback(async(raw:string)=>{
  const data=JSON.parse(raw) as {records?:unknown};const imported=cleanRecords(data.records);
  if(!Object.keys(imported).length)throw new Error('备份文件中没有可导入的打卡记录。');
  const next={...recordRef.current,...imported};const savedAt=new Date().toISOString();writeStored(next,savedAt);
  recordRef.current=next;setRecords(next);setLastSavedAt(savedAt);setError('');return Object.keys(imported).length;
 },[]);

 useEffect(()=>{
  void refresh();
  const restore=()=>{if(document.visibilityState==='visible')void refresh();};
  const timer=setInterval(()=>setToday(todayKey()),60000);
  window.addEventListener('pageshow',restore);window.addEventListener('storage',restore);document.addEventListener('visibilitychange',restore);
  if('serviceWorker'in navigator)void navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
  return()=>{clearInterval(timer);window.removeEventListener('pageshow',restore);window.removeEventListener('storage',restore);document.removeEventListener('visibilitychange',restore);};
 },[refresh]);

 return {records,ready,busy,error,today,refresh,save,lastSavedAt,exportData,importData};
}
