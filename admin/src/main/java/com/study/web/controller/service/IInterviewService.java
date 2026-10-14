package com.study.web.controller.service;


import com.study.web.controller.domin.Interview;

import java.util.List;

public interface IInterviewService
{

    List<Interview> selectList(Interview interview);

    Interview selectById(Long id);

    int add(Interview interview);

    int update(Interview interview);

    int deleteByIds(Long[] ids);
}
