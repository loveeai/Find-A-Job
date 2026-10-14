package com.study.web.controller.system;


import com.study.common.response.ResponseResult;
import com.study.web.controller.BaseController;
import com.study.web.controller.domin.Interview;
import com.study.web.controller.service.IInterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController

public class InterviewController extends BaseController
{
    @Autowired
    private IInterviewService interviewService;


    @GetMapping("/interview")
    public ResponseResult list(Interview interview){
        startPage();
        List<Interview> list = interviewService.selectList(interview);
        return getResult(list);
    }
    @GetMapping("/interview/{id}")
    public ResponseResult findById(@PathVariable Long id){
        return getResult(interviewService.selectById(id));
    }
    @PostMapping("/interview")
    public ResponseResult add(@Validated @RequestBody Interview interview){
        interview.setCtimes(new Date());
        return getResult(interviewService.add(interview));
    }
    @PutMapping("/interview")
    public ResponseResult update(@Validated @RequestBody Interview interview){
        return getResult(interviewService.update(interview));
    }
    @DeleteMapping("/interview/{ids}")
    public ResponseResult delete(@PathVariable Long[] ids){
        return getResult(interviewService.deleteByIds(ids));
    }


}
