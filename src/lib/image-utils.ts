import * as db from '@/lib/db';

export const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxSize = 800;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
        resolve(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const uploadImageToStorage = async (
  file: File,
  supabaseConnected: boolean,
  userId?: string
): Promise<string> => {
  const client = db.getSupabaseClient();
  if (client && supabaseConnected) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${userId || 'anonymous'}/${fileName}`;

      const { error } = await client.storage
        .from('receipts')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        if (error.message.includes('Bucket not found') || error.message.includes('does not exist')) {
          await client.storage.createBucket('receipts', { public: true });
          const { error: retryError } = await client.storage
            .from('receipts')
            .upload(filePath, file);
          if (retryError) throw retryError;
        } else {
          throw error;
        }
      }

      const { data: { publicUrl } } = client.storage
        .from('receipts')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.warn('Supabase storage upload failed, falling back to local compression', err);
    }
  }

  return compressImage(file);
};
