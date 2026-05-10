'use server';

// 이미지 업로드 Server Action — Supabase Storage 'images' 버킷 사용.
// 인증된 작성자만 허용. 글 작성 중 textarea 에 드래그/페이스트 시 호출.

import { createSupabaseServer } from '@/lib/supabase/server';

export interface UploadResult {
  ok: boolean;
  error?: string;
  publicUrl?: string;
  storagePath?: string;
}

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

export async function uploadImage(formData: FormData): Promise<UploadResult> {
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { ok: false, error: '파일이 없습니다.' };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: `파일이 너무 큽니다 (${(MAX_BYTES / 1024 / 1024).toFixed(0)}MB 제한)` };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false, error: `지원하지 않는 파일 형식: ${file.type}` };
  }

  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: '인증이 필요합니다.' };

  // 경로: {user_id}/{yyyy}/{mm}/{timestamp}-{slug}.ext
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const safeName = file.name
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'image';
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const ts = now.getTime();
  const storagePath = `${user.id}/${yyyy}/${mm}/${ts}-${safeName}.${ext}`;

  const { error } = await supabase.storage
    .from('images')
    .upload(storagePath, file, {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: false,
    });

  if (error) return { ok: false, error: error.message };

  const { data } = supabase.storage.from('images').getPublicUrl(storagePath);
  return { ok: true, publicUrl: data.publicUrl, storagePath };
}
