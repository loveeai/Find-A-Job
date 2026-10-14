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
public class JobCategory implements Serializable {
    private static final long serialVersionUID = 1L;

    //id
    private Long id;
    //分类名称
    private String name;
    //父分类ID：0-一级分类，其他-二级分类
    private Long parentId;
    //状态：0-启用，1-禁用
    private Integer status;
    //创建时间
    private Date createTime;
    //更新时间
    private Date updateTime;
}