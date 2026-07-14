const BuyerLoginScene = () => {
  return (
    <div style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
      <svg
        viewBox="0 0 480 560"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="skyBuyer" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a1a12" />
            <stop offset="45%" stopColor="#1a3a22" />
            <stop offset="100%" stopColor="#2d5c20" />
          </linearGradient>
          <radialGradient id="sunHalo" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#ffe066" stopOpacity="1" />
            <stop offset="35%" stopColor="#ffa500" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#ff6600" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ff4400" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="groundBuyer" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a6b25" />
            <stop offset="100%" stopColor="#264d18" />
          </linearGradient>
          <filter id="sfb">
            <feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <rect width="480" height="560" fill="url(#skyBuyer)" />
        {[{x:50,y:35},{x:130,y:20},{x:210,y:50},{x:310,y:28},{x:400,y:42},{x:75,y:75},{x:260,y:65},{x:430,y:18}].map((s,i)=>(
          <circle key={i} cx={s.x} cy={s.y} r="1.4" fill="white" opacity="0.5"/>
        ))}
        <circle cx="240" cy="368" r="90" fill="url(#sunHalo)" opacity="0.9"/>
        <circle cx="240" cy="368" r="34" fill="#ffd700" filter="url(#sfb)" opacity="1"/>
        <circle cx="240" cy="368" r="22" fill="#fff7a0" opacity="1"/>
        {Array.from({length:10},(_,i)=>{ const a=(i*36)*Math.PI/180, cx=240, cy=368; return(
          <line key={i}
            x1={cx+Math.cos(a)*40} y1={cy+Math.sin(a)*40}
            x2={cx+Math.cos(a)*60} y2={cy+Math.sin(a)*60}
            stroke="#ffd700" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
        );})}
        <ellipse cx="90" cy="155" rx="38" ry="14" fill="white" opacity="0.10"/>
        <ellipse cx="110" cy="146" rx="26" ry="13" fill="white" opacity="0.08"/>
        <ellipse cx="370" cy="125" rx="40" ry="15" fill="white" opacity="0.09"/>
        <rect x="0" y="390" width="480" height="170" fill="url(#groundBuyer)" />
        <rect x="0" y="390" width="480" height="5" fill="#4a8030" opacity="0.7"/>
        {Array.from({length:20},(_,i)=>{ const x=12+i*24, h=52+(i%3)*14; return(
          <g key={"wb"+i}>
            <line x1={x} y1="395" x2={x} y2={395-h} stroke="#7ab040" strokeWidth="1.8"/>
            <ellipse cx={x} cy={395-h} rx="4" ry="11" fill="#c8a040" opacity="0.9"/>
            <ellipse cx={x-3} cy={395-h+5} rx="2.5" ry="6" fill="#d4a030" opacity="0.7"/>
            <ellipse cx={x+3} cy={395-h+5} rx="2.5" ry="6" fill="#d4a030" opacity="0.7"/>
          </g>
        );})}
        {Array.from({length:14},(_,i)=>{ const x=18+i*34, h=72+(i%4)*16; return(
          <g key={"wf"+i}>
            <line x1={x} y1="405" x2={x} y2={405-h} stroke="#8bc040" strokeWidth="2.2"/>
            <ellipse cx={x} cy={405-h} rx="5" ry="14" fill="#e0b040" opacity="0.95"/>
            <ellipse cx={x-4} cy={405-h+6} rx="3" ry="8" fill="#d4a030" opacity="0.8"/>
            <ellipse cx={x+4} cy={405-h+6} rx="3" ry="8" fill="#d4a030" opacity="0.8"/>
          </g>
        );})}
      </svg>
    </div>
  );
};
export default BuyerLoginScene;
