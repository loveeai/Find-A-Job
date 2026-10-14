package com.study.web.controller.service;

import com.study.web.controller.domin.JobCategory;

import java.util.List;

public interface IJobCategoryService {
    List<JobCategory> selectJobCategoryList(JobCategory jobCategory);

    JobCategory selectJobCategoryById(Long id);

    int insertJobCategory(JobCategory jobCategory);

    int updateJobCategory(JobCategory jobCategory);

    int deleteJobCategoryById(Long id);

    int deleteJobCategoryByIds(String[] ids);
}