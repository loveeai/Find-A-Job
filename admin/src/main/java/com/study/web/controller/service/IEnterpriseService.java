package com.study.web.controller.service;

import com.study.web.controller.domin.Enterprise;

import java.util.List;

public interface IEnterpriseService {
    List<Enterprise> selectEnterpriseList(Enterprise enterprise);

    Enterprise selectEnterpriseById(Long id);

    int insertEnterprise(Enterprise enterprise);

    int updateEnterprise(Enterprise enterprise);

    int deleteEnterpriseById(Long id);

    int deleteEnterpriseByIds(String[] ids);
}