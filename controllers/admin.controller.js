const supabaseService = require('../services/supabase.service');

class AdminController {
  async renderDashboard(req, res) {
    try {
      const stats = await supabaseService.getStats();
      const images = await supabaseService.getAllImages();

      res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        stats: stats,
        images: images,
        baseUrl: process.env.BASE_URL || 'http://localhost:3000',
        formatSize: this.formatSize
      });
    } catch (error) {
      console.error('Admin dashboard error:', error);
      res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        stats: { totalImages: 0, todayUploads: 0, totalStorage: 0, totalSize: 0 },
        images: [],
        baseUrl: process.env.BASE_URL || 'http://localhost:3000',
        formatSize: this.formatSize
      });
    }
  }

  async deleteImage(req, res) {
    try {
      const { id } = req.params;
      const image = await supabaseService.getImageByFilename(id);

      if (!image) {
        return res.status(404).json({
          success: false,
          error: 'Image not found'
        });
      }

      // Delete from storage
      await supabaseService.deleteFile(image.filename);

      // Delete from database
      await supabaseService.deleteImageMetadata(image.id);

      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      console.error('Delete image error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Delete failed'
      });
    }
  }

  formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = new AdminController();