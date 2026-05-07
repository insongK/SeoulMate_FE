/* global React, I, SM, SMNav, SMCourse */
const {useState:useStateA}=React;

const COURSES=[
  {id:1,title:"남산 단풍 산책",sub:"남산 → 명동 · 3 곳",price:42000,time:"3시간",busy:"low",image:"../../assets/seoul-autumn.png"},
  {id:2,title:"북촌 한옥 골목",sub:"안국 → 삼청 · 4 곳",price:58000,time:"4시간",busy:"mid",image:"../../assets/seoul-autumn.png"},
  {id:3,title:"성수 카페 투어",sub:"성수 → 서울숲 · 4 곳",price:48000,time:"3시간",busy:"high",image:"../../assets/darkMain.png"},
];
const VIBES=["로맨틱","감성","단풍","조용한","야경","산책","맛집","사진"];

function PhoneFrame({children}){return <div style={{width:"100%",maxWidth:430,height:"100%",margin:"0 auto",background:"var(--bg)",position:"relative",display:"flex",flexDirection:"column",borderLeft:"1px solid var(--border)",borderRight:"1px solid var(--border)"}}>{children}</div>}

function HomeScreen({go}){
  return <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"auto"}}>
    <div style={{position:"relative",padding:"28px 20px 32px",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:"url('../../assets/seoul-autumn.png')",backgroundSize:"cover",backgroundPosition:"center"}}/>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(255,249,242,0) 35%,rgba(255,249,242,.92) 88%)"}}/>
      <div style={{position:"relative",minHeight:200}}>
        <div style={{fontSize:11,letterSpacing:".10em",textTransform:"uppercase",color:"#C8442B",marginBottom:8,fontWeight:700}}>가을의 서울 · 오늘 오후</div>
        <div style={{fontSize:30,fontWeight:900,lineHeight:1.1,letterSpacing:"-.02em",marginBottom:140,background:"linear-gradient(135deg,#F5A623 0%,#E8547A 100%)",WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>단풍 사이로,<br/>오늘의 코스</div>
      </div>
      <div style={{position:"relative"}}>
        <div style={{fontSize:14,color:"var(--fg-2)",marginBottom:18,lineHeight:1.5}}>분위기 · 지역 · 예산을 알려주세요.<br/>AI가 가장 어울리는 코스를 만들어드려요.</div>
        <SM.Button variant="primary" full onClick={()=>go("input")} icon={<I.Sparkle s={14}/>}>코스 추천 받기</SM.Button>
      </div>
    </div>
    <div style={{padding:"4px 20px"}}>
      <div style={{position:"relative"}}>
        <SM.Input placeholder="장소 · 분위기 · 예산으로 검색" icon={<I.Search s={18}/>}/>
        <button aria-label="음성" style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",width:40,height:40,borderRadius:10,border:"none",background:"rgba(245,166,35,.14)",color:"var(--primary-deep)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><I.Mic s={18}/></button>
      </div>
    </div>
    <div style={{padding:"24px 20px 12px"}}>
      <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:14}}>
        <div style={{fontSize:18,fontWeight:700,letterSpacing:"-.01em"}}>오늘의 무드</div>
        <div style={{fontSize:13,color:"var(--fg-2)"}}>10월 셋째 주</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <SMCourse.PresetCard title="남산 단풍 산책" sub="해 질 무렵" onClick={()=>go("result")}/>
        <SMCourse.PresetCard title="북촌 한옥 골목" sub="조용한 오후" onClick={()=>go("result")}/>
        <SMCourse.PresetCard title="성수 카페 투어" sub="브런치~오후" image="../../assets/darkMain.png" onClick={()=>go("result")}/>
        <SMCourse.PresetCard title="한강 자전거" sub="늦은 오후" onClick={()=>go("result")}/>
      </div>
    </div>
    <div style={{padding:"12px 20px 24px",display:"flex",flexDirection:"column",gap:12}}>
      <div style={{fontSize:18,fontWeight:700,letterSpacing:"-.01em"}}>이번 주 인기 코스</div>
      {COURSES.map(c=><SMCourse.CourseCard key={c.id} {...c} onClick={()=>go("input")}/>)}
    </div>
  </div>;
}

