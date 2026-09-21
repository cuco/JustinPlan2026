'use client';
import {useState,type CSSProperties} from 'react';
import {CalendarDays,Check,Minus,ArrowUpRight} from 'lucide-react';
import {START,END,daily,weekly,addDays,clampDate,dailyCount,inTerm,monday,semesterWeeks,shortDate,weekCount,type RecordMap} from '@/lib/plan';

const weeks=semesterWeeks();
const weekdays=['一','二','三','四','五','六','日'];
function fullDate(date:string){return `${date.slice(0,4)}年${shortDate(date)}`;}
function weekRange(week:string){return `${shortDate(clampDate(week))} — ${shortDate(clampDate(addDays(week,6)))}`;}

export function StudyCalendar({records,today,ready,onOpen}:{records:RecordMap,today:string,ready:boolean,onOpen:(date:string,view:'daily'|'weekly')=>void}){
 const [selection,setSelection]=useState<{date:string,view:'daily'|'weekly'}>(()=>({date:clampDate(today),view:'daily'}));
 const selectedWeek=monday(selection.date);
 const selectedTotal=selection.view==='daily'?dailyCount(records,selection.date):weekCount(records,selectedWeek);
 const items=selection.view==='daily'?daily.map(t=>({...t,target:1,unit:'项'})):weekly;
 const selectedAvailable=selection.date<=today;
 return <section className="panel study-calendar" aria-label="学期打卡日历">
  <div className="calendar-heading"><h3><CalendarDays size={21}/>学期打卡日历</h3></div>
  <div className="calendar-scroll" tabIndex={0} role="region" aria-label="整个学期每日色块和每周任务数，可横向滚动">
   <div className="calendar-chart" style={{'--week-count':weeks.length} as CSSProperties}>
    <span className="calendar-axis" style={{gridRow:1,gridColumn:1}}/>
    {weeks.map((week,i)=>{const first=Array.from({length:7},(_,day)=>addDays(week,day)).find(d=>inTerm(d)&&(d===START||d.slice(8)==='01'));return <span className="calendar-month" key={week} style={{gridRow:1,gridColumn:i+2}}>{first?`${Number(first.slice(5,7))}月`:''}</span>;})}
    {weekdays.map((label,row)=><span className="calendar-axis" key={label} style={{gridRow:row+2,gridColumn:1}}>周{label}</span>)}
    {weeks.flatMap((week,column)=>weekdays.map((_,row)=>{
     const date=addDays(week,row),valid=inTerm(date),future=date>today,count=ready?dailyCount(records,date):0;
     const selected=selection.view==='daily'?date===selection.date:week===selectedWeek;
     const label=`${fullDate(date)}，${future?'尚未到来':ready?`每日完成 ${count} / ${daily.length} 项`:'正在读取记录'}`;
     return valid?<button type="button" key={date} className={`calendar-day level-${count}${future?' future':''}${selected?' picked':''}${date===today?' is-today':''}`} style={{gridRow:row+2,gridColumn:column+2}} disabled={!ready||future} aria-label={label} title={label} aria-pressed={selected} onClick={()=>setSelection({date,view:'daily'})}>{ready&&!future&&count===daily.length&&<Check size={14} strokeWidth={3} aria-hidden="true"/>}</button>:<span key={date} style={{gridRow:row+2,gridColumn:column+2}} aria-hidden="true"/>;
    }))}
    <span className="calendar-axis calendar-week-label" style={{gridRow:9,gridColumn:1}}>周任务</span>
    {weeks.map((week,column)=>{const future=week>monday(today)||today<START,n=weekCount(records,week);const label=`${weekRange(week)}，${future?'尚未到来':ready?`每周完成 ${n} / ${weekly.length} 项`:'正在读取记录'}`;return <button type="button" key={week} className={'calendar-week'+(selection.view==='weekly'&&selectedWeek===week?' picked':'')+(n===weekly.length&&ready?' complete':'')} style={{gridRow:9,gridColumn:column+2}} aria-label={label} title={label} disabled={!ready||future} aria-pressed={selection.view==='weekly'&&selectedWeek===week} onClick={()=>setSelection({date:clampDate(week),view:'weekly'})}>{future||!ready?'—':`${n}/${weekly.length}`}</button>;})}
   </div>
  </div>
  <div className="calendar-key"><span>每日完成度</span><span className="calendar-colors"><span>0 项</span>{Array.from({length:6},(_,n)=><i key={n} className={`level-${n}`} title={`完成 ${n} 项`} aria-label={`完成 ${n} 项`}/>)}<span>{daily.length} 项</span></span><span className="calendar-future-key"><i className="future"/>未到日期</span></div>
  <div className="calendar-detail" aria-live="polite">
   <div className="calendar-detail-head"><div><strong>{selection.view==='daily'?fullDate(selection.date):weekRange(selectedWeek)}</strong><span>{selection.view==='daily'?'每日打卡':'每周任务'} · {ready&&selectedAvailable?`${selectedTotal} / ${items.length} ${selection.view==='daily'?'已完成':'已达标'}`:!ready?'正在读取记录…':'尚未到来'}</span></div><button className="calendar-open" disabled={!ready||!selectedAvailable} onClick={()=>onOpen(selection.date,selection.view)}>查看{selection.view==='daily'?'当天':'本周'}记录<ArrowUpRight size={16}/></button></div>
   {!ready?<p className="calendar-loading">正在读取打卡记录，请稍候。</p>:!selectedAvailable?<p className="calendar-loading">这一天还没到，先做好今天的小事。</p>:<ul className="calendar-items">{items.map(t=>{const value=records[`${selection.view==='daily'?'d':'w'}:${selection.view==='daily'?selection.date:selectedWeek}:${t.id}`]||0,done=value>=t.target;return <li key={t.id} className={done?'done':''}>{done?<Check size={17}/>:<Minus size={17}/>}<span>{t.title}</span><small>{selection.view==='daily'||t.target===1?(done?'已完成':'未完成'):`${value} / ${t.target} ${t.unit}`}</small></li>;})}</ul>}
  </div>
 </section>;
}
