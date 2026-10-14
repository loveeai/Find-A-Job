package com.study.web.controller.service.impl;

import com.study.web.controller.domin.Application;
import com.study.web.controller.mapper.ApplicationMapper;
import com.study.web.controller.service.IApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("applicationService")
public class ApplicationServiceImpl implements IApplicationService {

    @Autowired
    private ApplicationMapper applicationMapper;

    @Override
    public List<Application> selectApplicationList(Application application) {
        return applicationMapper.selectApplicationList(application);
    }

    @Override
    public Application selectApplicationById(Long id) {
        return applicationMapper.selectApplicationById(id);
    }

    @Override
    public int insertApplication(Application application) {
        return applicationMapper.insertApplication(application);
    }

    @Override
    public int updateApplication(Application application) {
        return applicationMapper.updateApplication(application);
    }

    @Override
    public int deleteApplicationById(Long id) {
        return applicationMapper.deleteApplicationById(id);
    }

    @Override
    public int deleteApplicationByIds(String[] ids) {
        return applicationMapper.deleteApplicationByIds(ids);
    }
}