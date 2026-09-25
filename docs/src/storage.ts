export const storageKey = "nextstep-demo-applications";
type Application = {id:string;company:string;role:string;stage:string;interview:string;notes:string;created:string};
const stages=["Wishlist","Applied","Interview","Offer","Rejected","Withdrawn"];
function validDate(date:string) {return date==="" || (/^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date)) && new Date(date).toISOString().slice(0,10)===date);}
export function validate(value:unknown): asserts value is Application[] {
  if(!Array.isArray(value)) throw Error("Invalid saved applications");
  const ids=new Set();
  for(const a of value){
    if(!a || typeof a!=="object" || !["id","company","role","stage","interview","notes","created"].every(k=>typeof a[k]==="string") || !a.id || ids.has(a.id) || !a.company.trim() || !a.role.trim() || a.company.length>150 || a.role.length>180 || a.notes.length>5000 || !stages.includes(a.stage) || !validDate(a.interview) || isNaN(Date.parse(a.created))) throw Error("Invalid saved application");
    ids.add(a.id);
  }
}
export function readApplications():Application[] {
  let raw:string|null;
  try{raw=localStorage.getItem(storageKey);}catch{throw Error("Browser storage is blocked. Allow this site to store data, then try again.");}
  if(raw===null)return [];
  try{const items:unknown=JSON.parse(raw);validate(items);return items;}catch{throw Error("Saved application data could not be read. It has been left unchanged. Restore valid browser data before making changes.");}
}
export function writeApplications(items:Application[]) {
  validate(items);
  try{localStorage.setItem(storageKey,JSON.stringify(items));}catch{throw Error("Couldn’t save in this browser. Storage may be blocked or full. Your changes are still in the form; free some space or allow storage and try again.");}
}
