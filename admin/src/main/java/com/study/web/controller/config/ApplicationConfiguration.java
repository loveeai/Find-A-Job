package com.study.web.controller.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;

/**
 *
 * */
@Configuration
//配置要扫描mapper的包
@MapperScan("com.study.web.controller.mapper")
public class ApplicationConfiguration {
}
