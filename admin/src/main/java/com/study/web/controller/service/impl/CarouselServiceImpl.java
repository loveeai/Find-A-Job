package com.study.web.controller.service.impl;


import com.study.web.controller.domin.Carousel;
import com.study.web.controller.mapper.CarouselMapper;
import com.study.web.controller.service.ICarouselService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CarouselServiceImpl implements ICarouselService {


    @Autowired
    private CarouselMapper carouselMapper;


    @Override
    public List<Carousel> selectList(Carousel carousel) {
        return carouselMapper.selectCarouselList(carousel);
    }

    @Override
    public Carousel selectById(Long id) {
        return carouselMapper.selectCarouselById(id);
    }

    @Override
    public int add(Carousel carousel) {
        return carouselMapper.insertCarousel(carousel);
    }

    @Override
    public int update(Carousel carousel) {
        return carouselMapper.updateCarousel(carousel);
    }

    @Override
    public int deleteByIds(Long[] ids) {
        return carouselMapper.deleteCarouselByIds(ids);
    }
}
