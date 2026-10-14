package com.study.web.controller.service;

import com.study.web.controller.domin.Comment;

import java.util.List;

public interface ICommentService {
    List<Comment> selectCommentList(Comment comment);

    int insertComment(Comment comment);

    int deleteCommentById(Long id);
}

