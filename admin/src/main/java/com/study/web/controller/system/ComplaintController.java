package com.study.web.controller.system;

import com.study.common.response.ResponseResult;
import com.study.common.utils.JwtUtil;
import com.study.web.controller.BaseController;
import com.study.web.controller.domin.Complaint;
import com.study.web.controller.domin.Job;
import com.study.web.controller.domin.SysUser;
import com.study.web.controller.service.IComplaintService;
import com.study.web.controller.service.IJobService;
import com.study.web.controller.service.SysUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.List;

@RestController
public class ComplaintController extends BaseController {

    @Autowired
    private IComplaintService complaintService;

    @Autowired
    private SysUserService sysUserService;

    @Autowired
    private IJobService jobService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private volatile boolean complaintSchemaChecked = false;

    @GetMapping("/complaint")
    public ResponseResult selectComplaintList(Complaint complaint) {
        ResponseResult schemaError = ensureComplaintSchema();
        if (schemaError != null) {
            return schemaError;
        }

        startPage();
        List<Complaint> data = complaintService.selectComplaintList(complaint);
        return getResult(data);
    }

    @GetMapping("/complaint/{id}")
    public ResponseResult selectComplaintById(@PathVariable Long id) {
        ResponseResult schemaError = ensureComplaintSchema();
        if (schemaError != null) {
            return schemaError;
        }

        return getResult(complaintService.selectComplaintById(id));
    }

    @PostMapping("/complaint")
    public ResponseResult insertComplaint(@RequestBody Complaint complaint, HttpServletRequest request) {
        ResponseResult schemaError = ensureComplaintSchema();
        if (schemaError != null) {
            return schemaError;
        }

        if (complaint.getJobId() == null) {
            return ResponseResult.error("缺少职位信息");
        }

        String reason = complaint.getReason() == null ? "" : complaint.getReason().trim();
        if (reason.isEmpty()) {
            return ResponseResult.error("请输入投诉原因");
        }
        if (reason.length() > 500) {
            return ResponseResult.error("投诉原因不能超过500个字符");
        }

        String token = request.getHeader("token");
        if (token == null || token.isEmpty()) {
            token = request.getHeader("Token");
        }
        if (token == null || token.isEmpty()) {
            return ResponseResult.error("请先登录");
        }

        String username = JwtUtil.getUsername(token);
        if (username == null || username.isEmpty()) {
            return ResponseResult.error("登录状态已失效");
        }

        SysUser user = sysUserService.findByName(username);
        if (user == null) {
            return ResponseResult.error("用户不存在");
        }
        if (user.getRoleId() != null && user.getRoleId() == 2L) {
            return ResponseResult.error("企业用户无法投诉职位");
        }

        Job job = jobService.selectJobById(complaint.getJobId());
        if (job == null) {
            return ResponseResult.error("职位不存在或已下线");
        }

        Complaint newComplaint = new Complaint();
        newComplaint.setJobId(complaint.getJobId());
        newComplaint.setUserId(user.getUserId());
        newComplaint.setReason(reason);
        newComplaint.setCreateTime(new Date());

        return getResult(complaintService.insertComplaint(newComplaint));
    }

    private ResponseResult ensureComplaintSchema() {
        if (complaintSchemaChecked) {
            return null;
        }

        synchronized (this) {
            if (complaintSchemaChecked) {
                return null;
            }

            try {
                jdbcTemplate.execute(
                        "create table if not exists job_complaint (" +
                                "id bigint(20) not null auto_increment comment '投诉ID'," +
                                "job_id bigint(20) not null comment '职位ID'," +
                                "user_id bigint(20) not null comment '用户ID'," +
                                "reason varchar(500) not null comment '投诉原因'," +
                                "create_time datetime default current_timestamp comment '投诉时间'," +
                                "primary key (id)," +
                                "key idx_job_complaint_job_id (job_id)," +
                                "key idx_job_complaint_user_id (user_id)" +
                                ") engine=InnoDB default charset=utf8mb4"
                );
                complaintSchemaChecked = true;
                return null;
            } catch (Exception e) {
                return ResponseResult.error("投诉表初始化失败，请检查数据库权限后重试");
            }
        }
    }
}
