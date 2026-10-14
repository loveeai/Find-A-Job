package com.study.web.controller.mapper;

import com.study.web.controller.domin.ResumeFile;

import java.util.List;

public interface ResumeFileMapper {
    List<ResumeFile> selectResumeFileList(ResumeFile resumeFile);

    ResumeFile selectResumeFileById(Long id);

    int insertResumeFile(ResumeFile resumeFile);

    int updateResumeFile(ResumeFile resumeFile);

    int deleteResumeFileById(Long id);

    int deleteResumeFileByIds(String[] ids);
}