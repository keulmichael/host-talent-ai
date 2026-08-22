import {prisma} from "./db";

type MarketRow={name:string;demand:number;supply:number;qualified:number;ratio:number;tension:string};
type SnapshotPayload={market:MarketRow[];signals:number};

export function utcDay(date=new Date()){
  return new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate()));
}

export async function recordTalentSnapshot(organizationId:string, current:{candidateCount:number;jobCount:number;matchCoverage:number;skillCount:number;market:MarketRow[];signals:{length:number}}){
  const snapshotDate=utcDay();
  const payload:SnapshotPayload={market:current.market,signals:current.signals.length};
  return prisma.talentSnapshot.upsert({
    where:{organizationId_snapshotDate:{organizationId,snapshotDate}},
    update:{candidateCount:current.candidateCount,jobCount:current.jobCount,matchCoverage:current.matchCoverage,skillCount:current.skillCount,payload},
    create:{organizationId,snapshotDate,candidateCount:current.candidateCount,jobCount:current.jobCount,matchCoverage:current.matchCoverage,skillCount:current.skillCount,payload}
  });
}

function asPayload(value:unknown):SnapshotPayload{
  if(!value||typeof value!=="object")return{market:[],signals:0};
  const v=value as {market?:unknown;signals?:unknown};
  return{market:Array.isArray(v.market)?v.market as MarketRow[]:[],signals:typeof v.signals==="number"?v.signals:0};
}

function nearestAtOrBefore<T extends {snapshotDate:Date}>(snapshots:T[],target:Date){
  return [...snapshots].filter(s=>s.snapshotDate.getTime()<=target.getTime()).sort((a,b)=>b.snapshotDate.getTime()-a.snapshotDate.getTime())[0]||null;
}

function delta(current:number,previous:number){
  if(previous===0)return current===0?0:null;
  return Math.round(((current-previous)/previous)*100);
}

export async function getTalentHistory(organizationId:string,currentMarket:MarketRow[]){
  const now=utcDay();
  const snapshots=await prisma.talentSnapshot.findMany({where:{organizationId},orderBy:{snapshotDate:"asc"},take:400});
  const first=snapshots[0]||null;
  const days=first?Math.floor((now.getTime()-first.snapshotDate.getTime())/86400000):0;
  const s30=nearestAtOrBefore(snapshots,new Date(now.getTime()-30*86400000));
  const s90=nearestAtOrBefore(snapshots,new Date(now.getTime()-90*86400000));
  const make=(period:30|90,base:typeof s30)=>{
    if(!base)return{period,available:false as const,rows:[]};
    const oldMap=new Map(asPayload(base.payload).market.map(x=>[x.name,x]));
    const rows=currentMarket.map(cur=>{const old=oldMap.get(cur.name);return{name:cur.name,demand:cur.demand,supply:cur.supply,qualified:cur.qualified,demandChange:old?delta(cur.demand,old.demand):null,supplyChange:old?delta(cur.supply,old.supply):null,qualifiedChange:old?delta(cur.qualified,old.qualified):null,previousDemand:old?.demand??null,previousSupply:old?.supply??null,previousQualified:old?.qualified??null};}).filter(x=>x.previousDemand!==null||x.previousSupply!==null).sort((a,b)=>Math.abs(b.demandChange??0)-Math.abs(a.demandChange??0));
    return{period,available:true as const,baseDate:base.snapshotDate,rows};
  };
  return{snapshotCount:snapshots.length,historyDays:days,firstSnapshotDate:first?.snapshotDate||null,trend30:make(30,s30),trend90:make(90,s90)};
}
