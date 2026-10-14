package com.study.common.controller;

import com.study.common.file.FileUploadUtils;
import com.study.common.response.ResponseResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.ResourceUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;

/**
 * 文件上传相关代码
 * */
@Slf4j
@RestController
@RequestMapping("/upload")
public class FileUploadController {

    //上传前台用户头像
    @PostMapping("/user")
    public ResponseResult uploadUser(@RequestParam("file") MultipartFile file) throws IOException {
        FileUploadUtils.setDefaultBaseDir(FileUploadUtils.userPath);
        String filename = FileUploadUtils.upload(file);
        System.out.println(filename);
        log.debug("上传文件名 : " + filename);
        return ResponseResult.success((Object)filename);
    }

    // 上传企业 Logo
    @PostMapping("/logo")
    public ResponseResult uploadLogo(@RequestParam("file") MultipartFile file) throws IOException {
        FileUploadUtils.setDefaultBaseDir(FileUploadUtils.logoPath);
        String filename = FileUploadUtils.upload(file);
        log.debug("上传文件名 : " + filename);
        return ResponseResult.success((Object)filename);
    }

    @PostMapping("/movie")
    public ResponseResult uploadMovie(@RequestParam("file") MultipartFile file) throws IOException {
        FileUploadUtils.setDefaultBaseDir(FileUploadUtils.moviePath);
        String filename = FileUploadUtils.upload(file);
        log.debug("上传文件名 : " + filename);
        return ResponseResult.success((Object)filename);
    }

//
    //删除
    @RequestMapping("/delete")
    public ResponseResult deletePicture(String filePath){
        try {
            String path = ResourceUtils.getURL("classpath:").getPath().substring(1) + "static" + filePath;
            log.debug("删除文件路径为：" + path);
            boolean flag = FileUploadUtils.deleteFile(path);
            log.debug(flag ? "删除成功" : "删除失败");
        } catch (FileNotFoundException e) {
            System.out.println("删除文件不存在");
        } finally {
            return ResponseResult.success();
        }
    }

}
