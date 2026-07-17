const supabaseService = require('../services/supabase.service');

class GalleryController {
  async renderGallery(req, res) {
    try {
      const { search } = req.query;
      let images = [];

      if (search) {
        images = await supabaseService.searchImages(search);
      } else {
        images = await supabaseService.getAllImages();
      }

      res.render('gallery', {
        title: 'Image Gallery',
        images: images,
        search: search || '',
        baseUrl: process.env.BASE_URL || 'http://localhost:3000'
      });
    } catch (error) {
      console.error('Gallery error:', error);
      res.render('gallery', {
        title: 'Image Gallery',
        images: [],
        search: '',
        baseUrl: process.env.BASE_URL || 'http://localhost:3000'
      });
    }
  }

  async renderImageDetail(req, res) {
    try {
      const { filename } = req.params;
      const image = await supabaseService.getImageByFilename(filename);

      if (!image) {
        return res.status(404).render('error', {
          title: 'Image Not Found',
          error: 'The requested image does not exist.'
        });
      }

      res.render('detail', {
        title: image.original_name,
        image: image,
        baseUrl: process.env.BASE_URL || 'http://localhost:3000'
      });
    } catch (error) {
      console.error('Image detail error:', error);
      res.status(404).render('error', {
        title: 'Image Not Found',
        error: 'The requested image could not be loaded.'
      });
    }
  }
}

module.exports = new GalleryController();