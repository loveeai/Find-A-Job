package com.study.web.controller.domin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.io.Serializable;

/**
 * 当前登录用户的自动识别码，前端将token保存在本地，后续端口以此为身份识别

 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class LoginUser implements Serializable {

    private SysUser sysUser;

    //系统颁发的token
    private String token;

}
