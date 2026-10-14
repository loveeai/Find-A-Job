package com.study.common.constant;

/**
 * 返回给前端的状态码，前端可以根据相应的状态码去判断需要出力的逻辑
 * 成功返回200
 * 没有权限返回403
 * 404 找不到接口
 * 500后端java代码逻辑报错例如：空指针，数组下表越界
 * */
public class HttpStatus {
    /**
     * 成功
     */
    public static final int SUCCESS = 200;

    public static final int BAD_REQUEST = 400;

    /**
     * 访问受限，授权过期
     */
    public static final int FORBIDDEN = 403;

    /**
     * 资源，服务未找到
     */
    public static final int NOT_FOUND = 404;

    /**
     * 系统内部错误
     */
    public static final int ERROR = 500;
}
