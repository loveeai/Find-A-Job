package com.study.web.controller.service.impl;

import com.study.common.utils.JwtUtil;
import com.study.web.controller.domin.Enterprise;
import com.study.web.controller.domin.LoginUser;
import com.study.web.controller.domin.Password;
import com.study.web.controller.domin.SysUser;
import com.study.web.controller.domin.vo.SysUserVo;
import com.study.web.controller.mapper.EnterpriseMapper;
import com.study.web.controller.mapper.SysUserMapper;
import com.study.web.controller.service.SysUserService;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.crypto.hash.Md5Hash;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Pattern;

@Service("sysUserService")
public class SysUserServiceImpl implements SysUserService {

    public static final int AUDIT_PENDING = 0;
    public static final int AUDIT_APPROVED = 1;
    public static final int AUDIT_REJECTED = 2;

    private static final Pattern MD5_PATTERN = Pattern.compile("^[a-fA-F0-9]{32}$");
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[A-Za-z0-9_]{4,20}$");
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^[A-Za-z0-9~!@#$%^&*()_+\\-=\\[\\]{}|;:'\",.<>/?]{6,20}$");

    private static final String USERNAME_RULE_MESSAGE = "账号需为4-20位，仅限字母/数字/下划线";
    private static final String PASSWORD_RULE_MESSAGE = "密码需为6-20位，仅限字母/数字/英文符号";

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private EnterpriseMapper enterpriseMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private volatile boolean auditSchemaChecked = false;

    @Override
    public List<SysUser> findAll(SysUser sysUser) {
        ensureAuditSchema();
        return sysUserMapper.findAll(sysUser);
    }

    @Override
    public SysUser findById(Long id) {
        ensureAuditSchema();
        return sysUserMapper.findById(id);
    }

    @Override
    public SysUser findByName(String userName) {
        ensureAuditSchema();
        return sysUserMapper.findByName(userName);
    }

    @Override
    public int add(SysUser sysUser) {
        ensureAuditSchema();
        normalizeProfileFields(sysUser);
        validateUserName(sysUser.getUserName());
        validatePassword(sysUser.getPassword(), false);
        prepareAuditStatusForCreate(sysUser);

        if (!isUserNameUnique(sysUser.getUserName(), -1L)) {
            throw new AuthenticationException("用户名已存在");
        }
        if (hasText(sysUser.getPhoneNumber()) && !isPhoneNumberUnique(sysUser.getPhoneNumber(), -1L)) {
            throw new AuthenticationException("手机号已存在");
        }
        if (hasText(sysUser.getEmail()) && !isEmailUnique(sysUser.getEmail(), -1L)) {
            throw new AuthenticationException("邮箱已存在");
        }

        sysUser.setPassword(normalizePasswordForStorage(sysUser.getPassword()));
        sysUser.setSalt(null);
        return sysUserMapper.add(sysUser);
    }

    @Override
    public int update(SysUser sysUser) {
        ensureAuditSchema();
        normalizeProfileFields(sysUser);
        validateUserName(sysUser.getUserName());
        if (!isUserNameUnique(sysUser.getUserName(), sysUser.getUserId())) {
            throw new AuthenticationException("用户名已存在");
        }
        if (hasText(sysUser.getPhoneNumber()) && !isPhoneNumberUnique(sysUser.getPhoneNumber(), sysUser.getUserId())) {
            throw new AuthenticationException("手机号已存在");
        }
        if (hasText(sysUser.getEmail()) && !isEmailUnique(sysUser.getEmail(), sysUser.getUserId())) {
            throw new AuthenticationException("邮箱已存在");
        }

        SysUser originUser = sysUserMapper.findById(sysUser.getUserId());
        if (originUser == null) {
            throw new AuthenticationException("用户不存在");
        }

        if (sysUser.getRoleId() == null) {
            sysUser.setRoleId(originUser.getRoleId());
        }
        if (sysUser.getCompanyId() == null) {
            sysUser.setCompanyId(originUser.getCompanyId());
        }
        if (sysUser.getAuditStatus() == null) {
            if (originUser.getRoleId() != null && originUser.getRoleId() == 2L) {
                sysUser.setAuditStatus(originUser.getAuditStatus() == null ? AUDIT_PENDING : originUser.getAuditStatus());
            } else {
                sysUser.setAuditStatus(AUDIT_APPROVED);
            }
        }
        if (sysUser.getRoleId() != null && sysUser.getRoleId() != 2L) {
            sysUser.setAuditStatus(AUDIT_APPROVED);
        }

        if (hasText(sysUser.getPassword())) {
            validatePasswordForUpdate(sysUser.getPassword(), originUser);
            if (isMd5Password(sysUser.getPassword()) && originUser.getPassword() != null
                    && sysUser.getPassword().equalsIgnoreCase(originUser.getPassword())) {
                sysUser.setPassword(originUser.getPassword().toLowerCase());
            } else {
                sysUser.setPassword(normalizePasswordForStorage(sysUser.getPassword()));
            }
        } else {
            sysUser.setPassword(null);
        }

        sysUser.setSalt(null);
        return sysUserMapper.update(sysUser);
    }

    @Override
    public int delete(Long[] ids) {
        ensureAuditSchema();
        int rows = 0;
        for (Long id : ids) {
            rows += sysUserMapper.delete(id);
        }
        return rows;
    }

    @Override
    public LoginUser login(SysUserVo sysUserVo) {
        ensureAuditSchema();
        String userName = sysUserVo.getUserName() == null ? "" : sysUserVo.getUserName().trim();
        String rawPassword = sysUserVo.getPassword() == null ? "" : sysUserVo.getPassword().trim();
        sysUserVo.setUserName(userName);
        sysUserVo.setPassword(rawPassword);
        validateUserName(userName);
        validatePassword(rawPassword, false);
        SysUser user = sysUserMapper.findByName(userName);
        if (user == null) {
            throw new AuthenticationException("用户名不存在");
        }
        if (!matchesPassword(user.getPassword(), rawPassword)) {
            throw new AuthenticationException("用户名或密码错误");
        }

        ensureEnterpriseUserAvailable(user);

        if (!isMd5Password(user.getPassword())) {
            String encryptedPassword = encryptPassword(rawPassword);
            sysUserMapper.updatePasswordByUserId(user.getUserId(), encryptedPassword);
            user.setPassword(encryptedPassword);
        } else {
            user.setPassword(user.getPassword().toLowerCase());
        }

        sysUserVo.setPassword(user.getPassword());
        LoginUser loginUser = findLoginUser(sysUserVo);
        String token = JwtUtil.sign(user.getUserName(), user.getPassword());
        loginUser.setToken(token);
        return loginUser;
    }

    @Override
    public LoginUser findLoginUser(SysUserVo sysUserVo) {
        ensureAuditSchema();
        return sysUserMapper.findLoginUser(sysUserVo);
    }

    @Override
    public boolean isUserNameUnique(String userName, Long userId) {
        ensureAuditSchema();
        if (!hasText(userName)) {
            return true;
        }
        return isValueUnique(sysUserMapper.findUsersByName(userName.trim()), userId);
    }

    @Override
    public boolean isPhoneNumberUnique(String phoneNumber, Long userId) {
        ensureAuditSchema();
        if (!hasText(phoneNumber)) {
            return true;
        }
        return isValueUnique(sysUserMapper.findUsersByPhoneNumber(phoneNumber.trim()), userId);
    }

    @Override
    public boolean isEmailUnique(String email, Long userId) {
        ensureAuditSchema();
        if (!hasText(email)) {
            return true;
        }
        return isValueUnique(sysUserMapper.findUsersByEmail(email.trim()), userId);
    }

    @Override
    public int updatePassword(Password password) {
        ensureAuditSchema();
        if (password == null || password.getUserId() == null) {
            throw new AuthenticationException("用户信息不完整");
        }

        String oldPassword = password.getPassword() == null ? "" : password.getPassword().trim();
        String newPassword = password.getNewPassword() == null ? "" : password.getNewPassword().trim();

        validatePassword(oldPassword, false, "请输入原密码");
        validatePassword(newPassword, false, "请输入新密码");

        if (!hasText(oldPassword) || !hasText(newPassword)) {
            throw new AuthenticationException("原密码和新密码不能为空");
        }

        SysUser user = sysUserMapper.findById(password.getUserId());
        if (user == null) {
            throw new AuthenticationException("用户不存在");
        }

        if (!matchesPassword(user.getPassword(), oldPassword)) {
            throw new AuthenticationException("原密码不正确");
        }

        if (matchesPassword(user.getPassword(), newPassword)) {
            throw new AuthenticationException("新密码不能与原密码一致");
        }

        String encryptedPassword = normalizePasswordForStorage(newPassword);
        return sysUserMapper.updatePasswordByUserId(password.getUserId(), encryptedPassword);
    }

    public void ensureEnterpriseUserAvailable(SysUser user) {
        ensureAuditSchema();
        if (user == null || user.getRoleId() == null || user.getRoleId() != 2L) {
            return;
        }

        Integer auditStatus = user.getAuditStatus() == null ? AUDIT_PENDING : user.getAuditStatus();
        if (auditStatus == AUDIT_PENDING) {
            throw new AuthenticationException("企业账号待管理员审核，审核通过后方可登录");
        }
        if (auditStatus == AUDIT_REJECTED) {
            throw new AuthenticationException("企业账号审核未通过，暂时无法登录");
        }

        if (user.getCompanyId() == null) {
            throw new AuthenticationException("企业账号未关联企业，无法继续操作");
        }

        Enterprise enterprise = enterpriseMapper.selectEnterpriseById(user.getCompanyId());
        if (enterprise == null) {
            throw new AuthenticationException("所属企业不存在，无法登录");
        }

        if (enterprise.getStatus() == null || enterprise.getStatus() != 1) {
            throw new AuthenticationException("所属企业已被禁用，无法继续操作");
        }
    }

    private void prepareAuditStatusForCreate(SysUser sysUser) {
        if (sysUser.getRoleId() != null && sysUser.getRoleId() == 2L) {
            if (sysUser.getAuditStatus() == null) {
                sysUser.setAuditStatus(AUDIT_PENDING);
            }
            return;
        }
        sysUser.setAuditStatus(AUDIT_APPROVED);
    }

    private void normalizeProfileFields(SysUser sysUser) {
        if (sysUser == null) {
            return;
        }
        if (hasText(sysUser.getUserName())) {
            sysUser.setUserName(sysUser.getUserName().trim());
        }
        if (hasText(sysUser.getPhoneNumber())) {
            sysUser.setPhoneNumber(sysUser.getPhoneNumber().trim());
        }
        if (hasText(sysUser.getEmail())) {
            sysUser.setEmail(sysUser.getEmail().trim());
        }
    }

    private void validateUserName(String userName) {
        if (!hasText(userName)) {
            throw new AuthenticationException("请输入账号");
        }
        if (!USERNAME_PATTERN.matcher(userName.trim()).matches()) {
            throw new AuthenticationException(USERNAME_RULE_MESSAGE);
        }
    }

    private void validatePassword(String password, boolean allowMd5Password) {
        validatePassword(password, allowMd5Password, "请输入密码");
    }

    private void validatePassword(String password, boolean allowMd5Password, String emptyMessage) {
        if (!hasText(password)) {
            throw new AuthenticationException(emptyMessage);
        }

        String value = password.trim();
        if (allowMd5Password && isMd5Password(value)) {
            return;
        }

        if (!PASSWORD_PATTERN.matcher(value).matches()) {
            throw new AuthenticationException(PASSWORD_RULE_MESSAGE);
        }
    }

    private void validatePasswordForUpdate(String password, SysUser originUser) {
        if (!hasText(password)) {
            return;
        }

        String value = password.trim();
        if (isMd5Password(value)
                && originUser != null
                && originUser.getPassword() != null
                && value.equalsIgnoreCase(originUser.getPassword())) {
            return;
        }

        validatePassword(value, false);
    }

    private void ensureAuditSchema() {
        if (auditSchemaChecked) {
            return;
        }

        synchronized (this) {
            if (auditSchemaChecked) {
                return;
            }

            try {
                Integer count = jdbcTemplate.queryForObject(
                        "select count(1) from information_schema.columns where table_schema = database() and table_name = 'sys_user' and column_name = 'audit_status'",
                        Integer.class
                );
                if (count == null || count == 0) {
                    jdbcTemplate.execute("alter table sys_user add column audit_status int(11) default 1 comment '企业用户审核状态:0待审核,1已通过,2已驳回' after company_id");
                    jdbcTemplate.execute("update sys_user set audit_status = 1 where audit_status is null");
                } else {
                    jdbcTemplate.execute("update sys_user set audit_status = 1 where audit_status is null");
                }
                auditSchemaChecked = true;
            } catch (Exception e) {
                throw new AuthenticationException("sys_user表缺少audit_status字段，请执行升级后重试");
            }
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private boolean isValueUnique(List<Long> userIds, Long userId) {
        if (userIds == null || userIds.isEmpty()) {
            return true;
        }

        Long currentUserId = userId == null ? -1L : userId;
        for (Long id : userIds) {
            if (!id.equals(currentUserId)) {
                return false;
            }
        }
        return true;
    }

    private boolean isMd5Password(String password) {
        return hasText(password) && MD5_PATTERN.matcher(password.trim()).matches();
    }

    private String encryptPassword(String password) {
        return new Md5Hash(password == null ? "" : password).toHex();
    }

    private String normalizePasswordForStorage(String password) {
        if (!hasText(password)) {
            return password;
        }

        String value = password.trim();
        return isMd5Password(value) ? value.toLowerCase() : encryptPassword(value);
    }

    private boolean matchesPassword(String storedPassword, String inputPassword) {
        if (!hasText(storedPassword) || inputPassword == null) {
            return false;
        }

        String normalizedStoredPassword = storedPassword.trim();
        String rawPassword = inputPassword.trim();

        return normalizedStoredPassword.equals(rawPassword)
                || normalizedStoredPassword.equalsIgnoreCase(encryptPassword(rawPassword));
    }
}
