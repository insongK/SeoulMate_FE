/* global React, I, SM, SMNav, SMCourse */
const { useState: useStateA } = React;

const COURSES = [
  { id:1, title:"한강 야경 데이트", sub:"반포 → 한남 → 이태원 · 3 곳", price:82500, time:"4시간 30분", busy:"low", image:"../../assets/seoul-bg.jpg",
    stops:[
      {time:"17:30",name:"반포 한강공원",note:"무지개 분수 · 자전거 30분"},
      {time:"19:00",name:"한남동 부첼라",note:"저녁 식사 · 야외 테라스"},
      {time:"21:30",name:"남산 케이블카",note:"서울 야경 한눈에"}
    ]},
  { id:2, title:"성수 카페 투어", sub:"성수 → 서울숲 · 4 곳", price:48000, time:"3시간", busy:"mid", image:"../../assets/darkMain.png",
    stops:[
      {time:"14:00",name:"어니언 성수",note:"베이커리 카페"},
      {time:"15:30",name:"서울숲 산책",note:"피크닉 30분"},
      {time:"17:00",name:"센터커피",note:"로스터리"}
    ]},
  { id:3, title:"연남동 골목 산책", sub:"홍대입구 → 연남 · 5 곳", price:62000, time:"5시간", busy:"high", image:"../../assets/seoul-bg.jpg",
    stops:[
      {time:"15:00",name:"경의선숲길",note:"산책로 · 30분"},
      {time:"16:30",name:"카페 어반플랜트",note:"디저트 타임"},
      {time:"19:00",name:"연남식당",note:"저녁 식사"}
    ]},
];

const VIBES = ["로맨틱","감성","활동적","조용한","야경","분위기","맛집","산책"];
const REGIONS = ["강남","연남","성수","이태원","한강","홍대","북촌","압구정"];

function PhoneFrame({ children }) {
  return <div style={{width:"100%",maxWidth:430,height:"100%",margin:"0 auto",background:"var(--bg)",position:"relative",display:"flex",flexDirection:"column",borderLeft:"1px solid var(--border)",borderRight:"1px solid var(--border)"}}>{children}</div>;
}

/* ─── HOME ─────────────────────────────────────────────────── */
function HomeScreen({ go }) {
  return <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"auto"}}>
    {/* Hero */}
    <div style={{position:"relative",padding:"24px 20px 28px",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:"url('../../assets/seoul-bg.jpg')",backgroundSize:"cover",backgroundPosition:"center 40%"}}/>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(13,13,13,.75) 0%,rgba(13,13,13,.95) 90%)"}}/>
      <div style={{position:"relative"}}>
        <div style={{fontSize:11,letterSpacing:".10em",textTransform:"uppercase",color:"var(--primary)",marginBottom:8,fontWeight:600}}>오늘 저녁 · 강남</div>
        <div style={{fontSize:32,fontWeight:900,lineHeight:1.1,letterSpacing:"-.02em",marginBottom:8,background:"linear-gradient(135deg,#F5A623 0%,#E8547A 100%)",WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>오늘은<br/>어떤 코스로?</div>
        <div style={{fontSize:14,color:"var(--fg-2)",marginBottom:20,lineHeight:1.5}}>분위기 · 지역 · 예산을 알려주세요.<br/>AI가 가장 어울리는 코스를 만들어드려요.</div>
        <SM.Button variant="primary" full onClick={()=>go("input")} icon={<I.Sparkle s={14}/>}>코스 추천 받기</SM.Button>
      </div>
    </div>

    {/* Quick search */}
    <div style={{padding:"0 20px",marginTop:-2}}>
      <div style={{position:"relative"}}>
        <SM.Input placeholder="장소 · 분위기 · 예산으로 검색" icon={<I.Search s={18}/>}/>
        <button aria-label="음성 검색" style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",width:40,height:40,borderRadius:10,border:"none",background:"rgba(245,166,35,.12)",color:"var(--primary)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><I.Mic s={18}/></button>
      </div>
    </div>

    {/* Section: presets */}
    <div style={{padding:"28px 20px 16px"}}>
      <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:14}}>
        <div style={{fontSize:18,fontWeight:700,letterSpacing:"-.01em"}}>오늘의 무드</div>
        <div style={{fontSize:13,color:"var(--fg-2)"}}>금요일 저녁</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <SMCourse.PresetCard title="한강 야경 데이트" sub="해 질 무렵" tone="sunset" onClick={()=>go("result")}/>
        <SMCourse.PresetCard title="성수 카페 투어" sub="브런치~오후" tone="warm" onClick={()=>go("result")}/>
        <SMCourse.PresetCard title="이태원 펍 크롤" sub="자정까지" tone="night" onClick={()=>go("result")}/>
        <SMCourse.PresetCard title="북촌 한옥 산책" sub="조용한 오후" tone="warm" onClick={()=>go("result")}/>
      </div>
    </div>

    {/* Section: trending */}
    <div style={{padding:"12px 20px 24px",display:"flex",flexDirection:"column",gap:12}}>
      <div style={{fontSize:18,fontWeight:700,letterSpacing:"-.01em",marginBottom:4}}>이번 주 인기 코스</div>
      {COURSES.map(c=><SMCourse.CourseCard key={c.id} {...c} onClick={()=>go("detail",c)}/>)}
    </div>
  </div>;
}

