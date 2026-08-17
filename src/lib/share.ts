import type { DiagnosisResult } from "@/types/diagnosis";

/**
 * 결과 페이지 공유용 인코딩.
 *
 * 진단 결과 전체를 URL 해시(#r=...)에 담아 서버 저장 없이 공유한다.
 * 받는 사람은 링크만 열면 동일한 결과가 그대로 렌더링된다(재분석 없음 → 결과 불변·비용 0).
 * 가능하면 gzip 으로 압축해 URL 길이를 줄이고, 미지원 브라우저는 무압축으로 폴백한다.
 */
export type SharePayload = { result: DiagnosisResult; memberName?: string };

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function pipe(bytes: Uint8Array, transform: "gzip" | "gunzip"): Promise<Uint8Array> {
  const stream =
    transform === "gzip"
      ? new CompressionStream("gzip")
      : new DecompressionStream("gzip");
  const res = new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(stream));
  return new Uint8Array(await res.arrayBuffer());
}

/** 결과를 공유 코드 문자열로 인코딩 (첫 글자 1=gzip, 0=무압축). */
export async function encodeShare(payload: SharePayload): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  if (typeof CompressionStream !== "undefined") {
    try {
      const gz = await pipe(bytes, "gzip");
      return "1" + bytesToBase64Url(gz);
    } catch {
      /* 폴백 */
    }
  }
  return "0" + bytesToBase64Url(bytes);
}

/** 공유 코드 문자열을 결과로 디코딩. */
export async function decodeShare(code: string): Promise<SharePayload> {
  const flag = code[0];
  let bytes = base64UrlToBytes(code.slice(1));
  if (flag === "1") bytes = await pipe(bytes, "gunzip");
  return JSON.parse(new TextDecoder().decode(bytes)) as SharePayload;
}
