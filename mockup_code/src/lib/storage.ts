import { supabase } from './supabase';

export type UploadResult = { path: string; url: string };

async function uploadToBucket(
  bucket: string,
  folder: string,
  file: File,
  isPublic: boolean,
): Promise<UploadResult> {
  const ext = file.name.split('.').pop() ?? 'bin';
  const path = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  if (isPublic) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return { path, url: data.publicUrl };
  }
  const { data, error: signErr } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
  if (signErr) throw signErr;
  return { path, url: data.signedUrl };
}

export async function uploadAvatar(userId: string, file: File) {
  return uploadToBucket('avatars', userId, file, true);
}

export async function uploadBlogImage(orgId: string, file: File) {
  return uploadToBucket('blog-images', orgId, file, true);
}

export async function uploadOrgDocument(orgId: string, file: File) {
  return uploadToBucket('org-documents', orgId, file, false);
}

export async function uploadCertificate(volunteerId: string, file: File) {
  return uploadToBucket('certificates', volunteerId, file, false);
}

export function getPublicUrl(bucket: string, path: string): string {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function getSignedUrl(bucket: string, path: string, expiresIn = 3600) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}