/* ─── INPUT ────────────────────────────────────────────────── */
function InputScreen({ go }) {
  const [vibes,setVibes] = useStateA(["로맨틱","야경"]);
  const [region,setRegion] = useStateA("강남");
  const [budget,setBudget] = useStateA([60,120]);

  const toggle = (v) => setVibes(p => p.includes(v) ? p.filter(x=>x!==v) : [...p,v]);

  return <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"auto"}}>
    <SMNav.TopNav title="코스 만들기" onBack={()=>go("home")}/>
    <div style={{flex:1,padding:"16px 20px 20px",display:"flex",flexDirection:"column",gap:24}}>
      <div>
        <div style={{fontSize:11,letterSpacing:".10em",textTransform:"uppercase",color:"var(--primary)",fontWeight:600,marginBottom:6}}>STEP 1 · 분위기</div>
        <div style={{fontSize:22,fontWeight:700,letterSpacing:"-.01em",marginBottom:14}}>어떤 분위기를 찾고 있나요?</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {VIBES.map(v=><SM.Chip key={v} active={vibes.includes(v)} onClick={()=>toggle(v)}>{v}</SM.Chip>)}
        </div>
      </div>
      <div>
        <div style={{fontSize:11,letterSpacing:".10em",textTransform:"uppercase",color:"var(--primary)",fontWeight:600,marginBottom:6}}>STEP 2 · 지역</div>
        <div style={{fontSize:22,fontWeight:700,letterSpacing:"-.01em",marginBottom:14}}>어디로 갈까요?</div>
        <SM.Input value={region} onChange={e=>setRegion(e.target.value)} icon={<I.Pin/>}/>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:12}}>
          {REGIONS.map(r=><SM.Chip key={r} active={region===r} onClick={()=>setRegion(r)}>{r}</SM.Chip>)}
        </div>
      </div>
      <div>
        <div style={{fontSize:11,letterSpacing:".10em",textTransform:"uppercase",color:"var(--primary)",fontWeight:600,marginBottom:6}}>STEP 3 · 예산</div>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:14}}>
          <div style={{fontSize:22,fontWeight:700,letterSpacing:"-.01em"}}>1인 예산</div>
          <div style={{fontFamily:"var(--font-mono)",fontSize:14,color:"var(--primary)",fontWeight:700}}>₩{budget[0]*1000}–₩{budget[1]*1000}</div>
        </div>
        <div style={{position:"relative",height:8,background:"var(--surface-2)",borderRadius:9999,marginTop:8,marginBottom:6}}>
          <div style={{position:"absolute",left:`${budget[0]/2}%`,right:`${100-budget[1]/2}%`,top:0,bottom:0,background:"var(--grad-amber)",borderRadius:9999}}/>
          <div style={{position:"absolute",left:`${budget[0]/2}%`,top:"50%",transform:"translate(-50%,-50%)",width:22,height:22,borderRadius:"50%",background:"#fff",boxShadow:"0 2px 10px rgba(0,0,0,.5)"}}/>
          <div style={{position:"absolute",left:`${budget[1]/2}%`,top:"50%",transform:"translate(-50%,-50%)",width:22,height:22,borderRadius:"50%",background:"#fff",boxShadow:"0 2px 10px rgba(0,0,0,.5)"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--fg-2)",fontFamily:"var(--font-mono)"}}><span>₩0</span><span>₩200,000+</span></div>
      </div>
    </div>
    <div style={{padding:"12px 20px 24px",borderTop:"1px solid var(--border)",background:"var(--bg)"}}>
      <SM.Button variant="primary" full onClick={()=>go("result")} icon={<I.Sparkle s={14}/>}>{vibes.length}개 분위기로 코스 추천</SM.Button>
    </div>
  </div>;
}

