const supabase = require('../config/supabase');

class SupabaseService {
  constructor() {
    this.bucketName = 'images';
  }

  async uploadFile(file, filename) {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filename, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600'
        });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  async getFile(filename) {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .download(filename);

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`File not found: ${error.message}`);
    }
  }

  async deleteFile(filename) {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .remove([filename]);

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  async saveImageMetadata(metadata) {
    try {
      const { data, error } = await supabase
        .from('images')
        .insert([metadata])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Save metadata failed: ${error.message}`);
    }
  }

  async getImageByFilename(filename) {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('filename', filename)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return null;
    }
  }

  async getAllImages() {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(`Get images failed: ${error.message}`);
    }
  }

  async deleteImageMetadata(id) {
    try {
      const { error } = await supabase
        .from('images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Delete metadata failed: ${error.message}`);
    }
  }

  async getStats() {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*');

      if (error) throw error;

      const total = data.length;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayUploads = data.filter(img => {
        const uploadDate = new Date(img.uploaded_at);
        uploadDate.setHours(0, 0, 0, 0);
        return uploadDate.getTime() === today.getTime();
      });

      const totalSize = data.reduce((acc, img) => acc + img.size, 0);

      return {
        totalImages: total,
        todayUploads: todayUploads.length,
        totalStorage: totalSize,
        totalSize: totalSize
      };
    } catch (error) {
      throw new Error(`Get stats failed: ${error.message}`);
    }
  }

  async searchImages(query) {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .ilike('original_name', `%${query}%`)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }
}

module.exports = new SupabaseService();