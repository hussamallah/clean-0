import Link from "next/link";
import { cookies } from "next/headers";

export default function Landing(){
  const rid = cookies().get("gz_last_rid")?.value;
  return (
    <main className="stack">
      <h1>Ground Zero</h1>
      <div className="row mt16">
        <Link className="btn" href="/full">Start full assessment</Link>
        {rid ? <Link className="btn" href={`/who?rid=${rid}`}>Open last result</Link> : null}
      </div>
    </main>
  );
}


