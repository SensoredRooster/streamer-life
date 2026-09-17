/* Streamer Life — market formulas */
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function impressions(s){return Math.floor(s.reach*s.niche_clarity*s.packaging*s.platform_blessing*(1-s.slop_penalty)*(1+(s.growth_mod||0)/100));}
function ctr(s,g=.02){return clamp(.02+s.thumb_skill*.08+s.title_skill*.05-g,.01,.22);}
function retention(s,t=0){return clamp(.18+s.entertainment*.25+s.game_skill*.1-t*.15,.08,.72);}
function followConv(s,r){return r*(s.trust/100)*.04*s.clip_to_live_quality;}
function chatDensity(s){return s.chatters/Math.max(window.SLState.getCcvDisplay(s),1);}
function takeHomeSub(price,split,processor=.029,tax=.24){return price*split*(1-processor)*(1-tax);}
function simulateLiveTick(s){const base=1+Math.floor(s.followers*.02*s.niche_clarity)+Math.floor(s.trust/40)+(s.packaging>.4?1:0);s.ccv_real=Math.max(0,Math.floor((base+Math.floor(Math.random()*3)-1)*(s.decision_quality<1?.7:1)));s.live_minutes+=5;s.energy=Math.max(0,s.energy-2);s.energy_spent+=2;s.burnout=Math.min(120,s.burnout+.4);s.watch_hours+=window.SLState.getCcvDisplay(s)*5/60;}
function endStream(s){s.live=false;if(s.energy_spent>40){s.crash_until=window.SLState.getMinuteStamp(s)+90;s.decision_quality=.65;}if(!s.streamed_today){s.unique_stream_days++;s.streamed_today=true;}s.live_minutes=0;s.ccv_real=0;s.chatters=0;s.energy_spent=0;}
window.SLFormulas={clamp,impressions,ctr,retention,followConv,chatDensity,takeHomeSub,simulateLiveTick,endStream};
