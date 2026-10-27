export const addressOK=x=>/^0x[\da-f]{40}$/i.test(x)&&!/^0x0{40}$/.test(x);
export function tally(r){const n=r.eligible.length,v=Object.values(r.votes),yes=v.filter(x=>x==='YES').length,no=v.filter(x=>x==='NO').length,quorum=Math.ceil(2*n/3),required=Math.floor(n/2)+1,remaining=n-v.length,ready=n>=2&&v.length>=quorum&&(yes>=required||yes+remaining<required);return {n,yes,no,abstain:v.length-yes-no,quorum,required,remaining,ready,decision:ready?(yes>=required?'PASSED':'REJECTED'):'PENDING'};}
export function success(tx){const status=tx.status,result=tx.result,ls=tx.consensus_data?.leader_receipt,l=Array.isArray(ls)?ls.find(x=>x.mode==='leader')||ls[0]:ls;return (status==='FINALIZED'||status===7)&&(result==='MAJORITY_AGREE'||result===6)&&l?.execution_result==='SUCCESS';}
export function terminal(tx){return ['FINALIZED','CANCELED','UNDETERMINED'].includes(tx.status)||[6,7,8].includes(tx.status);}
export const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const short=s=>s?s.slice(0,7)+'…'+s.slice(-5):'—';
export const json=x=>JSON.stringify(x,(_,v)=>typeof v==='bigint'?v.toString():v,2);
