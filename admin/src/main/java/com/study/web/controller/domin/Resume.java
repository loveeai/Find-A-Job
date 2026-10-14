package com.study.web.controller.domin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.io.Serializable;
import java.util.Date;

@AllArgsConstructor
@NoArgsConstructor
@Data
@ToString
public class Resume implements Serializable {
    private static final long serialVersionUID = 1L;

    //id
    private Long id;
    //关联用户ID
    private Long userId;
    //简历标题
    private String title;
    //姓名
    private String name;
    //性别：0-未知，1-男，2-女
    private Integer gender;
    //电话
    private String phone;
    //邮箱
    private String email;
    //所在地
    private String location;
    //学历
    private String education;
    //工作经验
    private String experience;
    //期望岗位ID
    private String expectedPosition;
    //期望岗位名称
    private String expectedPositionName;
    //自我介绍
    private String selfIntroduction;
    //状态：0-正常，1-删除
    private Integer status;
    //创建时间
    private Date createTime;
    //更新时间
    private Date updateTime;
    //用户头像
    private String avatar;
}