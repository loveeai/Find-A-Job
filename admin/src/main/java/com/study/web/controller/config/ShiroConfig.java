package com.study.web.controller.config;

import com.study.web.controller.shiro.realms.CustomerRealm;
import com.study.web.controller.shiro.JwtFilter;
import org.apache.shiro.mgt.DefaultSessionStorageEvaluator;
import org.apache.shiro.mgt.DefaultSubjectDAO;
import org.apache.shiro.realm.Realm;
import org.apache.shiro.spring.web.ShiroFilterFactoryBean;
import org.apache.shiro.web.mgt.DefaultWebSecurityManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.servlet.Filter;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 配置shiro安全框架
 */
@Configuration
public class ShiroConfig {

    //拦截路径的，
    //创建shiroFilter
    @Bean("shiroFilter")
    public ShiroFilterFactoryBean getShiroFilterFactoryBean(DefaultWebSecurityManager defaultWebSecurityManager){
        ShiroFilterFactoryBean shiroFilterFactoryBean = new ShiroFilterFactoryBean();

        //给shiroFilter设置安全管理器
        shiroFilterFactoryBean.setSecurityManager(defaultWebSecurityManager);
        //对前端发送的请求路径进行验证，判断是拦截还是放行，
        //配置受限资源
        Map<String, String> map = new LinkedHashMap<>();
        map.put("/sysUser/**", "anon");//放行
        map.put("/upload/**", "anon");//放行
        map.put("/images/**", "anon");//放行图片查询
        map.put("/pay/**", "anon");//放行图片查询
        map.put("/notify/**", "anon");//放行图片查询
        map.put("/captcha/**", "anon");//放行验证码请求
        map.put("/exportExcel/**", "anon");//
        map.put("/course/**", "anon");//
        map.put("/culture/**", "anon");//
        map.put("/category/**", "anon");//
        map.put("/carousel/**", "anon");//
        map.put("/**/**", "anon");//
        map.put("/**", "jwt");//请求这个资源需要认证与授权

        // 添加自己的过滤器并且取名为jwt
        Map<String, Filter> filterMap = new HashMap<String, Filter>(1);
        filterMap.put("jwt", new JwtFilter());
        shiroFilterFactoryBean.setFilters(filterMap);

        //设置认证规则
        shiroFilterFactoryBean.setFilterChainDefinitionMap(map);
        return shiroFilterFactoryBean;
    }

    //创建安全管理器
    @Bean
    public DefaultWebSecurityManager getDefaultWebSecurityManager(Realm realm){
        DefaultWebSecurityManager defaultWebSecurityManager = new DefaultWebSecurityManager();
        //给安全管理器设置realm
        defaultWebSecurityManager.setRealm(realm);
        //关闭shiro自带的session，使得不保存登录状态，每次使用token进行验证
        DefaultSubjectDAO subjectDAO = new DefaultSubjectDAO();
        DefaultSessionStorageEvaluator defaultSessionStorageEvaluator = new DefaultSessionStorageEvaluator();
        defaultSessionStorageEvaluator.setSessionStorageEnabled(false);
        subjectDAO.setSessionStorageEvaluator(defaultSessionStorageEvaluator);
        defaultWebSecurityManager.setSubjectDAO(subjectDAO);
        return defaultWebSecurityManager;
    }

    //创建自定义realm
    @Bean(name = "realm")
    public Realm getRealm(){
        CustomerRealm realm = new CustomerRealm();
        return realm;
    }

}
