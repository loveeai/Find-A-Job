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
public class Complaint implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long jobId;
    private Long userId;
    private String reason;
    private Date createTime;
    private String userName;
    private String userPicture;
    private String jobTitle;
    private String companyName;
}
