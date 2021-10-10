const post = require("../../models/post");

const postController = {
  readAll: async function (req, res) {
    try {
      // writer의 oid 정보와 연결된 collection인 user로부터 원하는 column인 name과 userId 정보를 받아옴
      const result = await post.find().populate("writer", "nickName");
      if (!result) {
        return res.status(400).json({
          message: "게시물 조회 실패",
        });
      } else {
        res.status(200).json({
          message: "게시물 조회 성공",
          data: result,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "DB 서버 에러",
        error: error,
      });
    }
  },
  readExactPost: async function (req, res) {
    const { id } = req.params;
    try {
      const result = await post.findById(id).populate("writer", "nickName");
      res.status(200).json({
        message: "조회 성공",
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        message: "조회 실패",
        error: error,
      });
    }
  },
  createPost: function (req, res) {
    const userInfo = req.userInfo;
    const { title, content, tags, category } = req.body;

    const boardModel = new post({
      title,
      content,
      category,
      tags,
      publishDate: new Date(),
      writer: userInfo._id,
    });

    boardModel
      .save()
      .then((savedPost) => {
        console.log(savedPost);
        res.status(200).json({
          message: "게시물 생성 성공",
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: "DB 서버 에러",
        });
      });
  },
  updatePost: async function (req, res) {
    const userInfo = req.userInfo;
    const { id } = req.params; //게시물의 id를 parameter로 받음

    //글쓴이=삭제요청자 인 경우에만 수정 허용
    const isSameWriter = await post.checkWriter({
      postId: id,
      writerId: userInfo._id,
    });

    if (isSameWriter === -1) {
      return res.status(409).json({ message: "접근 권한이 없습니다." });
    } else if (isSameWriter === -2) {
      return res.status(500).json({ message: "DB 서버 에러" });
    } else {
      try {
        const { title, content, tags, category } = req.body;
        const updated = await post.findByIdAndUpdate(
          id,
          {
            title,
            content,
            tags,
            category,
            updateDate: new Date(),
          },
          { new: true }
        );
        res.status(200).json({
          message: "게시물 수정 완료",
          data: updated,
        });
      } catch (error) {
        res.status(500).json({
          message: "게시물 수정 실패",
          error: error,
        });
        console.log(error);
      }
    }
  },
  deletePost: async function (req, res) {
    const userInfo = req.userInfo;
    const { id } = req.params; //게시물의 id를 parameter로 받음

    //글쓴이=삭제요청자 인 경우에만 삭제
    const isSameWriter = await post.checkWriter({
      postId: id,
      writerId: userInfo._id,
    });

    if (isSameWriter === -1) {
      return res.status(409).json({ message: "접근 권한이 없습니다." });
    } else if (isSameWriter === -2) {
      return res.status(500).json({ message: "DB 서버 에러" });
    } else {
      try {
        await post.findByIdAndDelete(id);
        res.status(200).json({
          message: "게시물 삭제 완료",
        });
      } catch (error) {
        res.status(500).json({
          message: "게시물 삭제 실패",
          error: error,
        });
      }
    }
  },
};

module.exports = postController;