package com.study.web.controller.system;


import com.study.common.response.ResponseResult;
import com.study.web.controller.BaseController;
import com.study.web.controller.domin.Carousel;
import com.study.web.controller.service.ICarouselService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
public class CarouselController extends BaseController
{

    @Autowired
    private ICarouselService carouselService;

    @GetMapping("/carousel")
    public ResponseResult list(Carousel carousel){
        startPage();
        List<Carousel> list = carouselService.selectList(carousel);
        return getResult(list);
    }

    @GetMapping("/carousel/{id}")
    public ResponseResult findById(@PathVariable Long id){
        return getResult(carouselService.selectById(id));
    }

    @PostMapping("/carousel")
    public ResponseResult add(@Validated @RequestBody Carousel carousel){
        carousel.setTimes(new Date());
        return getResult(carouselService.add(carousel));
    }

    @PutMapping("/carousel")
    public ResponseResult update(@Validated @RequestBody Carousel carousel){
        carousel.setUtimes(new Date());
        return getResult(carouselService.update(carousel));
    }

    @DeleteMapping("/carousel/{ids}")
    public ResponseResult delete(@PathVariable Long[] ids){
        return getResult(carouselService.deleteByIds(ids));
    }

}
