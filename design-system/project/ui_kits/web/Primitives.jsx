/* global React, I */
const { useState: useStateP } = React;

const cssPrimitives = `
.sm-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:none;cursor:pointer;font-family:inherit;font-weight:700;border-radius:14px;transition:transform .2s var(--ease-out),box-shadow .25s var(--ease-out),filter .2s}
.sm-btn:active{transform:translateY(1px)}
.sm-btn-primary{height:52px;padding:0 22px;background:var(--grad-amber);color:#1A1A1A;font-size:15px;letter-spacing:.02em;box-shadow:0 6px 22px rgba(245,166,35,.35)}
.sm-btn-primary:hover{filter:brightness(1.05);box-shadow:0 10px 30px rgba(245,166,35,.5)}
.sm-btn-outline{height:52px;padding:0 22px;background:transparent;color:var(--primary);border:1.5px solid var(--border-amber);font-size:15px}
.sm-btn-outline:hover{background:rgba(245,166,35,.06)}
.sm-btn-ghost{height:52px;padding:0 22px;background:rgba(255,255,255,.05);color:var(--fg);border:1px solid var(--border);font-size:15px;font-weight:500}
.sm-btn-ghost:hover{background:rgba(255,255,255,.08)}

.sm-chip{display:inline-flex;align-items:center;gap:6px;padding:10px 16px;border-radius:9999px;font-weight:500;font-size:13px;border:1px solid var(--border-strong);background:rgba(255,255,255,.05);color:var(--fg);cursor:pointer;transition:all .2s var(--ease-out)}
.sm-chip:hover{background:rgba(255,255,255,.08);border-color:var(--border-strong)}
.sm-chip[data-on="1"]{background:var(--grad-amber);color:#1A1A1A;font-weight:700;border-color:transparent;box-shadow:0 4px 16px rgba(245,166,35,.30)}

.sm-input{width:100%;height:52px;padding:0 18px;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.09);border-radius:14px;font-family:inherit;font-size:15px;color:var(--fg);outline:none;transition:all .25s var(--ease-out)}
.sm-input:focus{background:rgba(245,166,35,.07);border-color:var(--primary);box-shadow:0 0 0 4px rgba(245,166,35,.13)}
.sm-input::placeholder{color:var(--fg-3)}

.sm-card{background:var(--surface);border:1px solid var(--border);border-radius:20px;box-shadow:var(--shadow-card)}

.sm-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:9999px;font-size:11px;font-weight:600}
.sm-badge-ai{background:rgba(245,166,35,.12);color:var(--primary);letter-spacing:.06em;text-transform:uppercase;padding:5px 10px}
.sm-badge-busy-low{background:rgba(52,199,123,.12);color:var(--success)}
.sm-badge-busy-mid{background:rgba(245,166,35,.14);color:var(--primary)}
.sm-badge-busy-high{background:rgba(232,84,122,.14);color:var(--accent)}
`;

function Style() { return <style dangerouslySetInnerHTML={{__html: cssPrimitives}} /> }

function Button({ variant="primary", children, onClick, icon, full, style }) {
  return <button className={`sm-btn sm-btn-${variant}`} onClick={onClick} style={{...(full?{width:"100%"}:{}), ...style}}>
    {icon} {children}
  </button>
}

function Chip({ active, onClick, children }) {
  return <button className="sm-chip" data-on={active?"1":"0"} onClick={onClick}>{children}</button>
}

function Input({ value, onChange, placeholder, icon, type="text" }) {
  return <div style={{position:"relative"}}>
    {icon && <div style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",color:"var(--fg-3)",pointerEvents:"none"}}>{icon}</div>}
    <input className="sm-input" style={icon?{paddingLeft:48}:{}} type={type} value={value} onChange={onChange} placeholder={placeholder} />
  </div>
}

function BusyBadge({ level }) {
  const map={low:["sm-badge-busy-low","● 여유"],mid:["sm-badge-busy-mid","● 보통"],high:["sm-badge-busy-high","● 혼잡"]};
  const [cls,t]=map[level]||map.low;
  return <span className={`sm-badge ${cls}`}>{t}</span>
}

function AiTag() { return <span className="sm-badge sm-badge-ai"><I.Sparkle s={10}/> AI 추천</span> }

window.SM = { Style, Button, Chip, Input, BusyBadge, AiTag };
