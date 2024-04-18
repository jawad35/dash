const authMiddleware = require('../middlewares/authMiddleware');
const User = require('../models/user');
const AppError = require('../util/appError');
const router = require('express').Router();

router.post('/',authMiddleware, async (req, res, next) => {
  const metadata = {issuer:req?.user?._id}
  const user = await User.findOne(
    { _id: metadata.issuer },
  );
  const updatedFiles = user?.files;
  if (metadata.issuer === '') {
    return res.status(500).json({ error: 'User is not authenticated' });
  }
  // console.log(req.files.files);
  let { files } = req.files;
  // if files is not an array, make it an array
  if (!Array.isArray(files)) {
    files = [files];
  }
  try {
    const uploadList = [];
    // iterate req.files and move it to test folder
    for (const file of files) {
      // const file = files[i];
      const upData = {
        file_name: file.name,
        public: false,
        file_creationDate: new Date().toISOString(),
        file_size: file.size
      };
      updatedFiles.push(upData);
      let fileName = file.name.normalize('NFD').replace(/\p{Diacritic}/gu, '');
      if (file.name !== fileName) {
        fileName = Buffer.from(file.name, 'latin1').toString('utf8');
      }
      const filePath = `./uploads/${fileName}`;

      file.mv(filePath, async (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: err.message });
        }
      });
    }
    await User.updateOne(
      { _id: metadata.issuer },
      { $set: { files: updatedFiles } }
    );
    return res
    .status(200)
    .json({ message: 'Files uploaded successfully', uploadList });
  } catch (error) {
    // return res.status(500).json({ error: error.message, message: "Couldn't upload your files at this moment" });
    return next(new AppError("Couldn't upload your files at this moment", 500));
  }
});

module.exports = router;
