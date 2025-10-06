import { computeIdentity, computeAxisMode, stableStringify } from '@/lib/gz3switch/identity';
import { sha256Hex } from '@/lib/crypto/sha256hex';

export async function buildGZResult(dom: {O:number;C:number;E:number;A:number;N:number}, sw:{plan:boolean;accountable:boolean;runway:boolean}){
  const identity = computeIdentity(dom);
  const mode = computeAxisMode(sw);
  const out = { version: 'gz-identity-axismode.v1.2', inputs: { ...dom, ...sw }, identity, mode } as const;
  const hash = await sha256Hex(stableStringify(out));
  return { ...out, hash };
}
