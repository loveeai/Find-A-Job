package com.study.web.controller.mapper;


import com.study.web.controller.domin.Carousel;

import java.util.List;

public interface CarouselMapper
{

    List<Carousel> selectCarouselList(Carousel carousel);

    Carousel selectCarouselById(Long id);

    int insertCarousel(Carousel carousel);

    int updateCarousel(Carousel carousel);

    int deleteCarouselByIds(Long[] ids);
}
