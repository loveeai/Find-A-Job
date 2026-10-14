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
public class UserCollectJob implements Serializable {
    private static final long serialVersionUID = 1L;

    //id
    private Long id;
    //关联用户ID
    private Long userId;
    //关联招聘岗位ID
    private Long jobId;
    //创建时间
    private Date createTime;
    //职位信息
    private String title;
    private String companyName;
    private String salary;
    private String location;
    private String description;
    private String industry;
}
