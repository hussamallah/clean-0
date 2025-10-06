export function IdentityModeCard({ identity, mode }:{
  identity: { pid:number; code:string; buckets:{O:string;C:string;E:string;A:string;S:string}; label:string };
  mode: { code:string; bits:string; label:string; axis_route:('O'|'C'|'E'|'A'|'S')[] };
}){
  return (
    <div className="rounded-2xl p-5 shadow">
      <h3 className="text-xl font-semibold">Identity</h3>
      <div className="mt-1 text-sm opacity-80">{identity.label}</div>
      <div className="mt-2 text-xs font-mono">code: {identity.code} · pid: {identity.pid}</div>
      <div className="mt-3 grid grid-cols-5 gap-2 text-center text-xs">
        {(['O','C','E','A','S'] as const).map(k=> (
          <div key={k} className="rounded bg-neutral-100 p-2">
            <div className="font-mono">{k}</div>
            <div>{(identity.buckets as any)[k]}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-3">
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs border">{mode.label}</span>
        <span className="text-xs font-mono opacity-70">{mode.code} · {mode.bits}</span>
        <span className="text-xs opacity-70">route: {mode.axis_route.join(' → ')}</span>
      </div>
    </div>
  );
}
