import type {Metadata,Viewport} from 'next';
import './globals.css';
export const metadata:Metadata={title:'郑艺的成长手账',description:'三年级上学期，每日打卡、每周任务与成长目标。',manifest:'manifest.webmanifest',appleWebApp:{capable:true,title:'成长手账',statusBarStyle:'default'},icons:{icon:'favicon.svg',apple:'apple-touch-icon.png'}};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#256854',viewportFit:'cover'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>}
