'use client';
import { useState } from 'react';

export function AxisModeScreen({ onDone }:{ onDone:(sw:{plan:boolean;accountable:boolean;runway:boolean})=>void }){
  const [plan, setPlan] = useState(false);
  const [accountable, setAccountable] = useState(false);
  const [runway, setRunway] = useState(false);
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h2 className="text-2xl font-semibold">Execution Mode</h2>
      <p className="text-sm opacity-80">Three quick toggles. They don’t change who you are. They decide how you’ll execute today.</p>
      <label className="flex items-start gap-3">
        <input type="checkbox" checked={plan} onChange={e=>setPlan(e.target.checked)} />
        <div><b>Plan locked?</b><div className="text-sm opacity-80">Exact time + place written.</div></div>
      </label>
      <label className="flex items-start gap-3">
        <input type="checkbox" checked={accountable} onChange={e=>setAccountable(e.target.checked)} />
        <div><b>Accountable today?</b><div className="text-sm opacity-80">A named person will see completion.</div></div>
      </label>
      <label className="flex items-start gap-3">
        <input type="checkbox" checked={runway} onChange={e=>setRunway(e.target.checked)} />
        <div><b>Runway clear?</b><div className="text-sm opacity-80">First step &lt; 2 minutes. Materials ready.</div></div>
      </label>
      <button className="btn btn-primary" onClick={()=> onDone({ plan, accountable, runway })}>Continue</button>
    </div>
  );
}
