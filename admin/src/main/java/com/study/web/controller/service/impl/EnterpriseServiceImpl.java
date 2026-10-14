package com.study.web.controller.service.impl;

import com.study.web.controller.domin.Enterprise;
import com.study.web.controller.mapper.EnterpriseMapper;
import com.study.web.controller.service.IEnterpriseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("enterpriseService")
public class EnterpriseServiceImpl implements IEnterpriseService {

    @Autowired
    private EnterpriseMapper enterpriseMapper;

    @Override
    public List<Enterprise> selectEnterpriseList(Enterprise enterprise) {
        return enterpriseMapper.selectEnterpriseList(enterprise);
    }

    @Override
    public Enterprise selectEnterpriseById(Long id) {
        return enterpriseMapper.selectEnterpriseById(id);
    }

    @Override
    public int insertEnterprise(Enterprise enterprise) {
        return enterpriseMapper.insertEnterprise(enterprise);
    }

    @Override
    public int updateEnterprise(Enterprise enterprise) {
        return enterpriseMapper.updateEnterprise(enterprise);
    }

    @Override
    public int deleteEnterpriseById(Long id) {
        return enterpriseMapper.deleteEnterpriseById(id);
    }

    @Override
    public int deleteEnterpriseByIds(String[] ids) {
        return enterpriseMapper.deleteEnterpriseByIds(ids);
    }
}