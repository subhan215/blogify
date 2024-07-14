const { Router} = require("express");
const multer = require("multer");
const path = require("path");

const { postBookmarkHandler, getBookmarkHandler, delBookmarkHandler, likeBookmarkHandler, delUserHandler, postCommentHandler, getUpdateBlogHandler, postUpdateBlogHandler, getAddNewBlogHandler, getBlogHandler, postNewCommentHandler, delCommentHandler, postUpdateCommentHandler, postBlogHandler } = require("../controllers/blog");
const router = Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});
const upload = multer({ storage: storage });
router.post("/:userId/bookmarkBlog/:blogId", postBookmarkHandler);
router.get("/:userId/bookmarks", getBookmarkHandler);
router.get("/:userId/bookmarkDel/:blogId", delBookmarkHandler);
router.post("/:blogId/like", likeBookmarkHandler);
router.get("/:id/delete" , delUserHandler);
router.post("/:blogId/comment/:commentId/like", postCommentHandler);
router.get("/:id/updateBlog", getUpdateBlogHandler);
/// blog like ///
router.post("/:id/updateBlog", postUpdateBlogHandler);
router.get("/add-new", getAddNewBlogHandler);
router.get("/:id/:userId", getBlogHandler);

router.post("/comment/:blogId", postNewCommentHandler);
//delete comment ///
router.get("/comment/:id/delete/:userId", delCommentHandler);
router.post("/:blogId/comment/:commentId/update", postUpdateCommentHandler);

router.post("/", upload.single("coverImage"), postBlogHandler);

module.exports = router;
