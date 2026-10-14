package com.study.web.controller.mapper;

import com.study.web.controller.domin.LoginUser;
import com.study.web.controller.domin.SysUser;
import com.study.web.controller.domin.vo.SysUserVo;
import org.apache.ibatis.annotations.Param;

import java.util.List;


public interface SysUserMapper {
    List<SysUser> findAll(SysUser sysUser);

    SysUser findById(Long id);

    SysUser findByName(String userName);

    int add(SysUser sysUser);

    int update(SysUser sysUser);

    int delete(Long id);

    LoginUser findLoginUser(SysUserVo sysUserVo);

    /**
     * 查出指定名字用户的所有id
     * @param userName
     * @return
     */
    List<Long> findUsersByName(String userName);

    List<Long> findUsersByPhoneNumber(String phoneNumber);

    List<Long> findUsersByEmail(String email);

    SysUser getUserByUserIdAndPassword(Long userId, String toHex);

    int updatePasswordByUserId(@Param("userId") Long userId, @Param("password") String password);


}
