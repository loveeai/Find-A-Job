package com.study.web.controller.system;

import com.study.common.response.ResponseResult;
import com.study.common.utils.JwtUtil;
import com.study.web.controller.BaseController;
import com.study.web.controller.domin.Job;
import com.study.web.controller.domin.JobAuditRequest;
import com.study.web.controller.domin.SysUser;
import com.study.web.controller.service.IJobService;
import com.study.web.controller.service.impl.SysUserServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
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
public class JobController extends BaseController {

    @Autowired
    private IJobService jobService;

    @Autowired
    private SysUserServiceImpl sysUserService;

    @GetMapping("/job")
    public ResponseResult selectJobList(Job job) {
        String salary = job.getSalary();
        if (salary != null && !salary.isEmpty()) {
            if ("5k以下".equals(salary)) {
                job.setSalaryMax(5000);
            } else if ("5k-10k".equals(salary)) {
                job.setSalaryMin(5000);
                job.setSalaryMax(10000);
            } else if ("10k-20k".equals(salary)) {
                job.setSalaryMin(10000);
                job.setSalaryMax(20000);
            } else if ("20k-30k".equals(salary)) {
                job.setSalaryMin(20000);
                job.setSalaryMax(30000);
            } else if ("30k以上".equals(salary)) {
                job.setSalaryMin(30000);
            }
        }
        startPage();
        List<Job> data = jobService.selectJobList(job);
        return getResult(data);
    }

    @GetMapping("/job/{id}")
    public ResponseResult selectJobById(@PathVariable Long id) {
        Job job = jobService.selectJobById(id);
        return getResult(job);
    }

    @PostMapping("/job")
    public ResponseResult insertJob(@RequestBody Job job, HttpServletRequest request) {
        if (job == null) {
            return ResponseResult.error("缺少职位信息，无法保存");
        }

        SysUser currentUser;
        try {
            currentUser = getCurrentUser(request);
        } catch (Exception e) {
            return ResponseResult.error(resolveWriteBlockMessage(e.getMessage()));
        }

        if (isAdminUser(currentUser)) {
            ResponseResult enterpriseResult = validateAdminJobEnterprise(job);
            if (enterpriseResult != null) {
                return enterpriseResult;
            }
            return getResult(jobService.insertJob(job));
        }

        if (!isEnterpriseUser(currentUser)) {
            return ResponseResult.error(resolveWriteBlockMessage("仅企业用户可发布或修改职位"));
        }

        ResponseResult authResult = validateEnterpriseWriter(currentUser);
        if (authResult != null) {
            return authResult;
        }

        if (currentUser.getCompanyId() == null) {
            return ResponseResult.error("企业信息不完整，无法发布职位");
        }

        job.setEnterpriseId(currentUser.getCompanyId());
        return getResult(jobService.insertJob(job));
    }

    @PutMapping("/job")
    public ResponseResult updateJob(@RequestBody Job job, HttpServletRequest request) {
        return doUpdateJob(job, request);
    }

    @PutMapping("/job/{id}")
    public ResponseResult updateJobById(@PathVariable Long id, @RequestBody Job job, HttpServletRequest request) {
        if (job == null) {
            job = new Job();
        }
        job.setId(id);
        return doUpdateJob(job, request);
    }

    @PutMapping("/job/{id}/audit")
    public ResponseResult updateJobAuditStatus(@PathVariable Long id,
                                               @RequestBody JobAuditRequest auditRequest,
                                               HttpServletRequest request) {
        try {
            requireAdminUser(request);
        } catch (Exception e) {
            return ResponseResult.error(resolveAdminAuditBlockMessage(e.getMessage()));
        }

        if (auditRequest == null || auditRequest.getStatus() == null) {
            return ResponseResult.error("缺少审核状态");
        }
        if (auditRequest.getStatus() != 1 && auditRequest.getStatus() != 3) {
            return ResponseResult.error("审核状态不合法");
        }

        Job originJob = jobService.selectJobById(id);
        if (originJob == null) {
            return ResponseResult.error("职位不存在或已删除");
        }

        return getResult(jobService.updateJobAuditStatus(id, auditRequest.getStatus()));
    }

    @DeleteMapping("/job/{id}")
    public ResponseResult deleteJobById(@PathVariable Long id) {
        return getResult(jobService.deleteJobById(id));
    }

    @DeleteMapping("/job/ids/{ids}")
    public ResponseResult deleteJobByIds(@PathVariable String[] ids) {
        return getResult(jobService.deleteJobByIds(ids));
    }

