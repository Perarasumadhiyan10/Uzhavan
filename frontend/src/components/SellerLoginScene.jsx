const SellerLoginScene = () => {
  return (
    <div style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
      <svg
        viewBox="0 0 480 560"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="skySeller" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#050e08"/>
            <stop offset="50%" stopColor="#0f2218"/>
            <stop offset="100%" stopColor="#1e4012"/>
          </linearGradient>
          <linearGradient id="groundSeller" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2e5c1a"/>
            <stop offset="100%" stopColor="#1a3c0e"/>
          </linearGradient>
          <radialGradient id="moonGlowS" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#fffde0" stopOpacity="1"/>
            <stop offset="60%" stopColor="#ffd700" stopOpacity="0.35"/>
            <stop offset="100%" stopColor="#ffd700" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="lanternGlowS" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#ffcc44" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#ffaa00" stopOpacity="0"/>
          </radialGradient>
          <filter id="gls">
            <feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <rect width="480" height="560" fill="url(#skySeller)"/>
        <circle cx="370" cy="80" r="32" fill="url(#moonGlowS)" filter="url(#gls)" opacity="1"/>
        <circle cx="362" cy="73" r="4.5" fill="#e8d870" opacity="0.2"/>
        <circle cx="378" cy="88" r="3" fill="#e8d870" opacity="0.15"/>
        {[{x:40,y:45},{x:100,y:28},{x:170,y:60},{x:250,y:35},{x:300,y:72},{x:430,y:40},{x:60,y:105},{x:195,y:90},{x:330,y:108}].map((s,i)=>(
          <circle key={i} cx={s.x} cy={s.y} r="1.7" fill="white" opacity="0.7"/>
        ))}
        <rect x="0" y="390" width="480" height="170" fill="url(#groundSeller)"/>
        <rect x="0" y="390" width="480" height="4" fill="#3a7020" opacity="0.7"/>
        <rect x="330" y="265" width="118" height="130" fill="#4a2c10"/>
        <polygon points="320,265 389,208 458,265" fill="#7a1a1a"/>
        <rect x="366" y="310" width="32" height="85" rx="2" fill="#2e1a08"/>
        <line x1="382" y1="310" x2="382" y2="395" stroke="#1e1008" strokeWidth="1.5"/>
        <rect x="342" y="280" width="22" height="18" rx="2" fill="#110c05"/>
        <rect x="445" y="248" width="30" height="147" rx="5" fill="#5a3c1a"/>
        <ellipse cx="460" cy="248" rx="15" ry="7" fill="#7a5430"/>
        <line x1="389" y1="208" x2="389" y2="228" stroke="#8a6030" strokeWidth="1.5"/>
        <rect x="384" y="228" width="10" height="12" rx="2" fill="#c07820"/>
        <circle cx="389" cy="236" r="14" fill="url(#lanternGlowS)" opacity="0.7"/>
        {Array.from({length:18},(_,i)=>{ const x=10+i*26, h=50+(i%3)*13; return(
          <g key={"ws"+i}>
            <line x1={x} y1="395" x2={x} y2={395-h} stroke="#6a9830" strokeWidth="1.8"/>
            <ellipse cx={x} cy={395-h} rx="4" ry="11" fill="#b89030" opacity="0.9"/>
            <ellipse cx={x-3} cy={395-h+5} rx="2.5" ry="6" fill="#c89020" opacity="0.7"/>
            <ellipse cx={x+3} cy={395-h+5} rx="2.5" ry="6" fill="#c89020" opacity="0.7"/>
          </g>
        );})}
        {Array.from({length:14},(_,i)=>{ const x=16+i*34, h=68+(i%4)*16; return(
          <g key={"wf"+i}>
            <line x1={x} y1="405" x2={x} y2={405-h} stroke="#7aaa38" strokeWidth="2.2"/>
            <ellipse cx={x} cy={405-h} rx="5" ry="14" fill="#d0a038" opacity="0.95"/>
            <ellipse cx={x-4} cy={405-h+6} rx="3" ry="8" fill="#c09028" opacity="0.8"/>
            <ellipse cx={x+4} cy={405-h+6} rx="3" ry="8" fill="#c09028" opacity="0.8"/>
          </g>
        );})}
      </svg>
    </div>
  );
};
export default SellerLoginScene;
