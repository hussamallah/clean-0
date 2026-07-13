import { NextRequest, NextResponse } from 'next/server';
import { decodeAnswerCode } from '@/lib/answerCode';
import { ridFor } from '@/lib/runs/rid';
import { saveRun } from '@/lib/services/runsStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = String(body?.code || '').trim();
    const decoded = decodeAnswerCode(code);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid Answer Code' }, { status: 400 });
    }

    const rid = ridFor(decoded.results);
    try {
      await saveRun(rid, decoded.results as any);
    } catch {
      /* non-fatal if store unavailable */
    }

    const res = NextResponse.json({ rid });
    res.cookies.set('gz_last_rid', rid, { httpOnly: false, sameSite: 'lax', path: '/' });
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 });
  }
}
