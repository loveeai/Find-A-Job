package com.study.web.controller.service;

import com.study.web.controller.domin.EnterpriseCollectResume;

import java.util.List;

public interface IEnterpriseCollectResumeService {
    List<EnterpriseCollectResume> selectEnterpriseCollectResumeList(EnterpriseCollectResume enterpriseCollectResume);

    EnterpriseCollectResume selectEnterpriseCollectResumeById(Long id);

    int insertEnterpriseCollectResume(EnterpriseCollectResume enterpriseCollectResume);

    int updateEnterpriseCollectResume(EnterpriseCollectResume enterpriseCollectResume);

    int deleteEnterpriseCollectResumeById(Long id);

    int deleteEnterpriseCollectResumeByIds(String[] ids);
}