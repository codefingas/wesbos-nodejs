const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    console.log("File selected:", file);
    if(isPhoto) {
      next(null, true);
    } else {
      next({ message: 'The filetype is not allowed!' }, false);
    }
  }
};

exports.homePage = (req, res) => {
    res.render('index');
};

exports.addStore = (req, res) => {
    res.render('editStore', { title: 'Add store' });
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  console.log('photo saved', req.file);
  if(!req.file) {
    next(); // skip to the next middleware
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  // now resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  console.log('photo saved', req.body.photo);
  // once photo is saved, keep going
  next();
};

exports.createStore = async(req, res) => {
    const store = await (new Store(req.body)).save();
    req.flash('success', `Successfully created ${store.name}. Care to leave a review?`)
    res.redirect(`/store/${store.slug}`);
};

exports.getStores = async(req, res) => {
    // Query the database for all stores
    const stores = await Store.find();
    res.render('stores', {title: 'Stores', stores: stores});
}

exports.editStore = async(req,res) => {
  // 1. FInd the store given the ID
  const store = await Store.findOne({_id: req.params.id});
  // 2. confirm they are the owner of the store
  // TODO this step
  // 3. Render out the edit form so user can update it
  res.render('editStore', {title: `Edit ${store.name}`, store: store});
  //res.json(store);
};

exports.updateStore = async(req, res) => {
  // set the location data to be a point
  req.body.location.type = 'Point';
  // find and udpate the store
  console.log(req.body);
  const store = await Store.findOneAndUpdate({_id: req.params.id}, req.body, {
      new: true,
      runValidators: true
    }).exec();
  req.flash('Success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store</a>`)
  res.redirect(`/stores/${store._id}/edit`);
  // redirect them to store
};
