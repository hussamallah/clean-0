import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/server/supabase';

export async function GET() {
  const supa = getSupabaseAdmin();
  
  if (!supa) {
    return NextResponse.json({
      success: false,
      error: 'Supabase client not initialized',
      env: {
        hasUrl: !!process.env.SUPABASE_URL,
        hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        url: process.env.SUPABASE_URL ? `${process.env.SUPABASE_URL.slice(0, 30)}...` : 'NOT SET'
      }
    });
  }

  try {
    // Try to count rows in gz_runs table
    const { data, error, count } = await supa
      .from('gz_runs')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection working!',
      rowCount: count,
      env: {
        hasUrl: true,
        hasKey: true
      }
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || 'Unknown error',
      stack: err.stack
    });
  }
}

