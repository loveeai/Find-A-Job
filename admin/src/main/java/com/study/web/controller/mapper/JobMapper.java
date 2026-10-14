package com.study.web.controller.mapper;

import com.study.web.controller.domin.Job;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface JobMapper {
    List<Job> selectJobList(Job job);

    Job selectJobById(Long id);

    int insertJob(Job job);

    int updateJob(Job job);

    int updateJobAuditStatus(@Param("id") Long id, @Param("status") Integer status);

    int deleteJobById(Long id);

    int deleteJobByIds(String[] ids);
}
