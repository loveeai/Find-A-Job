package com.study.web.controller.system;

import com.study.common.response.ResponseResult;
import com.study.web.controller.BaseController;
import com.study.web.controller.domin.Enterprise;
import com.study.web.controller.service.IEnterpriseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class EnterpriseController extends BaseController {

    @Autowired
    private IEnterpriseService enterpriseService;

    @GetMapping("/enterprise")
    public ResponseResult selectEnterpriseList(Enterprise enterprise) {
        startPage();
        List<Enterprise> data = enterpriseService.selectEnterpriseList(enterprise);
        return getResult(data);
    }

    @GetMapping("/enterprise/{id}")
    public ResponseResult selectEnterpriseById(@PathVariable Long id) {
        Enterprise enterprise = enterpriseService.selectEnterpriseById(id);
        return getResult(enterprise);
    }

    @PostMapping("/enterprise")
    public ResponseResult insertEnterprise(@RequestBody Enterprise enterprise) {
        return getResult(enterpriseService.insertEnterprise(enterprise));
    }

    @PutMapping("/enterprise")
    public ResponseResult updateEnterprise(@RequestBody Enterprise enterprise) {
        return getResult(enterpriseService.updateEnterprise(enterprise));
    }

    @DeleteMapping("/enterprise/{id}")
    public ResponseResult deleteEnterpriseById(@PathVariable Long id) {
        return getResult(enterpriseService.deleteEnterpriseById(id));
    }

    @DeleteMapping("/enterprise/ids/{ids}")
    public ResponseResult deleteEnterpriseByIds(@PathVariable String[] ids) {
        return getResult(enterpriseService.deleteEnterpriseByIds(ids));
    }
}