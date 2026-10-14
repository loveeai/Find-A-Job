package com.study.web.controller.mapper;

import com.study.web.controller.domin.Resume;

import java.util.List;

public interface ResumeMapper {
    List<Resume> selectResumeList(Resume resume);

    Resume selectResumeById(Long id);

    int insertResume(Resume resume);

    int updateResume(Resume resume);

    int deleteResumeById(Long id);

    int deleteResumeByIds(String[] ids);
}