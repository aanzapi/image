const supabaseService = require('../services/supabase.service');

class ImageController {
  async serveImage(req, res) {
    try {
      const { filename } = req.params;
      
      // Get image metadata from database
      const metadata = await supabaseService.getImageByFilename(filename);
      
      if (!metadata) {
        return res.status(404).render('error', {
          title: 'Image Not Found',
          error: 'The requested image does not exist.'
        });
      }

      // Get image from storage
      const imageData = await supabaseService.getFile(filename);

      // Set appropriate headers
      res.set('Content-Type', metadata.mime_type);
      res.set('Cache-Control', 'public, max-age=31536000');
      res.set('Content-Disposition', `inline; filename="${metadata.original_name}"`);

      // Send image
      res.send(imageData);
    } catch (error) {
      console.error('Serve image error:', error);
      res.status(404).render('error', {
        title: 'Image Not Found',
        error: 'The requested image could not be loaded.'
      });
    }
  }

  async renderLandingPage(req, res) {
    try {
      // Get some recent images for the landing page
      const images = await supabaseService.getAllImages();
      const recentImages = images.slice(0, 12);

      res.render('index', {
        title: 'Image Hosting',
        images: recentImages,
        totalImages: images.length,
        baseUrl: process.env.BASE_URL || 'http://localhost:3000'
      });
    } catch (error) {
      console.error('Landing page error:', error);
      res.render('index', {
        title: 'Image Hosting',
        images: [],
        totalImages: 0,
        baseUrl: process.env.BASE_URL || 'http://localhost:3000'
      });
    }
  }
}

module.exports = new ImageController();