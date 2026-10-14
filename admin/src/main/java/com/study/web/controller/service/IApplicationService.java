package com.study.web.controller.service;

import com.study.web.controller.domin.Application;

import java.util.List;

public interface IApplicationService {
    List<Application> selectApplicationList(Application application);

    Application selectApplicationById(Long id);

    int insertApplication(Application application);

    int updateApplication(Application application);

    int deleteApplicationById(Long id);

    int deleteApplicationByIds(String[] ids);
}