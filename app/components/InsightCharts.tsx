type BarItem={label:string;value:number;meta?:string};
type CompareItem={label:string;primary:number;secondary:number;primaryLabel?:string;secondaryLabel?:string;meta?:string};
type DeltaItem={label:string;value:number;meta?:string};

function pct(value:number,max:number){return max>0?Math.max(2,Math.round(value/max*100)):0}

export function HorizontalBars({title,description,items}:{title:string;description?:string;items:BarItem[]}){
 const max=Math.max(0,...items.map(x=>x.value));
 return <section className="chartCard" aria-label={title}><div className="chartHeader"><div><h3>{title}</h3>{description&&<p>{description}</p>}</div></div><div className="chartRows">{items.map(x=><div className="chartRow" key={x.label}><div className="chartLabel"><strong>{x.label}</strong>{x.meta&&<span>{x.meta}</span>}</div><div className="chartTrack" aria-hidden="true"><span className="chartFill" style={{width:`${pct(x.value,max)}%`}}/></div><div className="chartValue">{x.value}</div></div>)}</div></section>
}

export function ComparisonBars({title,description,items,primaryLegend="Demande",secondaryLegend="Offre qualifiée"}:{title:string;description?:string;items:CompareItem[];primaryLegend?:string;secondaryLegend?:string}){
 const max=Math.max(0,...items.flatMap(x=>[x.primary,x.secondary]));
 return <section className="chartCard" aria-label={title}><div className="chartHeader"><div><h3>{title}</h3>{description&&<p>{description}</p>}</div><div className="chartLegend"><span><i className="legendDot primary"/>{primaryLegend}</span><span><i className="legendDot secondary"/>{secondaryLegend}</span></div></div><div className="compareRows">{items.map(x=><div className="compareRow" key={x.label}><div className="chartLabel"><strong>{x.label}</strong>{x.meta&&<span>{x.meta}</span>}</div><div className="compareBars"><div><span className="compareFill primary" style={{width:`${pct(x.primary,max)}%`}}/><b>{x.primary}</b></div><div><span className="compareFill secondary" style={{width:`${pct(x.secondary,max)}%`}}/><b>{x.secondary}</b></div></div></div>)}</div></section>
}

export function DivergingBars({title,description,items}:{title:string;description?:string;items:DeltaItem[]}){
 const max=Math.max(1,...items.map(x=>Math.abs(x.value)));
 return <section className="chartCard" aria-label={title}><div className="chartHeader"><div><h3>{title}</h3>{description&&<p>{description}</p>}</div><div className="chartLegend"><span><i className="legendDot positive"/>Hausse</span><span><i className="legendDot negative"/>Baisse</span></div></div><div className="deltaRows">{items.map(x=>{const width=Math.max(3,Math.round(Math.abs(x.value)/max*50));return <div className="deltaRow" key={x.label}><div className="chartLabel"><strong>{x.label}</strong>{x.meta&&<span>{x.meta}</span>}</div><div className="deltaAxis"><span className="deltaZero"/><span className={`deltaFill ${x.value>=0?"positive":"negative"}`} style={x.value>=0?{left:"50%",width:`${width}%`}:{right:"50%",width:`${width}%`}}/></div><div className={`deltaValue ${x.value>=0?"positiveText":"negativeText"}`}>{x.value>0?"+":""}{String(x.value).replace(".",",")} %</div></div>})}</div></section>
}
