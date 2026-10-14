package com.study.web.controller.mapper;

import com.study.web.controller.domin.Application;

import java.util.List;

public interface ApplicationMapper {
    List<Application> selectApplicationList(Application application);

    Application selectApplicationById(Long id);

    int insertApplication(Application application);

    int updateApplication(Application application);

    int deleteApplicationById(Long id);

    int deleteApplicationByIds(String[] ids);
}