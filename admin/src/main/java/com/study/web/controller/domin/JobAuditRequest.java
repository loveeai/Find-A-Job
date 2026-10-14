package com.study.web.controller.domin;

import lombok.Data;

import java.io.Serializable;

@Data
public class JobAuditRequest implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer status;
}
