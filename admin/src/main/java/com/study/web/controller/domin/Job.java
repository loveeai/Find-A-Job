package com.study.web.controller.domin;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.springframework.format.annotation.DateTimeFormat;

import java.io.Serializable;
import java.util.Date;

@AllArgsConstructor
@NoArgsConstructor
@Data
@ToString
public class Job implements Serializable {
    private static final long serialVersionUID = 1L;

    //id
    private Long id;
    //关联企业ID
    private Long enterpriseId;
    //岗位名称
    private String title;
    //关联岗位分类ID
    private Long categoryId;
    //最低时薪（元/时）
    private Integer salaryMin;
    //最高时薪（元/时）
    private Integer salaryMax;
    //工作地点
    private String location;
    //岗位描述
    private String description;
    //福利待遇
    private String welfare;
    //状态：0-禁用，1-审核通过，2-待审核，3-未通过审核
    private Integer status;
    //企业名称
    private String companyName;
    //企业Logo
    private String companyLogo;
    //企业规模
    private String companyScale;
    //企业行业
    private String companyIndustry;
    //薪资（用于前端展示）
    private String salary;
    //创建时间
    private Date createTime;
    //更新时间
    private Date updateTime;
    //搜索关键词
    private String keyword;
    //行业筛选
    private String industry;
    //工作类型
    private String jobType;
    //开始时间
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private Date startTime;
    //结束时间
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private Date endTime;
    //最大人数
    private Long nums;
    private Boolean activeOnly;
    private Boolean expired;
    private String recruitStatusText;
    
    // 手动添加setter方法，确保MyBatis能正确映射
    public void setCompanyLogo(String companyLogo) {
        this.companyLogo = companyLogo;
    }
    
    public void setCompanyScale(String companyScale) {
        this.companyScale = companyScale;
    }
    
    public void setCompanyIndustry(String companyIndustry) {
        this.companyIndustry = companyIndustry;
    }
    
    public void setSalary(String salary) {
        this.salary = salary;
    }
}