    private ResponseResult doUpdateJob(Job job, HttpServletRequest request) {
        if (job == null || job.getId() == null) {
            return ResponseResult.error("缺少职位信息，无法更新");
        }

        SysUser currentUser;
        try {
            currentUser = getCurrentUser(request);
        } catch (Exception e) {
            return ResponseResult.error(resolveWriteBlockMessage(e.getMessage()));
        }

        Job originJob = jobService.selectJobById(job.getId());
        if (originJob == null) {
            return ResponseResult.error("职位不存在或已删除");
        }

        if (isAdminUser(currentUser)) {
            ResponseResult enterpriseResult = validateAdminJobEnterprise(job);
            if (enterpriseResult != null) {
                return enterpriseResult;
            }
            return getResult(jobService.updateJob(job));
        }

        if (!isEnterpriseUser(currentUser)) {
            return ResponseResult.error(resolveWriteBlockMessage("仅企业用户可发布或修改职位"));
        }

        ResponseResult authResult = validateEnterpriseWriter(currentUser);
        if (authResult != null) {
            return authResult;
        }

        if (currentUser.getCompanyId() == null) {
            return ResponseResult.error("企业信息不完整，无法更新职位");
        }

        if (originJob.getEnterpriseId() == null || !originJob.getEnterpriseId().equals(currentUser.getCompanyId())) {
            return ResponseResult.error("无权修改该职位");
        }

        job.setEnterpriseId(currentUser.getCompanyId());
        return getResult(jobService.updateJob(job));
    }

    private ResponseResult validateAdminJobEnterprise(Job job) {
        if (job == null || job.getEnterpriseId() == null || job.getEnterpriseId() <= 0) {
            return ResponseResult.error("请选择所属企业，无法保存职位");
        }
        return null;
    }

    private ResponseResult validateEnterpriseWriter(HttpServletRequest request) {
        try {
            SysUser user = getEnterpriseUser(request);
            return validateEnterpriseWriter(user);
        } catch (Exception e) {
            return ResponseResult.error(resolveWriteBlockMessage(e.getMessage()));
        }
    }

    private ResponseResult validateEnterpriseWriter(SysUser user) {
        try {
            if (user == null) {
                return ResponseResult.error("请先登录");
            }
            sysUserService.ensureEnterpriseUserAvailable(user);
            return null;
        } catch (Exception e) {
            return ResponseResult.error(resolveWriteBlockMessage(e.getMessage()));
        }
    }

    private boolean isAdminUser(SysUser user) {
        return user != null && user.getRoleId() != null && user.getRoleId() == 1L;
    }

    private boolean isEnterpriseUser(SysUser user) {
        return user != null && user.getRoleId() != null && user.getRoleId() == 2L;
    }

    private SysUser getEnterpriseUser(HttpServletRequest request) {
        SysUser user = getCurrentUser(request);
        if (!isEnterpriseUser(user)) {
            throw new RuntimeException("仅企业用户可发布或修改职位");
        }
        return user;
    }

    private SysUser requireAdminUser(HttpServletRequest request) {
        SysUser user = getCurrentUser(request);
        if (!isAdminUser(user)) {
            throw new RuntimeException("仅管理员可审核职位");
        }
        return user;
    }

    private SysUser getCurrentUser(HttpServletRequest request) {
        String token = resolveToken(request);
        if (token == null || token.trim().isEmpty()) {
            throw new RuntimeException("请先登录");
        }

        String username;
        try {
            username = JwtUtil.getUsername(token);
        } catch (Exception e) {
            throw new RuntimeException("登录凭证已失效，请重新登录");
        }

        if (username == null || username.trim().isEmpty()) {
            throw new RuntimeException("登录凭证已失效，请重新登录");
        }

        SysUser user = sysUserService.findByName(username);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        return user;
    }

    private String resolveToken(HttpServletRequest request) {
        String token = request.getHeader("token");
        if (token == null || token.trim().isEmpty()) {
            token = request.getHeader("Token");
        }
        return token;
    }

    private String resolveWriteBlockMessage(String message) {
        if (message == null || message.trim().isEmpty()) {
            return "企业账号暂时无法继续操作";
        }
        if (message.contains("待管理员审核")) {
            return "企业账号待管理员审核，暂时无法发布职位";
        }
        if (message.contains("审核未通过")) {
            return "企业账号审核未通过，暂时无法发布职位";
        }
        if (message.contains("已被禁用")) {
            return "所属企业已被禁用，无法发布职位";
        }
        if (message.contains("未关联企业")) {
            return "企业账号未关联企业，无法发布职位";
        }
        return message;
    }

    private String resolveAdminAuditBlockMessage(String message) {
        if (message == null || message.trim().isEmpty()) {
            return "审核职位失败";
        }
        return message;
    }
}