function InputScreen({go}){
  const[vibes,setVibes]=useStateA(["단풍","감성"]);
  const[budget]=useStateA([40,80]);
  const toggle=v=>setVibes(p=>p.includes(v)?p.filter(x=>x!==v):[...p,v]);
  return <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"auto"}}>
    <SMNav.TopNav title="코스 만들기" onBack={()=>go("home")}/>
    <div style={{flex:1,padding:"16px 20px 20px",display:"flex",flexDirection:"column",gap:24}}>
      <div>
        <div style={{fontSize:11,letterSpacing:".10em",textTransform:"uppercase",color:"var(--primary-deep)",fontWeight:700,marginBottom:6}}>STEP 1 · 분위기</div>
        <div style={{fontSize:22,fontWeight:700,letterSpacing:"-.01em",marginBottom:14}}>어떤 분위기를 찾고 있나요?</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{VIBES.map(v=><SM.Chip key={v} active={vibes.includes(v)} onClick={()=>toggle(v)}>{v}</SM.Chip>)}</div>
      </div>
      <div>
        <div style={{fontSize:11,letterSpacing:".10em",textTransform:"uppercase",color:"var(--primary-deep)",fontWeight:700,marginBottom:6}}>STEP 2 · 지역</div>
        <div style={{fontSize:22,fontWeight:700,letterSpacing:"-.01em",marginBottom:14}}>어디로 갈까요?</div>
        <SM.Input value="남산·명동" onChange={()=>{}} icon={<I.Pin/>}/>
      </div>
      <div>
        <div style={{fontSize:11,letterSpacing:".10em",textTransform:"uppercase",color:"var(--primary-deep)",fontWeight:700,marginBottom:6}}>STEP 3 · 예산</div>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:10}}>
          <div style={{fontSize:22,fontWeight:700,letterSpacing:"-.01em"}}>1인 예산</div>
          <div style={{fontFamily:"var(--font-mono)",fontSize:14,color:"var(--primary-deep)",fontWeight:700}}>₩{budget[0]*1000}–₩{budget[1]*1000}</div>
        </div>
        <div style={{position:"relative",height:8,background:"var(--surface-3)",borderRadius:9999}}>
          <div style={{position:"absolute",left:`${budget[0]/2}%`,right:`${100-budget[1]/2}%`,top:0,bottom:0,background:"var(--grad-amber)",borderRadius:9999}}/>
          <div style={{position:"absolute",left:`${budget[0]/2}%`,top:"50%",transform:"translate(-50%,-50%)",width:22,height:22,borderRadius:"50%",background:"#fff",boxShadow:"0 2px 8px rgba(180,120,60,.30)",border:"1px solid var(--border)"}}/>
          <div style={{position:"absolute",left:`${budget[1]/2}%`,top:"50%",transform:"translate(-50%,-50%)",width:22,height:22,borderRadius:"50%",background:"#fff",boxShadow:"0 2px 8px rgba(180,120,60,.30)",border:"1px solid var(--border)"}}/>
        </div>
      </div>
    </div>
    <div style={{padding:"12px 20px 24px",borderTop:"1px solid var(--border)",background:"var(--bg)"}}>
      <SM.Button variant="primary" full onClick={()=>go("home")} icon={<I.Sparkle s={14}/>}>{vibes.length}개 분위기로 코스 추천</SM.Button>
    </div>
  </div>;
}

function App(){
  const[screen,setScreen]=useStateA("home");
  const[tab,setTab]=useStateA("home");
  const go=(s)=>{setScreen(s);setTab(s==="input"?"+":s==="home"?"home":tab)};
  const onTab=k=>{if(k==="+"){setScreen("input");setTab("+")}else if(k==="home"){setScreen("home");setTab("home")}else{setTab(k)}};
  return <PhoneFrame>
    <SM.Style/>
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {screen==="home" && <HomeScreen go={go}/>}
      {screen==="input" && <InputScreen go={go}/>}
    </div>
    <SMNav.BottomNav active={tab} onChange={onTab}/>
  </PhoneFrame>;
}

ReactDOM.createRoot(document.getElementById("app")).render(<App/>);
