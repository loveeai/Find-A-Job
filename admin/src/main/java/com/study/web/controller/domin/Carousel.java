package com.study.web.controller.domin;


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
public class Carousel implements Serializable
{
    private static final long serialVersionUID = 1L;

    /** id */
    private Long id;

    /** 图片地址 */
    private String posters;

    private String name;
    private Date times;
    private Long userId;
    private Date utimes;
    private Long uuserId;
    private String isgg;

    private SysUser sysUser;


}
