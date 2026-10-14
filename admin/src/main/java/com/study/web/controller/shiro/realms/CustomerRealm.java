package com.study.web.controller.shiro.realms;

import com.study.common.utils.JwtUtil;
import com.study.web.controller.domin.SysUser;
import com.study.web.controller.service.impl.SysUserServiceImpl;
import com.study.web.controller.shiro.JwtToken;
import lombok.extern.slf4j.Slf4j;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.subject.PrincipalCollection;
import org.springframework.beans.factory.annotation.Autowired;

@Slf4j
public class CustomerRealm extends AuthorizingRealm {

    @Autowired
    private SysUserServiceImpl sysUserService;

    @Override
    public boolean supports(AuthenticationToken token) {
        return token instanceof JwtToken;
    }

    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principalCollection) {
        return null;
    }

    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken authenticationToken) throws AuthenticationException {
        String token = (String) authenticationToken.getCredentials();
        String username;
        try {
            username = JwtUtil.getUsername(token);
        } catch (Exception e) {
            throw new AuthenticationException("登录凭证已失效，请重新登录");
        }

        if (username == null) {
            log.error("token is invalid");
            throw new AuthenticationException("登录凭证已失效，请重新登录");
        }

        SysUser user = sysUserService.findByName(username);
        if (user == null) {
            log.error("user not found: {}", username);
            throw new AuthenticationException("用户不存在");
        }

        sysUserService.ensureEnterpriseUserAvailable(user);

        if (!JwtUtil.verify(token, username, user.getPassword())) {
            log.error("token verify failed for user: {}", username);
            throw new AuthenticationException("登录凭证已失效，请重新登录");
        }

        return new SimpleAuthenticationInfo(token, token, getName());
    }
}
