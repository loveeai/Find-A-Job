package com.study.web.controller.service.impl;

import com.study.web.controller.domin.Comment;
import com.study.web.controller.mapper.CommentMapper;
import com.study.web.controller.service.ICommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("commentService")
public class CommentServiceImpl implements ICommentService {

    @Autowired
    private CommentMapper commentMapper;

    @Override
    public List<Comment> selectCommentList(Comment comment) {
        return commentMapper.selectCommentList(comment);
    }

    @Override
    public int insertComment(Comment comment) {
        return commentMapper.insertComment(comment);
    }

    @Override
    public int deleteCommentById(Long id) {
        return commentMapper.deleteCommentById(id);
    }
}

