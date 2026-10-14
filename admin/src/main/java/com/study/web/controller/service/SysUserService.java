package com.study.web.controller.service;

import com.study.web.controller.domin.LoginUser;
import com.study.web.controller.domin.Password;
import com.study.web.controller.domin.SysUser;
import com.study.web.controller.domin.vo.SysUserVo;

import java.util.List;


public interface SysUserService {
    List<SysUser> findAll(SysUser sysUser);


    SysUser findById(Long id);

    SysUser findByName(String userName);

    int add(SysUser sysUser);

    int update(SysUser sysUser);

    int delete(Long[] ids);

    LoginUser login(SysUserVo sysUserVo);

    LoginUser findLoginUser(SysUserVo sysUserVo);

    boolean isUserNameUnique(String userName, Long userId);

    boolean isPhoneNumberUnique(String phoneNumber, Long userId);

    boolean isEmailUnique(String email, Long userId);

    int updatePassword(Password password);



}
