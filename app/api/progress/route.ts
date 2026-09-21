import {getChatGPTUser} from '@/app/chatgpt-auth';
import {storage} from '@/db/storage';
import {validateChange,todayKey} from '@/lib/plan';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store','Vary':'Cookie'};
export async function GET(){
 const user=await getChatGPTUser();
 if(!user)return Response.json({error:'请先登录后查看打卡记录。'},{status:401,headers});
 try{const result=await storage().prepare('SELECT key,value,updated_at FROM progress WHERE user_id = ?').bind(user.userId).all<{key:string,value:number,updated_at:string}>();
 return Response.json({records:Object.fromEntries(result.results.map(r=>[r.key,r.value])),today:todayKey(),accountEmail:user.email,lastSavedAt:result.results.reduce<string|null>((latest,r)=>!latest||r.updated_at>latest?r.updated_at:latest,null)},{headers});
 }catch(e){console.error('Load progress failed',e);return Response.json({error:'暂时无法读取记录，请检查网络后重试。'},{status:503,headers});}
}
export async function POST(request:Request){
 const user=await getChatGPTUser();
 if(!user)return Response.json({error:'登录已过期，请重新登录。'},{status:401,headers});
 if(request.headers.get('sec-fetch-site')==='cross-site')return Response.json({error:'请求来源无效。'},{status:403,headers});
 let payload:any;try{payload=await request.json();}catch{return Response.json({error:'打卡内容无效。'},{status:400,headers});}
 const {key,value,expected}=payload??{};
 if(!validateChange(key,value)||!Number.isInteger(expected)||expected<0||expected>7)return Response.json({error:'只能记录今天与本周的任务，请刷新后重试。'},{status:400,headers});
 try{
 const row=await storage().prepare('INSERT INTO progress (user_id,key,value,updated_at) VALUES (?,?,?,?) ON CONFLICT(user_id,key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at WHERE progress.value=? OR progress.value=excluded.value RETURNING key,value,updated_at').bind(user.userId,key,value,new Date().toISOString(),expected).first<{key:string,value:number,updated_at:string}>();
 if(!row)return Response.json({error:'另一台设备刚更新了这项记录，请刷新后再试。'},{status:409,headers});
 return Response.json({saved:true,key,value,lastSavedAt:row.updated_at},{headers});
 }catch(e){console.error('Save progress failed',e);return Response.json({error:'这次打卡还没有保存，请联网后重试。'},{status:503,headers});}
}