/* ─── RESULT LIST ──────────────────────────────────────────── */
function ResultListScreen({ go }) {
  return <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"auto"}}>
    <SMNav.TopNav title="추천 결과" onBack={()=>go("input")}/>
    <div style={{padding:"4px 20px 8px",display:"flex",alignItems:"center",gap:8,color:"var(--fg-2)",fontSize:13}}>
      <SM.AiTag/>
      <span>· 강남 · 로맨틱 야경 · ₩60–120k</span>
    </div>
    <div style={{padding:"8px 20px 20px",display:"flex",flexDirection:"column",gap:12}}>
      {COURSES.map(c=><SMCourse.CourseCard key={c.id} {...c} onClick={()=>go("detail",c)}/>)}
    </div>
  </div>;
}

/* ─── DETAIL ───────────────────────────────────────────────── */
function DetailScreen({ go, course, saved, toggleSave }) {
  if(!course) return null;
  return <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"auto"}}>
    <div style={{position:"relative",height:240,overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:`url('${course.image}')`,backgroundSize:"cover",backgroundPosition:"center"}}/>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(0deg,rgba(13,13,13,.95) 0%,rgba(13,13,13,.2) 70%)"}}/>
      <div style={{position:"absolute",left:12,top:12,zIndex:2}}>
        <button onClick={()=>go("result")} aria-label="뒤로" style={{width:40,height:40,borderRadius:12,border:"1px solid var(--border)",background:"rgba(13,13,13,.5)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(12px)"}}><I.ChevronLeft/></button>
      </div>
      <div style={{position:"absolute",right:12,top:12,zIndex:2}}>
        <button onClick={toggleSave} aria-label="저장" style={{width:40,height:40,borderRadius:12,border:"1px solid var(--border)",background:"rgba(13,13,13,.5)",color:saved?"#E8547A":"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(12px)"}}><I.Heart fill={saved?"#E8547A":"none"}/></button>
      </div>
      <div style={{position:"absolute",left:20,right:20,bottom:18}}>
        <div style={{display:"flex",gap:8,marginBottom:8}}><SM.AiTag/><SM.BusyBadge level={course.busy}/></div>
        <div style={{fontSize:26,fontWeight:800,letterSpacing:"-.01em",color:"#fff"}}>{course.title}</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,.7)",marginTop:2}}>{course.sub}</div>
      </div>
    </div>

    <div style={{padding:"20px"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:18}}>
        {[{l:"소요",v:course.time,Ic:I.Clock},{l:"1인 예산",v:`₩${course.price.toLocaleString()}`,Ic:I.Won},{l:"장소",v:`${course.stops.length}곳`,Ic:I.Pin}].map((x,i)=>(
          <div key={i} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"12px 10px",textAlign:"center"}}>
            <div style={{color:"var(--primary)",display:"flex",justifyContent:"center",marginBottom:4}}><x.Ic s={16}/></div>
            <div style={{fontSize:11,color:"var(--fg-2)",marginBottom:2,letterSpacing:".04em"}}>{x.l}</div>
            <div style={{fontSize:14,fontWeight:700,color:"var(--fg)"}}>{x.v}</div>
          </div>
        ))}
      </div>

      <div style={{fontSize:18,fontWeight:700,letterSpacing:"-.01em",marginBottom:12}}>경로</div>
      <SMCourse.MapStub stops={course.stops}/>

      <div style={{fontSize:18,fontWeight:700,letterSpacing:"-.01em",margin:"22px 0 12px"}}>코스 일정</div>
      <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:20,padding:"18px 18px 14px"}}>
        <SMCourse.Timeline stops={course.stops}/>
      </div>
    </div>

    <div style={{padding:"12px 20px 24px",borderTop:"1px solid var(--border)",background:"var(--bg)",display:"flex",gap:10,position:"sticky",bottom:0}}>
      <SM.Button variant="ghost" onClick={toggleSave} icon={<I.Heart s={18} fill={saved?"#E8547A":"none"}/>}>{saved?"저장됨":"저장"}</SM.Button>
      <div style={{flex:1}}><SM.Button variant="primary" full icon={<I.Map s={16}/>}>이 코스로 시작하기</SM.Button></div>
    </div>
  </div>;
}

