package com.study.web.controller.system;

import com.study.common.response.ResponseResult;
import com.study.web.controller.BaseController;
import com.study.web.controller.domin.EnterpriseCollectResume;
import com.study.web.controller.service.IEnterpriseCollectResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class EnterpriseCollectResumeController extends BaseController {

    @Autowired
    private IEnterpriseCollectResumeService enterpriseCollectResumeService;

    @GetMapping("/enterpriseCollectResume")
    public ResponseResult selectEnterpriseCollectResumeList(EnterpriseCollectResume enterpriseCollectResume) {
        startPage();
        List<EnterpriseCollectResume> data = enterpriseCollectResumeService.selectEnterpriseCollectResumeList(enterpriseCollectResume);
        return getResult(data);
    }

    @GetMapping("/enterpriseCollectResume/{id}")
    public ResponseResult selectEnterpriseCollectResumeById(@PathVariable Long id) {
        EnterpriseCollectResume enterpriseCollectResume = enterpriseCollectResumeService.selectEnterpriseCollectResumeById(id);
        return getResult(enterpriseCollectResume);
    }

    @PostMapping("/enterpriseCollectResume")
    public ResponseResult insertEnterpriseCollectResume(@RequestBody EnterpriseCollectResume enterpriseCollectResume) {
        return getResult(enterpriseCollectResumeService.insertEnterpriseCollectResume(enterpriseCollectResume));
    }

    @PutMapping("/enterpriseCollectResume")
    public ResponseResult updateEnterpriseCollectResume(@RequestBody EnterpriseCollectResume enterpriseCollectResume) {
        return getResult(enterpriseCollectResumeService.updateEnterpriseCollectResume(enterpriseCollectResume));
    }

    @DeleteMapping("/enterpriseCollectResume/{id}")
    public ResponseResult deleteEnterpriseCollectResumeById(@PathVariable Long id) {
        return getResult(enterpriseCollectResumeService.deleteEnterpriseCollectResumeById(id));
    }

    @DeleteMapping("/enterpriseCollectResume/ids/{ids}")
    public ResponseResult deleteEnterpriseCollectResumeByIds(@PathVariable String[] ids) {
        return getResult(enterpriseCollectResumeService.deleteEnterpriseCollectResumeByIds(ids));
    }
}