package com.study.common.exception;


public class InvalidExtensionException extends RuntimeException{

    private static final long serialVersionUID = 1L;

    public InvalidExtensionException(){

    }

    public InvalidExtensionException(String message){
        super(message);
    }

}
