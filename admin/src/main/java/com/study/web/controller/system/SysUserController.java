package com.study.web.controller.system;

import com.study.common.response.ResponseResult;
import com.study.web.controller.domin.*;
import com.study.web.controller.domin.vo.SysUserVo;
import com.study.web.controller.service.impl.SysUserServiceImpl;
import com.study.web.controller.BaseController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
public class SysUserController extends BaseController {




    @Autowired
    private SysUserServiceImpl sysUserService;


    @GetMapping("/sysUser")
    public ResponseResult findAll(SysUser sysUser){
        startPage();
        List<SysUser> data = sysUserService.findAll(sysUser);
        return getResult(data);
    }
    @GetMapping("/sysUser2")
    public ResponseResult findAll2(SysUser sysUser){
        startPage();
        sysUser.setRoleId(2L);
        List<SysUser> data = sysUserService.findAll(sysUser);
        return getResult(data);
    }
    @GetMapping("/sysUser/{id}")
    public ResponseResult findById(@PathVariable Long id){
        SysUser sysUser = sysUserService.findById(id);
        return getResult(sysUser);
    }

    @GetMapping("/sysUser/checkUnique")
    public ResponseResult checkUnique(SysUser sysUser){
        Long userId = sysUser.getUserId() == null ? -1L : sysUser.getUserId();
        Map<String, Object> data = new HashMap<>();
        data.put("userNameUnique", sysUserService.isUserNameUnique(sysUser.getUserName(), userId));
        data.put("phoneNumberUnique", sysUserService.isPhoneNumberUnique(sysUser.getPhoneNumber(), userId));
        data.put("emailUnique", sysUserService.isEmailUnique(sysUser.getEmail(), userId));
        return getResult(data);
    }

    /**
     * 添加用户请求，注册也在这里
     * @param sysUser
     * @return
     */
    @PostMapping("/sysUser")
    public ResponseResult add(@Validated @RequestBody SysUser sysUser){
        return getResult(sysUserService.add(sysUser));
    }


    @PutMapping("/sysUser")
    public ResponseResult update(@Validated @RequestBody SysUser sysUser){
        return getResult(sysUserService.update(sysUser));
    }

    @PutMapping("/updatePassword")
    public ResponseResult updatePassword(@Validated @RequestBody Password password){

        return getResult(sysUserService.updatePassword(password));
    }

    @DeleteMapping("/sysUser/{ids}")
    public ResponseResult delete(@PathVariable Long[] ids){
        return getResult(sysUserService.delete(ids));
    }

    //用户登录
    @RequestMapping("/sysUser/login")
    public ResponseResult login(@RequestBody SysUserVo sysUserVo){
        return getResult(sysUserService.login(sysUserVo));
    }









}
