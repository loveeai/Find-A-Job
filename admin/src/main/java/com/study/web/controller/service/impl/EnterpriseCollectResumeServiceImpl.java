package com.study.web.controller.service.impl;

import com.study.web.controller.domin.EnterpriseCollectResume;
import com.study.web.controller.mapper.EnterpriseCollectResumeMapper;
import com.study.web.controller.service.IEnterpriseCollectResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("enterpriseCollectResumeService")
public class EnterpriseCollectResumeServiceImpl implements IEnterpriseCollectResumeService {

    @Autowired
    private EnterpriseCollectResumeMapper enterpriseCollectResumeMapper;

    @Override
    public List<EnterpriseCollectResume> selectEnterpriseCollectResumeList(EnterpriseCollectResume enterpriseCollectResume) {
        return enterpriseCollectResumeMapper.selectEnterpriseCollectResumeList(enterpriseCollectResume);
    }

    @Override
    public EnterpriseCollectResume selectEnterpriseCollectResumeById(Long id) {
        return enterpriseCollectResumeMapper.selectEnterpriseCollectResumeById(id);
    }

    @Override
    public int insertEnterpriseCollectResume(EnterpriseCollectResume enterpriseCollectResume) {
        return enterpriseCollectResumeMapper.insertEnterpriseCollectResume(enterpriseCollectResume);
    }

    @Override
    public int updateEnterpriseCollectResume(EnterpriseCollectResume enterpriseCollectResume) {
        return enterpriseCollectResumeMapper.updateEnterpriseCollectResume(enterpriseCollectResume);
    }

    @Override
    public int deleteEnterpriseCollectResumeById(Long id) {
        return enterpriseCollectResumeMapper.deleteEnterpriseCollectResumeById(id);
    }

    @Override
    public int deleteEnterpriseCollectResumeByIds(String[] ids) {
        return enterpriseCollectResumeMapper.deleteEnterpriseCollectResumeByIds(ids);
    }
}