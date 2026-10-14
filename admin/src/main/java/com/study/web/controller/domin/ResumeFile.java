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
public class ResumeFile implements Serializable {
    private static final long serialVersionUID = 1L;

    //id
    private Long id;
    //关联简历ID
    private Long resumeId;
    //文件名
    private String fileName;
    //文件路径
    private String filePath;
    //文件大小（字节）
    private Long fileSize;
    //文件类型
    private String fileType;
    //创建时间
    private Date createTime;
}