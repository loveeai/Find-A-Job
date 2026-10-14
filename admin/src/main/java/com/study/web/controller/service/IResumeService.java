package com.study.web.controller.service;

import com.study.web.controller.domin.Resume;

import java.util.List;

public interface IResumeService {
    List<Resume> selectResumeList(Resume resume);

    Resume selectResumeById(Long id);

    int insertResume(Resume resume);

    int updateResume(Resume resume);

    int deleteResumeById(Long id);

    int deleteResumeByIds(String[] ids);
}