const supabaseService = require('../services/supabase.service');
const { generateFilename } = require('../middleware/upload.middleware');

class UploadController {
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      const file = req.file;
      const filename = generateFilename(file.originalname);
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

      // Upload to Supabase Storage
      await supabaseService.uploadFile(file, filename);

      // Save metadata
      const metadata = {
        filename: filename,
        original_name: file.originalname,
        storage_path: filename,
        public_url: `${baseUrl}/${filename}`,
        size: file.size,
        mime_type: file.mimetype
      };

      const savedImage = await supabaseService.saveImageMetadata(metadata);

      res.status(201).json({
        success: true,
        url: `${baseUrl}/${filename}`,
        data: savedImage
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Upload failed'
      });
    }
  }
}

module.exports = new UploadController();