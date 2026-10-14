package com.study.web.controller.service.impl;

import com.study.web.controller.domin.JobCategory;
import com.study.web.controller.mapper.JobCategoryMapper;
import com.study.web.controller.service.IJobCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("jobCategoryService")
public class JobCategoryServiceImpl implements IJobCategoryService {

    @Autowired
    private JobCategoryMapper jobCategoryMapper;

    @Override
    public List<JobCategory> selectJobCategoryList(JobCategory jobCategory) {
        return jobCategoryMapper.selectJobCategoryList(jobCategory);
    }

    @Override
    public JobCategory selectJobCategoryById(Long id) {
        return jobCategoryMapper.selectJobCategoryById(id);
    }

    @Override
    public int insertJobCategory(JobCategory jobCategory) {
        return jobCategoryMapper.insertJobCategory(jobCategory);
    }

    @Override
    public int updateJobCategory(JobCategory jobCategory) {
        return jobCategoryMapper.updateJobCategory(jobCategory);
    }

    @Override
    public int deleteJobCategoryById(Long id) {
        return jobCategoryMapper.deleteJobCategoryById(id);
    }

    @Override
    public int deleteJobCategoryByIds(String[] ids) {
        return jobCategoryMapper.deleteJobCategoryByIds(ids);
    }
}