package com.study.web.controller.domin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import java.io.Serializable;

@AllArgsConstructor
@NoArgsConstructor
@Data
@ToString
public class SysUser implements Serializable {
    private static final Long serialVersionUID = 1L;

    private Long userId;

    @NotBlank(message = "用户名不能为空")
    private String userName;

    private String password;

    private String salt;

    @Pattern(regexp = "^1\\d{10}$", message = "手机号格式有误")
    private String phoneNumber;

    private Boolean sex;

    private String userPicture;

    private Long roleId;

    private String email;

    private Long companyId;

    private String fileUrl;

    private Integer auditStatus;

    private Enterprise company;
}
