/* global React, I, SM */
const { useState: useStateS } = React;

function PresetCard({ title, sub, tone, onClick }) {
  const tones = {
    sunset: "linear-gradient(135deg,#F5A623 0%,#E8547A 100%)",
    night:  "linear-gradient(135deg,#3B2A6E 0%,#0D0D0D 100%)",
    warm:   "linear-gradient(135deg,#FFC56B 0%,#F5A623 100%)",
  };
  return <button onClick={onClick} style={{position:"relative",height:148,borderRadius:20,border:"1px solid var(--border)",overflow:"hidden",background:tones[tone]||tones.sunset,padding:16,textAlign:"left",cursor:"pointer",fontFamily:"inherit",color:"#1A1A1A"}}>
    <div style={{position:"absolute",inset:0,backgroundImage:"url('../../assets/seoul-bg.jpg')",backgroundSize:"cover",backgroundPosition:"center",opacity:.5,mixBlendMode:"overlay"}}/>
    <div style={{position:"absolute",inset:0,background:"linear-gradient(0deg,rgba(13,13,13,.6) 0%,rgba(13,13,13,0) 60%)"}}/>
    <div style={{position:"relative",height:"100%",display:"flex",flexDirection:"column",justifyContent:"flex-end",color:"#fff"}}>
      <div style={{fontSize:13,opacity:.85,marginBottom:2,letterSpacing:".02em"}}>{sub}</div>
      <div style={{fontSize:18,fontWeight:800,letterSpacing:"-.01em"}}>{title}</div>
    </div>
  </button>;
}

function CourseCard({ title, sub, price, time, busy, image, onClick, saved, onSave }) {
  return <div onClick={onClick} style={{display:"flex",gap:14,padding:14,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:20,boxShadow:"var(--shadow-card)",cursor:"pointer"}}>
    <div style={{width:96,height:96,borderRadius:14,flexShrink:0,position:"relative",overflow:"hidden",background:"var(--grad-amber)"}}>
      {image && <div style={{position:"absolute",inset:0,backgroundImage:`url('${image}')`,backgroundSize:"cover",backgroundPosition:"center",mixBlendMode:"overlay",opacity:.85}}/>}
    </div>
    <div style={{flex:1,display:"flex",flexDirection:"column",gap:6,minWidth:0}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <SM.AiTag/>
        <span style={{fontSize:12,color:"var(--fg-2)",display:"inline-flex",alignItems:"center",gap:4}}><I.Clock s={12}/>{time}</span>
      </div>
      <div style={{fontSize:17,fontWeight:700,letterSpacing:"-.01em",color:"var(--fg)"}}>{title}</div>
      <div style={{fontSize:13,color:"var(--fg-2)"}}>{sub}</div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:2}}>
        <span style={{fontFamily:"var(--font-mono)",fontSize:13,color:"var(--fg)"}}>₩{price.toLocaleString()} / 인</span>
        <SM.BusyBadge level={busy}/>
      </div>
    </div>
    <button onClick={e=>{e.stopPropagation();onSave&&onSave();}} aria-label="저장" style={{width:36,height:36,borderRadius:10,border:"1px solid var(--border)",background:"rgba(255,255,255,.04)",color:saved?"var(--accent)":"var(--fg-2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",alignSelf:"flex-start"}}>
      <I.Heart fill={saved?"#E8547A":"none"}/>
    </button>
  </div>;
}

function Timeline({ stops }) {
  return <div style={{display:"flex",flexDirection:"column",gap:0,padding:"4px 0"}}>
    {stops.map((s,i)=>(
      <div key={i} style={{display:"flex",gap:14}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:28}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:"var(--grad-amber)",display:"flex",alignItems:"center",justifyContent:"center",color:"#1A1A1A",fontWeight:800,fontSize:13,flexShrink:0}}>{i+1}</div>
          {i<stops.length-1 && <div style={{flex:1,width:2,minHeight:42,background:"linear-gradient(180deg,#F5A623 0%,#E8547A 100%)",opacity:.4}}/>}
        </div>
        <div style={{flex:1,paddingBottom:i<stops.length-1?22:0,marginTop:-2}}>
          <div style={{fontSize:11,letterSpacing:".06em",textTransform:"uppercase",color:"var(--fg-2)",marginBottom:2}}>{s.time}</div>
          <div style={{fontSize:16,fontWeight:700,color:"var(--fg)"}}>{s.name}</div>
          <div style={{fontSize:13,color:"var(--fg-2)"}}>{s.note}</div>
        </div>
      </div>
    ))}
  </div>;
}

function MapStub({ stops }) {
  return <div style={{position:"relative",height:200,borderRadius:20,overflow:"hidden",background:"#141414",border:"1px solid var(--border)"}}>
    <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle at 30% 30%, rgba(245,166,35,.10) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(232,84,122,.10) 0%, transparent 50%)"}}/>
    <svg viewBox="0 0 320 200" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" stroke="rgba(255,255,255,.04)" fill="none"/></pattern>
      </defs>
      <rect width="320" height="200" fill="url(#grid)"/>
      <path d="M40 150 Q100 80 160 110 T280 60" stroke="url(#routeGrad)" strokeWidth="3" fill="none" strokeDasharray="0" strokeLinecap="round"/>
      <defs>
        <linearGradient id="routeGrad" x1="0" x2="1"><stop offset="0" stopColor="#F5A623"/><stop offset="1" stopColor="#E8547A"/></linearGradient>
      </defs>
      {[[40,150],[160,110],[280,60]].map(([x,y],i)=>(
        <g key={i}>
          <circle cx={x} cy={y} r="14" fill="rgba(13,13,13,.85)" stroke="#F5A623" strokeWidth="2"/>
          <text x={x} y={y+4} textAnchor="middle" fill="#F5A623" fontSize="12" fontWeight="800" fontFamily="Pretendard Variable">{i+1}</text>
        </g>
      ))}
    </svg>
    <div style={{position:"absolute",left:12,bottom:12,background:"rgba(13,13,13,.7)",border:"1px solid var(--border)",borderRadius:9999,padding:"6px 12px",fontSize:11,color:"var(--fg-2)",letterSpacing:".04em",backdropFilter:"blur(8px)"}}>Kakao Maps</div>
  </div>;
}

window.SMCourse = { PresetCard, CourseCard, Timeline, MapStub };
