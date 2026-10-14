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
public class EnterpriseCollectResume implements Serializable {
    private static final long serialVersionUID = 1L;

    //id
    private Long id;
    //关联企业ID
    private Long enterpriseId;
    //关联简历ID
    private Long resumeId;
    //关联用户ID
    private Long userId;
    //创建时间
    private Date createTime;
}