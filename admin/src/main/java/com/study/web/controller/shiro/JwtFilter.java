package com.study.web.controller.shiro;

import com.study.common.constant.HttpStatus;
import lombok.extern.slf4j.Slf4j;
import org.apache.shiro.web.filter.authc.BasicHttpAuthenticationFilter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.servlet.Filter;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 使用 jwt 过滤器作为 shiro 的过滤器
 */
@Slf4j
@Component
public class JwtFilter extends BasicHttpAuthenticationFilter implements Filter {

    @Override
    protected boolean executeLogin(ServletRequest request, ServletResponse response) throws Exception {
        HttpServletRequest httpServletRequest = (HttpServletRequest) request;
        String token = httpServletRequest.getHeader("Token");
        if (token == null || token.trim().isEmpty()) {
            token = httpServletRequest.getHeader("token");
        }
        JwtToken jwtToken = new JwtToken(token);

        // 交给 realm 进行登录
        getSubject(request, response).login(jwtToken);
        return true;
    }

    /**
     * 登录认证
     *
     * @param request request
     * @param response response
     * @param mappedValue mappedValue
     * @return boolean
     */
    @Override
    protected boolean isAccessAllowed(ServletRequest request, ServletResponse response, Object mappedValue) {
        try {
            return executeLogin(request, response);
        } catch (Exception e) {
            log.error("JwtFilter 过滤验证失败", e);
            return false;
        }
    }

    /**
     * 处理跨域
     *
     * @param request request
     * @param response response
     * @return boolean
     * @throws Exception Exception
     */
    @Override
    protected boolean preHandle(ServletRequest request, ServletResponse response) throws Exception {
        HttpServletRequest httpServletRequest = (HttpServletRequest) request;
        HttpServletResponse httpServletResponse = (HttpServletResponse) response;
        httpServletResponse.setHeader("Access-control-Allow-Origin", httpServletRequest.getHeader("Origin"));
        httpServletResponse.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,PUT,DELETE");
        httpServletResponse.setHeader("Access-Control-Allow-Headers", httpServletRequest.getHeader("Access-Control-Request-Headers"));
        if (httpServletRequest.getMethod().equals(RequestMethod.OPTIONS.name())) {
            httpServletResponse.setStatus(HttpStatus.SUCCESS);
            return false;
        }
        return super.preHandle(request, response);
    }
}
