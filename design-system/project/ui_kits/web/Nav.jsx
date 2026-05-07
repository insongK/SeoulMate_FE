/* global React, I, SM */
function TopNav({ title, onBack, right }) {
  return <div style={{height:56,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",position:"sticky",top:0,zIndex:20,background:"rgba(13,13,13,.85)",backdropFilter:"blur(20px) saturate(180%)",WebkitBackdropFilter:"blur(20px) saturate(180%)",borderBottom:"1px solid var(--border)"}}>
    <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
      {onBack && <button onClick={onBack} aria-label="뒤로" style={{width:40,height:40,borderRadius:12,border:"none",background:"transparent",color:"var(--fg)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><I.ChevronLeft/></button>}
      {title && <div style={{fontSize:17,fontWeight:700,letterSpacing:"-.01em"}}>{title}</div>}
    </div>
    <div style={{display:"flex",gap:6}}>{right}</div>
  </div>;
}

function BottomNav({ active, onChange }) {
  const tabs=[
    {k:"home",label:"홈",Icon:I.Home},
    {k:"search",label:"탐색",Icon:I.Search},
    {k:"+",label:"추천",Icon:I.Plus,fab:true},
    {k:"history",label:"히스토리",Icon:I.Clock},
    {k:"profile",label:"프로필",Icon:I.User},
  ];
  return <div style={{position:"sticky",bottom:0,zIndex:20,background:"rgba(13,13,13,.92)",backdropFilter:"blur(20px) saturate(180%)",WebkitBackdropFilter:"blur(20px) saturate(180%)",borderTop:"1px solid var(--border)"}}>
    <div style={{display:"flex",justifyContent:"space-around",alignItems:"center",height:64,padding:"6px 8px"}}>
      {tabs.map(t=>{
        if(t.fab) return <button key={t.k} onClick={()=>onChange("+")} aria-label="코스 추천 받기" style={{width:56,height:56,borderRadius:"50%",border:"none",background:"var(--grad-amber)",color:"#1A1A1A",display:"flex",alignItems:"center",justifyContent:"center",marginTop:-22,boxShadow:"0 10px 28px rgba(245,166,35,.45)",cursor:"pointer"}}><I.Plus/></button>
        const on = active===t.k;
        return <button key={t.k} onClick={()=>onChange(t.k)} style={{flex:1,maxWidth:80,height:52,display:"flex",flexDirection:"column",alignItems:"center",gap:4,background:"transparent",border:"none",color:on?"var(--primary)":"var(--fg-2)",cursor:"pointer",fontFamily:"inherit"}}>
          <t.Icon s={22}/>
          <span style={{fontSize:11,fontWeight:on?700:500}}>{t.label}</span>
        </button>;
      })}
    </div>
  </div>;
}

window.SMNav = { TopNav, BottomNav };
