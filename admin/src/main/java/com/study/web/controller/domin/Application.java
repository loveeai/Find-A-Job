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
public class Application implements Serializable {
    private static final long serialVersionUID = 1L;

    //id
    private Long id;
    //关联招聘岗位ID
    private Long jobId;
    //关联简历ID
    private Long resumeId;
    //鍏宠仈鎶曢€掔殑绠€鍘嗛檮浠禝D
    private Long resumeFileId;
    //关联用户ID
    private Long userId;
    //关联企业ID
    private Long enterpriseId;
    //状态：0-待查看，1-待面试，2-不合适，3-已录用
    private Integer status;
    //面试时间
    private Date interviewTime;
    //面试地址
    private String interviewAddress;
    //创建时间
    private Date createTime;
    //更新时间
    private Date updateTime;
    
    // 以下字段从Job表关联查询获取
    //职位名称
    private String jobTitle;
    //公司名称
    private String company;
    //薪资范围
    private String salary;
    //工作地点
    private String location;
    //企业名称
    private String companyName;
    //企业Logo
    private String companyLogo;
    //企业规模
    private String companyScale;
    //企业行业
    private String companyIndustry;
    //鎶曢€掔殑闄勪欢鍚嶇О
    private String resumeFileName;
}
