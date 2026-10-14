package com.study.web.controller.system;

import com.study.common.response.ResponseResult;
import com.study.common.utils.JwtUtil;
import com.study.web.controller.BaseController;
import com.study.web.controller.domin.UserCollectJob;
import com.study.web.controller.domin.SysUser;
import com.study.web.controller.service.IUserCollectJobService;
import com.study.web.controller.service.SysUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
public class UserCollectJobController extends BaseController {

    @Autowired
    private IUserCollectJobService userCollectJobService;
    
    @Autowired
    private SysUserService sysUserService;

    @GetMapping("/userCollectJob")
    public ResponseResult selectUserCollectJobList(UserCollectJob userCollectJob, HttpServletRequest request) {
        // 从请求头获取token
        String token = request.getHeader("token");
        // 从token获取用户名
        String username = JwtUtil.getUsername(token);
        // 根据用户名查询用户信息
        SysUser user = sysUserService.findByName(username);
        // 设置user_id，确保只查询当前用户的收藏
        userCollectJob.setUserId(user.getUserId());
        startPage();
        List<UserCollectJob> data = userCollectJobService.selectUserCollectJobList(userCollectJob);
        return getResult(data);
    }

    @GetMapping("/userCollectJob/{id}")
    public ResponseResult selectUserCollectJobById(@PathVariable Long id) {
        UserCollectJob userCollectJob = userCollectJobService.selectUserCollectJobById(id);
        return getResult(userCollectJob);
    }

    @PostMapping("/userCollectJob")
    public ResponseResult insertUserCollectJob(@RequestBody UserCollectJob userCollectJob, HttpServletRequest request) {
        // 从请求头获取token
        String token = request.getHeader("token");
        // 从token获取用户名
        String username = JwtUtil.getUsername(token);
        // 根据用户名查询用户信息
        SysUser user = sysUserService.findByName(username);
        // 设置user_id
        userCollectJob.setUserId(user.getUserId());
        return getResult(userCollectJobService.insertUserCollectJob(userCollectJob));
    }

    @PutMapping("/userCollectJob")
    public ResponseResult updateUserCollectJob(@RequestBody UserCollectJob userCollectJob) {
        return getResult(userCollectJobService.updateUserCollectJob(userCollectJob));
    }

    @DeleteMapping("/userCollectJob/{id}")
    public ResponseResult deleteUserCollectJobById(@PathVariable Long id) {
        return getResult(userCollectJobService.deleteUserCollectJobById(id));
    }

    @DeleteMapping("/userCollectJob/ids/{ids}")
    public ResponseResult deleteUserCollectJobByIds(@PathVariable String[] ids) {
        return getResult(userCollectJobService.deleteUserCollectJobByIds(ids));
    }
}