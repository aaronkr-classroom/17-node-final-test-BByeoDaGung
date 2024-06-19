// controllers/discussionsController.js
"use strict";

const Discussion = require("../models/Discussion"),
  getDiscussionParams = (body, user) => {
    return {
      title: body.title,
      description: body.description,
      author: user,
      category: body.category,
      tags: body.tags,
    };
  };

module.exports = {
  /**
   * =====================================================================
   * C: CREATE / 생성
   * =====================================================================
   */
  new: (req, res) => {
    res.render("discussions/new", {
      page: "discussion-user",
      title: "New Discussion",
    });
  },

  create: (req, res, next) => {
    let discussionParams = getDiscussionParams(req.body, req.user);
    Discussion.create(discussionParams)
      .then((discussion) => {
        req.flash("success", `${discussion.title} created successfully!`);
        res.locals.redirect = "/discussions";
        res.locals.discussion = discussion;
        next();
      })
      .catch((error) => {
        console.log(`Error saving discussion: ${error.message}`);
        req.flash("error", `Failed to create discussion because: ${error.message}.`);
        res.locals.redirect = "/discussions/new";
        next();
      });
  },

  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },

  /**
   * =====================================================================
   * R: READ / 조회
   * =====================================================================
   */
  index: (req, res, next) => {
    Discussion.find()
      .then((discussions) => {
        res.locals.discussions = discussions;
        next();
      })
      .catch((error) => {
        console.log(`Error fetching discussions: ${error.message}`);
        next(error);
      });
  },

  indexView: (req, res) => {
    res.render("discussions/index", {
      page: "discussions",
      title: "All Discussions",
    });
  },

  show: (req, res, next) => {
    let discussionId = req.params.id;
    Discussion.findById(discussionId)
      .populate({
        path: 'comments',
        populate: { path: 'author' }
      })
      .exec()
      .then((discussion) => {
        res.locals.discussion = discussion;
        next();
      })
      .catch((error) => {
        console.log(`Error fetching discussion by ID: ${error.message}`);
        next(error);
      });
  },

  showView: (req, res) => {
    res.render("discussions/show", {
      page: "discussion-details",
      title: "Discussion Details",
    });
  },

  /**
   * =====================================================================
   * U: UPDATE / 수정
   * =====================================================================
   */
  edit: (req, res, next) => {
    let discussionId = req.params.id;
    Discussion.findById(discussionId)
      .then((discussion) => {
        res.render("discussions/edit", {
          discussion: discussion,
          page: "edit-discussion",
          title: "Edit Discussion",
        });
      })
      .catch((error) => {
        console.log(`Error fetching discussion by ID: ${error.message}`);
        next(error);
      });
  },

  update: (req, res, next) => {
    let discussionId = req.params.id,
      discussionParams = getDiscussionParams(req.body, req.user);

    Discussion.findByIdAndUpdate(discussionId, {
      $set: discussionParams,
    })
      .then((discussion) => {
        res.locals.redirect = `/discussions/${discussionId}`;
        res.locals.discussion = discussion;
        next();
      })
      .catch((error) => {
        console.log(`Error updating discussion by ID: ${error.message}`);
        next(error);
      });
  },

  /**
   * =====================================================================
   * D: DELETE / 삭제
   * =====================================================================
   */
  delete: (req, res, next) => {
    let discussionId = req.params.id;
    Discussion.findByIdAndRemove(discussionId)
      .then(() => {
        res.locals.redirect = "/discussions";
        next();
      })
      .catch((error) => {
        console.log(`Error deleting discussion by ID: ${error.message}`);
        next();
      });
  },
};
