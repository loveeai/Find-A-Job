package com.study.web.controller.service.impl;


import com.study.web.controller.domin.Interview;
import com.study.web.controller.mapper.InterviewMapper;
import com.study.web.controller.service.IInterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InterviewServiceImpl implements IInterviewService
{
    @Autowired
    private InterviewMapper interviewMapper;


    @Override
    public List<Interview> selectList(Interview interview) {
        return interviewMapper.selectInterviewList(interview);
    }

    @Override
    public Interview selectById(Long id) {
        return interviewMapper.selectInterviewById(id);
    }

    @Override
    public int add(Interview interview) {
        return interviewMapper.insertInterview(interview);
    }

    @Override
    public int update(Interview interview) {
        return interviewMapper.updateInterview(interview);
    }

    @Override
    public int deleteByIds(Long[] ids) {
        return interviewMapper.deleteInterviewByIds(ids);
    }
}
