package com.study.web.controller.service;

import com.study.web.controller.domin.Job;

import java.util.List;

public interface IJobService {
    List<Job> selectJobList(Job job);

    Job selectJobById(Long id);

    int insertJob(Job job);

    int updateJob(Job job);

    int updateJobAuditStatus(Long id, Integer status);

    int deleteJobById(Long id);

    int deleteJobByIds(String[] ids);
}
