package com.study.web.controller.system;

import com.study.common.response.ResponseResult;
import com.study.web.controller.BaseController;
import com.study.web.controller.domin.JobCategory;
import com.study.web.controller.service.IJobCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class JobCategoryController extends BaseController {

    @Autowired
    private IJobCategoryService jobCategoryService;

    @GetMapping("/jobCategory")
    public ResponseResult selectJobCategoryList(JobCategory jobCategory) {
        startPage();
        List<JobCategory> data = jobCategoryService.selectJobCategoryList(jobCategory);
        return getResult(data);
    }

    @GetMapping("/jobCategory/{id}")
    public ResponseResult selectJobCategoryById(@PathVariable Long id) {
        JobCategory jobCategory = jobCategoryService.selectJobCategoryById(id);
        return getResult(jobCategory);
    }

    @PostMapping("/jobCategory")
    public ResponseResult insertJobCategory(@RequestBody JobCategory jobCategory) {
        return getResult(jobCategoryService.insertJobCategory(jobCategory));
    }

    @PutMapping("/jobCategory")
    public ResponseResult updateJobCategory(@RequestBody JobCategory jobCategory) {
        return getResult(jobCategoryService.updateJobCategory(jobCategory));
    }

    @DeleteMapping("/jobCategory/{id}")
    public ResponseResult deleteJobCategoryById(@PathVariable Long id) {
        return getResult(jobCategoryService.deleteJobCategoryById(id));
    }

    @DeleteMapping("/jobCategory/ids/{ids}")
    public ResponseResult deleteJobCategoryByIds(@PathVariable String[] ids) {
        return getResult(jobCategoryService.deleteJobCategoryByIds(ids));
    }
}