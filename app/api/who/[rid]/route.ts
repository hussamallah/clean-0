import { NextResponse } from "next/server";
import { getRun } from "@/lib/services/runsStore";
import { buildWhoFromFullResults } from "@/lib/bigfive/who";
import { buildHandoff } from "@/lib/bigfive/handoff";

export async function GET(_: Request, { params }: { params: { rid: string } }){
  const rid = params.rid;
  const data = await getRun(rid);
  if (!data) return NextResponse.json({ error: "not-found" }, { status: 404 });
  const who = await buildWhoFromFullResults(data as any, rid);
  const handoff = await buildHandoff(data as any, rid);
  return NextResponse.json({ rid, results: data, who, handoff });
}
