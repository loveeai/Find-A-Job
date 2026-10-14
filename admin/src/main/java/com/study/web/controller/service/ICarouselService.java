package com.study.web.controller.service;


import com.study.web.controller.domin.Carousel;

import java.util.List;

public interface ICarouselService {
    List<Carousel> selectList(Carousel carousel);

    Carousel selectById(Long id);

    int add(Carousel carousel);

    int update(Carousel carousel);

    int deleteByIds(Long[] ids);
}
