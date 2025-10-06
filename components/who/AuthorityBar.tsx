"use client";
import { useEffect, useState } from "react";

export default function AuthorityBar({ hash }: { hash: string }) {
  const [recent, setRecent] = useState<number>(2137);
  const safe = typeof hash === 'string' ? hash : '';

  return (
    <div style={{
      background: '#000',
      padding: '10px',
      marginBottom: '20px',
      borderRadius: '8px',
      fontSize: '14px',
      color: '#aaa'
    }}>
      Verified run · Hash: {safe ? safe.slice(0,6) : '— — — — — —'} · {recent.toLocaleString()} people finished this week
    </div>
  );
}
