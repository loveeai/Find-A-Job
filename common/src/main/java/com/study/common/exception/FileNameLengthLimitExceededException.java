package com.study.common.exception;

/**
 * 文件的异常处理同上
 * */
public class FileNameLengthLimitExceededException extends RuntimeException{

    private static final long serialVersionUID = 1L;

    public FileNameLengthLimitExceededException(){

    }

    public FileNameLengthLimitExceededException(String message){
        super(message);
    }

}
