package com.study.web.controller.system;

import com.study.common.response.ResponseResult;
import com.study.common.utils.JwtUtil;
import com.study.web.controller.BaseController;
import com.study.web.controller.domin.Resume;
import com.study.web.controller.domin.SysUser;
import com.study.web.controller.service.IResumeService;
import com.study.web.controller.service.SysUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
public class ResumeController extends BaseController {

    @Autowired
    private IResumeService resumeService;
    
    @Autowired
    private SysUserService sysUserService;

    @GetMapping("/resume")
    public ResponseResult selectResumeList(Resume resume, HttpServletRequest request) {
        // 从请求头获取token
        String token = request.getHeader("token");
        // 从token获取用户名
        String username = JwtUtil.getUsername(token);
        // 根据用户名查询用户信息
        SysUser user = sysUserService.findByName(username);
        // 只有普通用户（roleId != 2）才设置user_id过滤，企业用户可以查看所有简历
        if (2L != user.getRoleId()) {
            resume.setUserId(user.getUserId());
        }
        startPage();
        List<Resume> data = resumeService.selectResumeList(resume);
        return getResult(data);
    }

    @GetMapping("/resume/{id}")
    public ResponseResult selectResumeById(@PathVariable Long id) {
        Resume resume = resumeService.selectResumeById(id);
        return getResult(resume);
    }

    @PostMapping("/resume")
    public ResponseResult insertResume(@RequestBody Resume resume, HttpServletRequest request) {
        // 从请求头获取token
        String token = request.getHeader("token");
        // 从token获取用户名
        String username = JwtUtil.getUsername(token);
        // 根据用户名查询用户信息
        SysUser user = sysUserService.findByName(username);
        // 设置user_id
        resume.setUserId(user.getUserId());
        return getResult(resumeService.insertResume(resume));
    }

    @PutMapping("/resume")
    public ResponseResult updateResume(@RequestBody Resume resume, HttpServletRequest request) {
        // 从请求头获取token
        String token = request.getHeader("token");
        // 从token获取用户名
        String username = JwtUtil.getUsername(token);
        // 根据用户名查询用户信息
        SysUser user = sysUserService.findByName(username);
        // 设置user_id
        resume.setUserId(user.getUserId());
        return getResult(resumeService.updateResume(resume));
    }

    @DeleteMapping("/resume/{id}")
    public ResponseResult deleteResumeById(@PathVariable Long id) {
        return getResult(resumeService.deleteResumeById(id));
    }

    @DeleteMapping("/resume/ids/{ids}")
    public ResponseResult deleteResumeByIds(@PathVariable String[] ids) {
        return getResult(resumeService.deleteResumeByIds(ids));
    }
}