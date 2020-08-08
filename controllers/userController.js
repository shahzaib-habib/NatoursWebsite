const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');


// we could also choose to store the file in memory as a buffer so that we could then
// use it later by other process, and we will do that a bit later. but for now we will
// store the file in our file system.
// const multerStorage = multer.diskStorage({
//     // cb - callback function, bit like next() in express.
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         // user-user_id-current_timestamp.file_extension
//         // this we can gurantee there would be not two iamges with the same file name
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });

// this way image will be stored in buffer
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    // check if the uploaded file is an image
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
}

// that is the folder where we want to save all the images
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});
exports.uploadUserPhoto = upload.single('photo');


exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({quality: 90}).toFile(`public/img/users/${req.file.filename}`);
    next();
});


const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};


// It is a good practice to implement a "/me" endpoint in any API, basically an endpoint where 
// a user can retrieve his own data. so that would be very similar to "/updateMe" "/deleteMe"
// endpoints that we already have
// we still want to use "getOne" factory function otherwise it would be very very similar code
// only problem with this is that "getOne" basically uses the id coming from the parameter in
// order to get the requested document but what we want to do now is to basically get the 
// document based on the current user id, so the id comming from the currently logged in user
// so in that way we dont need to pass in an "id" as a URL parameter.

// how we will do that? all we do here is a very simple middleware.
// we will then add this middleware before calling "getOne"
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};


exports.updateMe = catchAsync(async (req, res, next) => {
    // console.log(req.file);
    // console.log(req.body);
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route is not for password updates. Please use /updateMyPassword.',
                400
            )
        );
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');
    if (req.file) filteredBody.photo = req.file.filename;

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});


exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});


exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined! Please us /signup instead'
    });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);



/*

getAllUsers
getUser
createUser
updateUser
deleteUser

These are for admin
*/



// exports.getAllUsers = catchAsync(async (req, res, next) => {
//     const users = await User.find();

//     // SEND RESPONSE
//     res.status(200).json({
//         status: 'success',
//         results: users.length,
//         data: {
//         users
//         }
//     });
// });


// exports.getUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined!'
//     });
// };


// exports.updateUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined!'
//     });
// };