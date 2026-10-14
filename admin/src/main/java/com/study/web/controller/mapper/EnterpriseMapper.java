package com.study.web.controller.mapper;

import com.study.web.controller.domin.Enterprise;

import java.util.List;

public interface EnterpriseMapper {
    List<Enterprise> selectEnterpriseList(Enterprise enterprise);

    Enterprise selectEnterpriseById(Long id);

    int insertEnterprise(Enterprise enterprise);

    int updateEnterprise(Enterprise enterprise);

    int deleteEnterpriseById(Long id);

    int deleteEnterpriseByIds(String[] ids);
}