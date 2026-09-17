/* Streamer Life — boot */
function boot(){const s=window.SLState.STATE;window.SLState.pushLog(s,'Streamer Life online. Fame is a hostile market. Dual CCV armed.','teal');window.SLUI.renderNav();window.SLUI.route('ops');document.addEventListener('keydown',e=>{if(e.target.matches('input,textarea,select'))return;const i=e.key==='0'?9:parseInt(e.key,10)-1;if(i>=0&&i<window.SLUI.SCREENS.length)window.SLUI.route(window.SLUI.SCREENS[i].id);});}
document.addEventListener('DOMContentLoaded',boot);
