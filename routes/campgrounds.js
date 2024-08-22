const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware');

const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({storage});


const { index,
        renderNewForm,
        createCampground,
        showCampground,
        renderEditForm,
        updateCampground,
        deleteCampground
    } = require('../controllers/campgrounds');

router.route('/')
    .get(catchAsync(index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(createCampground));
    
router.route('/new')
    .get(isLoggedIn,catchAsync(renderNewForm));


router.route('/:id')
    .get(catchAsync(showCampground))
    .put(isLoggedIn,isAuthor, upload.array('image'), validateCampground, catchAsync(updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(deleteCampground));


router.route('/:id/edit')
    .get(isLoggedIn, isAuthor, catchAsync(renderEditForm));

module.exports = router;