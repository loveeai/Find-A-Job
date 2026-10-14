package com.study.web.controller.mapper;


import com.study.web.controller.domin.Interview;

import java.util.List;

public interface InterviewMapper
{

    List<Interview> selectInterviewList(Interview interview);

    Interview selectInterviewById(Long id);

    int insertInterview(Interview interview);

    int updateInterview(Interview interview);

    int deleteInterviewByIds(Long[] ids);
}
