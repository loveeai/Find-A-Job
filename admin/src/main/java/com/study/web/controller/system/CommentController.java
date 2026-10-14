package com.study.web.controller.system;

import com.study.common.response.ResponseResult;
import com.study.common.utils.JwtUtil;
import com.study.web.controller.BaseController;
import com.study.web.controller.domin.Comment;
import com.study.web.controller.domin.SysUser;
import com.study.web.controller.service.ICommentService;
import com.study.web.controller.service.SysUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.List;

@RestController
public class CommentController extends BaseController {

    @Autowired
    private ICommentService commentService;

    @Autowired
    private SysUserService sysUserService;

    @GetMapping("/comment")
    public ResponseResult selectCommentList(Comment comment) {
        startPage();
        List<Comment> data = commentService.selectCommentList(comment);
        return getResult(data);
    }

    @PostMapping("/comment")
    public ResponseResult insertComment(@RequestBody Comment comment, HttpServletRequest request) {
        String content = comment.getContent();
        if (content == null || content.trim().isEmpty()) {
            return ResponseResult.error("评论内容不能为空");
        }
        if (comment.getJobId() == null) {
            return ResponseResult.error("缺少职位ID");
        }

        String token = request.getHeader("token");
        if (token == null || token.isEmpty()) {
            token = request.getHeader("Token");
        }
        if (token == null || token.isEmpty()) {
            return ResponseResult.error("请先登录");
        }

        String username = JwtUtil.getUsername(token);
        if (username == null || username.isEmpty()) {
            return ResponseResult.error("登录状态失效");
        }
        SysUser user = sysUserService.findByName(username);
        if (user == null) {
            return ResponseResult.error("用户不存在");
        }
        if (user.getRoleId() != null && user.getRoleId() == 2L) {
            return ResponseResult.error("企业用户无法评论");
        }

        Comment newComment = new Comment();
        newComment.setUserId(user.getUserId());
        newComment.setJobId(comment.getJobId());
        newComment.setContent(content.trim());
        newComment.setTimes(new Date());
        return getResult(commentService.insertComment(newComment));
    }

    @DeleteMapping("/comment/{id}")
    public ResponseResult deleteCommentById(@PathVariable Long id, HttpServletRequest request) {
        String token = request.getHeader("token");
        if (token == null || token.isEmpty()) {
            token = request.getHeader("Token");
        }
        if (token == null || token.isEmpty()) {
            return ResponseResult.error("请先登录");
        }

        String username = JwtUtil.getUsername(token);
        if (username == null || username.isEmpty()) {
            return ResponseResult.error("登录状态失效");
        }
        SysUser user = sysUserService.findByName(username);
        if (user == null) {
            return ResponseResult.error("用户不存在");
        }
        if (user.getRoleId() == null || user.getRoleId() != 1L) {
            return ResponseResult.error("无权限删除评论");
        }

        return getResult(commentService.deleteCommentById(id));
    }
}

