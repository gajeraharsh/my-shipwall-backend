const express = require("express");
const {
  createRejectionTeam,
  deleteRejectionUserById,
  getRejectionUserById,
  getRejectionUsers,
  updateRejectionUser,
} = require("../controllers/rejectionTeamController");

const { verifyJWT } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload");

const router = express.Router();

router.route("/").post(
  verifyJWT,
  upload.fields([{ name: "profileImage", maxCount: 1 }]),
  (req, res, next) => {
    if (req.files) {
      if (req.files.profileImage) {
        req.body.profileImage = req.files.profileImage[0].originalname;
      }
    }
    next();
  },
  createRejectionTeam
);

router.route("/").get(verifyJWT, getRejectionUsers);
router.route("/:id").get(verifyJWT, getRejectionUserById);

router.route("/:userId").put(
  verifyJWT,
  upload.fields([{ name: "profileImage", maxCount: 1 }]),
  (req, res, next) => {
    if (req.files) {
      if (req.files.profileImage) {
        req.body.profileImage = req.files.profileImage[0].originalname;
      }
    }
    next();
  },
  updateRejectionUser
);

router.route("/:id").delete(verifyJWT, deleteRejectionUserById);

module.exports = router;
