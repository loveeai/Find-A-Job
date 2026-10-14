package com.study.web.controller.system;

import com.study.common.response.ResponseResult;
import com.study.common.utils.JwtUtil;
import com.study.web.controller.BaseController;
import com.study.web.controller.domin.Application;
import com.study.web.controller.domin.Job;
import com.study.web.controller.domin.Resume;
import com.study.web.controller.domin.ResumeFile;
import com.study.web.controller.domin.SysUser;
import com.study.web.controller.service.IApplicationService;
import com.study.web.controller.service.IJobService;
import com.study.web.controller.service.IResumeFileService;
import com.study.web.controller.service.IResumeService;
import com.study.web.controller.service.SysUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
public class ApplicationController extends BaseController {

    @Autowired
    private IApplicationService applicationService;

    @Autowired
    private SysUserService sysUserService;

    @Autowired
    private IJobService jobService;

    @Autowired
    private IResumeService resumeService;

    @Autowired
    private IResumeFileService resumeFileService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private volatile boolean applicationSchemaChecked = false;

    @GetMapping("/application")
    public ResponseResult selectApplicationList(Application application, HttpServletRequest request) {
        ResponseResult schemaError = ensureApplicationSchema();
        if (schemaError != null) {
            return schemaError;
        }

        String token = request.getHeader("token");
        String username = JwtUtil.getUsername(token);
        SysUser user = sysUserService.findByName(username);
        if (user == null) {
            return ResponseResult.error("User not found");
        }

        if (user.getRoleId() == 2L) {
            application.setEnterpriseId(user.getCompanyId());
        } else {
            application.setUserId(user.getUserId());
        }

        startPage();
        List<Application> data = applicationService.selectApplicationList(application);
        return getResult(data);
    }

    @GetMapping("/application/{id}")
    public ResponseResult selectApplicationById(@PathVariable Long id) {
        ResponseResult schemaError = ensureApplicationSchema();
        if (schemaError != null) {
            return schemaError;
        }

        Application application = applicationService.selectApplicationById(id);
        return getResult(application);
    }

    @PostMapping("/application")
    public ResponseResult insertApplication(@RequestBody Application application, HttpServletRequest request) {
        ResponseResult schemaError = ensureApplicationSchema();
        if (schemaError != null) {
            return schemaError;
        }

        if (application.getJobId() == null || application.getResumeId() == null) {
            return ResponseResult.error("Missing application data");
        }

        String token = request.getHeader("token");
        String username = JwtUtil.getUsername(token);
        SysUser user = sysUserService.findByName(username);
        if (user == null) {
            return ResponseResult.error("User not found");
        }

        Resume resume = resumeService.selectResumeById(application.getResumeId());
        if (resume == null || resume.getUserId() == null || !resume.getUserId().equals(user.getUserId())) {
            return ResponseResult.error("Resume is invalid");
        }

        Job job = jobService.selectJobById(application.getJobId());
        if (job == null || job.getEnterpriseId() == null) {
            return ResponseResult.error("Job not found");
        }

        if (application.getResumeFileId() != null) {
            ResumeFile resumeFile = resumeFileService.selectResumeFileById(application.getResumeFileId());
            if (resumeFile == null || resumeFile.getResumeId() == null
                    || !resumeFile.getResumeId().equals(application.getResumeId())) {
                return ResponseResult.error("Resume attachment is invalid");
            }
        }

        application.setUserId(user.getUserId());
        application.setEnterpriseId(job.getEnterpriseId());
        if (application.getStatus() == null) {
            application.setStatus(0);
        }

        return getResult(applicationService.insertApplication(application));
    }

    @PutMapping("/application")
    public ResponseResult updateApplication(@RequestBody Application application) {
        ResponseResult schemaError = ensureApplicationSchema();
        if (schemaError != null) {
            return schemaError;
        }

        return getResult(applicationService.updateApplication(application));
    }

    @DeleteMapping("/application/{id}")
    public ResponseResult deleteApplicationById(@PathVariable Long id) {
        ResponseResult schemaError = ensureApplicationSchema();
        if (schemaError != null) {
            return schemaError;
        }

        return getResult(applicationService.deleteApplicationById(id));
    }

    @DeleteMapping("/application/ids/{ids}")
    public ResponseResult deleteApplicationByIds(@PathVariable String[] ids) {
        ResponseResult schemaError = ensureApplicationSchema();
        if (schemaError != null) {
            return schemaError;
        }

        return getResult(applicationService.deleteApplicationByIds(ids));
    }

    private ResponseResult ensureApplicationSchema() {
        if (applicationSchemaChecked) {
            return null;
        }

        synchronized (this) {
            if (applicationSchemaChecked) {
                return null;
            }

            try {
                Integer count = jdbcTemplate.queryForObject(
                        "select count(1) from information_schema.columns where table_schema = database() and table_name = 'application' and column_name = 'resume_file_id'",
                        Integer.class
                );
                if (count == null || count == 0) {
                    jdbcTemplate.execute("alter table application add column resume_file_id bigint(20) default null comment '关联投递的简历附件ID' after resume_id");
                }
                applicationSchemaChecked = true;
                return null;
            } catch (Exception e) {
                return ResponseResult.error("application表缺少resume_file_id字段，请执行数据库升级脚本后重试");
            }
        }
    }
}
