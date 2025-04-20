const express = require("express");
const {
  createSupportTeam,
  deleteSupportUserById,
  getSupportUserById,
  getSupportUsers,
  updateSupportUser,
} = require("../controllers/supportTeamController");

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
  createSupportTeam
);

router.route("/").get(verifyJWT, getSupportUsers);
router.route("/:id").get(verifyJWT, getSupportUserById);

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
  updateSupportUser
);

router.route("/:id").delete(verifyJWT, deleteSupportUserById);

module.exports = router;
