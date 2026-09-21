import {env} from 'cloudflare:workers';
export function storage(){if(!env.DB)throw new Error('Progress storage unavailable');return env.DB;}
