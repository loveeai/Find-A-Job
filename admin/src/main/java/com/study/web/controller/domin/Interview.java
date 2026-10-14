package com.study.web.controller.domin;


import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.io.Serializable;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Interview implements Serializable
{
    private static final long serialVersionUID = 1L;

    /** 面试id */
    private Long id;

    /** 面试用户id */
    private Long userId;

    /** 招聘信息id */
    private Long jobId;

    /** 企业id */
    private Long companyId;

    /** 邀请时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date times;

    /** 邀请状态 */
    private String status;

    /** 创建时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date ctimes;

    private SysUser sysUser;
    private Job job;


}