/* ─── PROFILE ──────────────────────────────────────────────── */
function ProfileScreen() {
  return <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"auto"}}>
    <SMNav.TopNav title="프로필" right={<button aria-label="설정" style={{width:40,height:40,borderRadius:12,border:"none",background:"transparent",color:"var(--fg-2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><I.Settings/></button>}/>
    <div style={{padding:"8px 20px 24px",display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",gap:14,alignItems:"center"}}>
        <div style={{width:72,height:72,borderRadius:"50%",background:"var(--grad-amber)",display:"flex",alignItems:"center",justifyContent:"center",color:"#1A1A1A",fontWeight:900,fontSize:26}}>지</div>
        <div>
          <div style={{fontSize:20,fontWeight:700,letterSpacing:"-.01em"}}>지수님</div>
          <div style={{fontSize:13,color:"var(--fg-2)"}}>jisoo@seoulmate.kr</div>
          <div style={{fontSize:12,color:"var(--primary)",marginTop:4,fontWeight:600}}>저장한 코스 12개 · 다녀온 코스 3개</div>
        </div>
      </div>
      <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:20,overflow:"hidden"}}>
        {["선호 분위기 설정","즐겨찾는 지역","예산 기본값","알림 설정","오프라인 저장","로그아웃"].map((label,i,arr)=>(
          <div key={label} style={{padding:"16px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:i<arr.length-1?"1px solid var(--border)":"none",cursor:"pointer"}}>
            <div style={{fontSize:15,fontWeight:500,color:label==="로그아웃"?"var(--accent)":"var(--fg)"}}>{label}</div>
            {label!=="로그아웃" && <I.ChevronRight/>}
          </div>
        ))}
      </div>
    </div>
  </div>;
}

/* ─── APP ──────────────────────────────────────────────────── */
function App() {
  const [screen,setScreen] = useStateA("home");
  const [course,setCourse] = useStateA(null);
  const [tab,setTab] = useStateA("home");
  const [saved,setSaved] = useStateA(new Set([2]));

  const go = (s, c) => {
    if(s==="detail" && c) setCourse(c);
    setScreen(s);
    if(s==="home") setTab("home");
    if(s==="input"||s==="+") { setScreen("input"); setTab("+"); }
    if(s==="profile") setTab("profile");
    if(s==="history") setTab("history");
  };

  const onTab = (k) => {
    if(k==="+") { setScreen("input"); setTab("+"); }
    else if(k==="home") { setScreen("home"); setTab("home"); }
    else if(k==="profile") { setScreen("profile"); setTab("profile"); }
    else { setScreen("home"); setTab(k); }
  };

  const isSaved = course && saved.has(course.id);
  const toggleSave = () => {
    if(!course) return;
    const n = new Set(saved);
    n.has(course.id) ? n.delete(course.id) : n.add(course.id);
    setSaved(n);
  };

  return <PhoneFrame>
    <SM.Style/>
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}} data-screen-label={`Screen ${screen}`}>
      {screen==="home" && <HomeScreen go={go}/>}
      {screen==="input" && <InputScreen go={go}/>}
      {screen==="result" && <ResultListScreen go={go}/>}
      {screen==="detail" && <DetailScreen go={go} course={course} saved={isSaved} toggleSave={toggleSave}/>}
      {screen==="profile" && <ProfileScreen/>}
    </div>
    <SMNav.BottomNav active={tab} onChange={onTab}/>
  </PhoneFrame>;
}

ReactDOM.createRoot(document.getElementById("app")).render(<App/>);
