package com.study.web.controller.domin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.io.Serializable;

@AllArgsConstructor
@Data
@NoArgsConstructor
@ToString
public class Statistics implements Serializable {

    private static final long serialVersionUID = 1L;

    private String name;
    private int nums;
}
