/* global React, I, SM */
function PresetCard({title,sub,onClick,image="../../assets/seoul-autumn.png"}){
  return <button onClick={onClick} style={{position:"relative",height:148,borderRadius:20,border:"1px solid var(--border)",overflow:"hidden",padding:0,textAlign:"left",cursor:"pointer",fontFamily:"inherit",background:"#FFFFFF"}}>
    <div style={{position:"absolute",inset:0,backgroundImage:`url('${image}')`,backgroundSize:"cover",backgroundPosition:"center"}}/>
    <div style={{position:"absolute",inset:0,background:"linear-gradient(0deg,rgba(31,26,20,.65) 0%,rgba(31,26,20,0) 60%)"}}/>
    <div style={{position:"relative",height:"100%",padding:14,display:"flex",flexDirection:"column",justifyContent:"flex-end",color:"#FFFFFF"}}>
      <div style={{fontSize:12,opacity:.9,marginBottom:2,letterSpacing:".02em"}}>{sub}</div>
      <div style={{fontSize:17,fontWeight:800,letterSpacing:"-.01em"}}>{title}</div>
    </div>
  </button>;
}
function CourseCard({title,sub,price,time,busy,image,onClick,saved,onSave}){
  return <div onClick={onClick} style={{display:"flex",gap:14,padding:14,background:"#FFFFFF",border:"1px solid var(--border)",borderRadius:20,boxShadow:"var(--shadow-card)",cursor:"pointer"}}>
    <div style={{width:96,height:96,borderRadius:14,flexShrink:0,backgroundImage:`url('${image||"../../assets/seoul-autumn.png"}')`,backgroundSize:"cover",backgroundPosition:"center"}}/>
    <div style={{flex:1,display:"flex",flexDirection:"column",gap:6,minWidth:0}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}><SM.AiTag/><span style={{fontSize:12,color:"var(--fg-2)",display:"inline-flex",alignItems:"center",gap:4}}><I.Clock s={12}/>{time}</span></div>
      <div style={{fontSize:17,fontWeight:700,letterSpacing:"-.01em"}}>{title}</div>
      <div style={{fontSize:13,color:"var(--fg-2)"}}>{sub}</div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:2}}>
        <span style={{fontFamily:"var(--font-mono)",fontSize:13}}>₩{price.toLocaleString()} / 인</span>
        <SM.BusyBadge level={busy}/>
      </div>
    </div>
    <button onClick={e=>{e.stopPropagation();onSave&&onSave();}} aria-label="저장" style={{width:36,height:36,borderRadius:10,border:"1px solid var(--border)",background:"#FFFFFF",color:saved?"var(--accent)":"var(--fg-2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",alignSelf:"flex-start"}}><I.Heart fill={saved?"#E8547A":"none"}/></button>
  </div>;
}
window.SMCourse={PresetCard,CourseCard};
