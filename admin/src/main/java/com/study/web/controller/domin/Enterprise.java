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
public class Enterprise implements Serializable {
    private static final long serialVersionUID = 1L;

    //id
    private Long id;
    //企业名称
    private String name;
    //企业logo
    private String logo;
    //企业规模
    private String scale;
    //员工人数
    private Integer employeeCount;
    //所属行业
    private String industry;
    //公司地址
    private String address;
    //公司描述
    private String description;
    //状态：0-正常，1-禁用
    private Integer status;
    //创建时间
    private Date createTime;
    //更新时间
    private Date updateTime;
}