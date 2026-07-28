import React from 'react';
const icon=(name)=>({size=24,...props})=>React.createElement('span',{...props,'aria-hidden':'true',style:{display:'inline-flex',width:size,height:size,alignItems:'center',justifyContent:'center',fontSize:Math.max(14,size*.75),...(props.style||{})}},name);
export const ArrowRight=icon('→'), CalendarCheck=icon('✓'), ChevronRight=icon('›'), Clock3=icon('◷'), Mail=icon('✉'), MapPin=icon('⌖'), Menu=icon('☰'), MessageCircle=icon('◉'), Phone=icon('☎'), ShieldCheck=icon('✓'), Sparkles=icon('✦'), Star=icon('★'), X=icon('×'), ZoomIn=icon('⌕');
