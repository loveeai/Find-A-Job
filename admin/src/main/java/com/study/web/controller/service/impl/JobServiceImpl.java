package com.study.web.controller.service.impl;

import com.study.web.controller.domin.Job;
import com.study.web.controller.mapper.JobMapper;
import com.study.web.controller.service.IJobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service("jobService")
public class JobServiceImpl implements IJobService {

    @Autowired
    private JobMapper jobMapper;

    @Override
    public List<Job> selectJobList(Job job) {
        List<Job> jobList = jobMapper.selectJobList(job);
        jobList.forEach(this::fillRecruitmentState);
        return jobList;
    }

    @Override
    public Job selectJobById(Long id) {
        Job job = jobMapper.selectJobById(id);
        fillRecruitmentState(job);
        return job;
    }

    @Override
    public int insertJob(Job job) {
        return jobMapper.insertJob(job);
    }

    @Override
    public int updateJob(Job job) {
        return jobMapper.updateJob(job);
    }

    @Override
    public int updateJobAuditStatus(Long id, Integer status) {
        return jobMapper.updateJobAuditStatus(id, status);
    }

    @Override
    public int deleteJobById(Long id) {
        return jobMapper.deleteJobById(id);
    }

    @Override
    public int deleteJobByIds(String[] ids) {
        return jobMapper.deleteJobByIds(ids);
    }

    private void fillRecruitmentState(Job job) {
        if (job == null) {
            return;
        }

        LocalDate today = LocalDate.now();
        LocalDate startDate = toLocalDate(job.getStartTime());
        LocalDate endDate = toLocalDate(job.getEndTime());

        if (endDate != null && endDate.isBefore(today)) {
          job.setExpired(true);
          job.setRecruitStatusText("已结束");
          return;
        }

        job.setExpired(false);
        if (startDate != null && startDate.isAfter(today)) {
            job.setRecruitStatusText("未开始");
            return;
        }

        job.setRecruitStatusText("招聘中");
    }

    private LocalDate toLocalDate(java.util.Date date) {
        if (date == null) {
            return null;
        }

        return Instant.ofEpochMilli(date.getTime())
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
    }
}
