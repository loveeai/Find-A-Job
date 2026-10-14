package com.study.web.controller.service.impl;

import com.study.web.controller.domin.ResumeFile;
import com.study.web.controller.mapper.ResumeFileMapper;
import com.study.web.controller.service.IResumeFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("resumeFileService")
public class ResumeFileServiceImpl implements IResumeFileService {

    @Autowired
    private ResumeFileMapper resumeFileMapper;

    @Override
    public List<ResumeFile> selectResumeFileList(ResumeFile resumeFile) {
        return resumeFileMapper.selectResumeFileList(resumeFile);
    }

    @Override
    public ResumeFile selectResumeFileById(Long id) {
        return resumeFileMapper.selectResumeFileById(id);
    }

    @Override
    public int insertResumeFile(ResumeFile resumeFile) {
        return resumeFileMapper.insertResumeFile(resumeFile);
    }

    @Override
    public int updateResumeFile(ResumeFile resumeFile) {
        return resumeFileMapper.updateResumeFile(resumeFile);
    }

    @Override
    public int deleteResumeFileById(Long id) {
        return resumeFileMapper.deleteResumeFileById(id);
    }

    @Override
    public int deleteResumeFileByIds(String[] ids) {
        return resumeFileMapper.deleteResumeFileByIds(ids);
    }
}