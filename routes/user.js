const router = require('express').Router();
const { Magic } = require('@magic-sdk/admin');
const authMiddleware = require('../middlewares/authMiddleware');
const AppError = require('../util/appError');
const User = require('../models/user');
const jwt = require('jsonwebtoken')

const magic = new Magic(process.env.MAGIC_SECRET_KEY);

router.post('/api/user/check', async (req, res, next) => {
  const { userName } = req.body;
  const user = await User.findOne({ user_name:userName });
    return res.status(200).json({
      message: user ? 'user_found' : 'user_not_found'
    });
});

router.post('/api/user/checkFiles', async (req, res, next) => {
  const {userName} = req.body
  const user = await User.findOne({ user_name:userName});
  if (!user) {
    return next(new AppError('user_not_found', 400));
  }
  const { files } = user;
  console.log(user)
  return res.status(200).json({ files, owner: user.user_name });
});

router.post('/api/user/files', authMiddleware, async (req, res, next) => {
 
  const { search, types, privateStatus, publicStatus, sortField, sortOrder } =
    req.body;

  // matching files based on the search text and file type
  const fileFilters = {
    'files.file_name': new RegExp(`.*${search}.*(${types.join('|')})$`, 'i')
  };

  // matching based on the file status (public or private)
  if (!privateStatus && publicStatus) fileFilters['files.public'] = true;
  else if (!publicStatus && privateStatus) fileFilters['files.public'] = false;
  const result = await User.aggregate([
    {
      $match: {
        user_name:req?.user?.user_name
      }
    },
    {
      $unwind: '$files'
    },
    {
      $match: fileFilters
    },
    {
      $sort: {
        [`files.${sortField}`]: sortOrder
      }
    },
    {
      $group: {
        _id: '$_id',
        files: {
          $push: '$files'
        },
        user_name: { $first: '$user_name' }
      }
    }
  ]);
  const user = result[0];
  if (!user) {
    return next(new AppError('user_not_found', 400));
  }
  const { files } = user;
  return res.status(200).json({ files, owner: user.user_name });
});

// router.patch(
//   '/api/user/makePublic/:cid',
//   authMiddleware,
//   async (req, res, next) => {
//     const metadata = await magic.users.getMetadataByToken(
//       req.headers.authorization.substring(7)
//     );
//     const magic_id = metadata.issuer;
//     const { cid } = req.params;
//     const { state } = req.body;
//     if (!magic_id || !cid) {
//       return next(new AppError('Missing required fields', 400));
//     }
//     try {
//       await User.updateOne(
//         { magic_id, files: { $elemMatch: { cid } } },
//         { $set: { 'files.$.public': state } }
//       );
//       return res
//         .status(200)
//         .json({ message: 'File visibility updated successfully!' });
//     } catch (err) {
//       // return res.status(500).json({ error: err.message, message: "File visibility update failed!" });
//       return next(new AppError('File visibility update failed!', 500));
//     }
//   }
// );

router.patch(
  '/api/user/deleteFile/:id',
  authMiddleware,
  async (req, res, next) => {
    console.log('Delete route called!');
    const user_id = req?.user?._id;
    const { id:_id } = req.params;
    if (!user_id || !_id) {
      return next(new AppError('Missing required fields', 400));
    }
    try {
      await User.updateOne(
        { _id:user_id, files: { $elemMatch: { _id } } },
        { $pull: { files: { _id } } }
      );
      return res.status(200).json({ message: 'File deleted successfully!' });
    } catch (err) {
      // return res.status(500).json({ error: err.message, message: "File deletion failed!" });
      return next(new AppError('File deletion failed!', 500));
    }
  }
);

router.get('/api/user/getName/:id', async (req, res, next) => {
  const magic_id = req.params.id;
  if (!magic_id) {
    return next(new AppError('Missing required fields', 400));
  }
  try {
    const user = await User.findOne({ magic_id }, { user_name: 1 });
    return res.status(200).json(user);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
});

module.exports = router;
