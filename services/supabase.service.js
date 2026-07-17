const supabase = require('../config/supabase');

class SupabaseService {
  constructor() {
    this.bucketName = 'images';
  }

  async uploadFile(file, filename) {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filename, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Upload service error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  async getFile(filename) {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .download(filename);

      if (error) {
        console.error('Download error:', error);
        throw new Error(`File not found: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Get file error:', error);
      throw new Error(`File not found: ${error.message}`);
    }
  }

  async deleteFile(filename) {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .remove([filename]);

      if (error) {
        console.error('Delete error:', error);
        throw new Error(`Delete failed: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Delete file error:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  async saveImageMetadata(metadata) {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await supabase
        .from('images')
        .insert([metadata])
        .select()
        .single();

      if (error) {
        console.error('Save metadata error:', error);
        throw new Error(`Save metadata failed: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Save metadata error:', error);
      throw new Error(`Save metadata failed: ${error.message}`);
    }
  }

  async getImageByFilename(filename) {
    try {
      if (!supabase) {
        return null;
      }

      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('filename', filename)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Get image error:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Get image by filename error:', error);
      return null;
    }
  }

  async getAllImages() {
    try {
      if (!supabase) {
        return [];
      }

      const { data, error } = await supabase
        .from('images')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Get all images error:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Get all images error:', error);
      return [];
    }
  }

  async deleteImageMetadata(id) {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { error } = await supabase
        .from('images')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete metadata error:', error);
        throw new Error(`Delete metadata failed: ${error.message}`);
      }
      
      return true;
    } catch (error) {
      console.error('Delete metadata error:', error);
      throw new Error(`Delete metadata failed: ${error.message}`);
    }
  }

  async getStats() {
    try {
      if (!supabase) {
        return {
          totalImages: 0,
          todayUploads: 0,
          totalStorage: 0,
          totalSize: 0
        };
      }

      const { data, error } = await supabase
        .from('images')
        .select('*');

      if (error) {
        console.error('Get stats error:', error);
        return {
          totalImages: 0,
          todayUploads: 0,
          totalStorage: 0,
          totalSize: 0
        };
      }

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
      console.error('Get stats error:', error);
      return {
        totalImages: 0,
        todayUploads: 0,
        totalStorage: 0,
        totalSize: 0
      };
    }
  }

  async searchImages(query) {
    try {
      if (!supabase) {
        return [];
      }

      const { data, error } = await supabase
        .from('images')
        .select('*')
        .ilike('original_name', `%${query}%`)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Search error:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }
}

module.exports = new SupabaseService();
