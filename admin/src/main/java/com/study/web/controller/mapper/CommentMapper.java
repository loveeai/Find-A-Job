package com.study.web.controller.mapper;

import com.study.web.controller.domin.Comment;

import java.util.List;

public interface CommentMapper {
    List<Comment> selectCommentList(Comment comment);

    int insertComment(Comment comment);

    int deleteCommentById(Long id);
}

