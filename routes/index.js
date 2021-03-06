var express = require('express');
var router = express.Router();
const models = require('../models');
const Sequelize = require('sequelize');
const multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/files')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
var upload = multer({ storage: storage });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'InstagramLike' });
});

router.get('/upload', function(req, res, next) {
  res.render('upload', { title: 'InstramLike - Upload a new Image'});
});

router.post('/uploadHandler', upload.single('file'), function(req, res) {
  var opts = JSON.parse(req.body.opts);
  models.Images.create({
    filename: opts.fileName,
    uploader: opts.username,
    caption: opts.caption,
    hashtags: opts.hashtags
  }).then(function(resp) {
    res.status(200).send(resp);
  }).catch(function(resp) {
    res.status(500).send(resp);
  });
});

router.post('/search', function(req, res, next) {
  //if search query is empty, just get 10 newest images.
  var query = req.body.query;
  if(query === '') {
    models.Images.findAll({
      limit: 10,
      order: [['id', 'DESC']]
    }).then(function(resp) {
      res.status(200).send(resp);
    }).catch(function(resp) {
      res.status(500).send(resp);
    });
  } else if (query.startsWith('@')) {
    models.Images.findAll({
      order: [['id', 'DESC']],
      where: {
        uploader: query.slice(1)
      }
    }).then(function(resp) {
      res.status(200).send(resp);
    }).catch(function(resp) {
      res.status(500).send(resp);
    });
  } else if (query.startsWith('#')) {
    models.Images.findAll({
      order: [['id', 'DESC']],
      where: Sequelize.where(
          Sequelize.fn("INSTR", Sequelize.col('hashtags'), '\"' + query.slice(1) + '\"'),
          { $gt: 0 }
        )
    }).then(function(resp) {
      res.status(200).send(resp);
    }).catch(function(resp) {
      res.status(500).send(resp);
    });
  } else {
    models.Images.findAll({
      order: [['id', 'DESC']],
      where: Sequelize.where(
          Sequelize.fn("INSTR", Sequelize.col("caption"), query),
          { $gt: 0 }
        )
    }).then(function(resp) {
      res.status(200).send(resp);
    }).catch(function(resp) {
      res.status(500).send(resp);
    });
  }
});

router.get('/comments/:id', function(req, res, next) {
  var id = req.params.id
  models.Comments.findAll({
    order: [['id', 'DESC']],
    where: {
      imageid: id
    }
  }).then(function(resp) {
    res.status(200).send(resp);
  }).catch(function(resp) {
    res.status(500).send(resp);
  });
});

router.post('/newComment', function(req, res, next) {
  models.Comments.create({
    uploader: req.body.uploader,
    comment: req.body.comment,
    imageid: req.body.imageid
  }).then(function(resp) {
    res.status(200).send(resp);
  }).catch(function(resp) {
    res.status(500).send(resp);
  });
});

module.exports = router;
