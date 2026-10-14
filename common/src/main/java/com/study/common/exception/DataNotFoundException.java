package com.study.common.exception;

/**
 *
 * 全局异常处理类
 * */
public class DataNotFoundException extends RuntimeException{

    static final long serialVersionUID = -7034897190745456227L;

    public DataNotFoundException() {
        super();
    }

    public DataNotFoundException(String message) {
        super(message);
    }
}
