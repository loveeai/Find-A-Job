package com.study.web.controller.service.impl;

import com.study.web.controller.domin.Resume;
import com.study.web.controller.mapper.ResumeMapper;
import com.study.web.controller.service.IResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("resumeService")
public class ResumeServiceImpl implements IResumeService {

    @Autowired
    private ResumeMapper resumeMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private volatile boolean expectedPositionNameSchemaChecked = false;

    @Override
    public List<Resume> selectResumeList(Resume resume) {
        ensureExpectedPositionNameSchema();
        return resumeMapper.selectResumeList(resume);
    }

    @Override
    public Resume selectResumeById(Long id) {
        ensureExpectedPositionNameSchema();
        return resumeMapper.selectResumeById(id);
    }

    @Override
    public int insertResume(Resume resume) {
        ensureExpectedPositionNameSchema();
        normalizeResume(resume);
        return resumeMapper.insertResume(resume);
    }

    @Override
    public int updateResume(Resume resume) {
        ensureExpectedPositionNameSchema();
        normalizeResume(resume);
        return resumeMapper.updateResume(resume);
    }

    @Override
    public int deleteResumeById(Long id) {
        ensureExpectedPositionNameSchema();
        return resumeMapper.deleteResumeById(id);
    }

    @Override
    public int deleteResumeByIds(String[] ids) {
        ensureExpectedPositionNameSchema();
        return resumeMapper.deleteResumeByIds(ids);
    }

    private void normalizeResume(Resume resume) {
        if (resume == null) {
            return;
        }

        if (resume.getTitle() == null || resume.getTitle().trim().isEmpty()) {
            resume.setTitle("我的简历");
        } else {
            resume.setTitle(resume.getTitle().trim());
        }

        if (resume.getExpectedPosition() != null) {
            String expectedPosition = resume.getExpectedPosition().trim();
            if (expectedPosition.isEmpty() || !expectedPosition.matches("\\d+")) {
                resume.setExpectedPosition(null);
            } else {
                resume.setExpectedPosition(expectedPosition);
            }
        }

        if (resume.getExpectedPositionName() != null) {
            resume.setExpectedPositionName(resume.getExpectedPositionName().trim());
        }
    }

    private void ensureExpectedPositionNameSchema() {
        if (expectedPositionNameSchemaChecked) {
            return;
        }

        synchronized (this) {
            if (expectedPositionNameSchemaChecked) {
                return;
            }

            Integer count = jdbcTemplate.queryForObject(
                    "select count(1) from information_schema.columns " +
                            "where table_schema = database() and table_name = 'resume' and column_name = 'expected_position_name'",
                    Integer.class
            );

            if (count == null || count == 0) {
                jdbcTemplate.execute(
                        "alter table resume add column expected_position_name varchar(100) default null comment '期望岗位名称' after expected_position"
                );
            }

            jdbcTemplate.execute(
                    "update resume r " +
                            "left join job j on r.expected_position = j.id " +
                            "set r.expected_position_name = j.title " +
                            "where (r.expected_position_name is null or r.expected_position_name = '') " +
                            "and r.expected_position is not null and j.id is not null"
            );

            expectedPositionNameSchemaChecked = true;
        }
    }
}
