export const START='2026-09-01', END='2027-01-31';
export type RecordMap=Record<string,number>;
export const daily=[
 {id:'listen',title:'英语听力',desc:'吃饭时当背景音，轻松听英语',emoji:'🎧'},
 {id:'word',title:'WordEcho 背单词',desc:'每天一点，记得更牢',emoji:'🔤'},
 {id:'bath',title:'洗澡',desc:'清清爽爽，准备休息',emoji:'🛁'},
 {id:'teeth',title:'认真刷牙',desc:'刷满 3 分钟，保护小牙齿',emoji:'🦷'},
 {id:'read',title:'英语阅读',desc:'分级读物 1–2 本',emoji:'📖'},
];
export const weekly=[
 {id:'math',title:'数学进阶学习',desc:'每天约 45 分钟，几点做自己定',emoji:'🧮',target:5,unit:'天'},
 {id:'test',title:'数学周测 + 错题重做',desc:'每周一测，目标正确率 ≥ 85%',emoji:'✏️',target:1,unit:'次'},
 {id:'story',title:'凯叔故事 + 简单复述',desc:'平均每天 1 个故事，听完讲一讲',emoji:'📖',target:7,unit:'个'},
 {id:'words',title:'故事好词好句摘抄',desc:'收藏喜欢的词句',emoji:'📝',target:3,unit:'个'},
 {id:'robot',title:'MiniDuck 机器人项目',desc:'建议周六留一整块时间，动手探索',emoji:'🤖',target:1,unit:'次'},
 {id:'review',title:'周日家庭复盘',desc:'一起数格子、发积分、聊聊怎么调整',emoji:'🗓️',target:1,unit:'次'},
];
export const phases=[
 {id:'p1',time:'10 月上旬',title:'认识硬件',desc:'认识 MiniDuck 主控、电机和传感器；一起装好底盘，跑通官方示例程序。'},
 {id:'p2',time:'10 月中 — 11 月',title:'编程基础',desc:'学习图形化编程，让机器人前进、转弯、亮灯、发出声音。'},
 {id:'p3',time:'11 月 — 12 月上旬',title:'传感器跟随',desc:'理解超声波测距，编写“人近就退、人远就追”的逻辑，调参数并测试。'},
 {id:'p4',time:'12 月底',title:'v1.0 家庭演示',desc:'在客厅跟人走 5 米不迷路，录下第一场演示！之后可探索避障、说话和转向。'},
];
export function todayKey(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
export function addDays(date:string,n:number){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
export function monday(date:string){const d=new Date(date+'T12:00:00Z');return addDays(date,-((d.getUTCDay()+6)%7));}
export function inTerm(date:string){return date>=START && date<=END;}
export function clampDate(date:string){return date<START?START:date>END?END:date;}
export function shortDate(date:string){return `${Number(date.slice(5,7))}月${Number(date.slice(8,10))}日`;}
export function dateCount(a:string,b:string){return Math.max(0,Math.round((Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))/86400000)+1);}
export function dailyCount(records:RecordMap,date:string){return daily.reduce((n,t)=>n+(records[`d:${date}:${t.id}`]||0),0);}
export function weekCount(records:RecordMap,week:string){return weekly.filter(t=>(records[`w:${week}:${t.id}`]||0)>=t.target).length;}
export function validateChange(key:unknown,value:unknown,now=todayKey()){
 if(typeof key!=='string'||typeof value!=='number'||!Number.isInteger(value)||value<0)return false;
 const [kind,period,id]=key.split(':');
 if(kind==='d')return key.split(':').length===3&&period===now&&inTerm(period)&&daily.some(t=>t.id===id)&&value<=1;
 if(kind==='w')return key.split(':').length===3&&period===monday(now)&&inTerm(now)&&weekly.some(t=>t.id===id&&value<=t.target);
 if(kind==='g')return key.split(':').length===2&&['p1','p2','p3','p4','dental','math-all','mock1','mock2'].includes(period)&&value<=1;
 return false;
}
