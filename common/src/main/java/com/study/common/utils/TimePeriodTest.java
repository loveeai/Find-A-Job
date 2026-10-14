package com.study.common.utils;

import java.util.Date;

public class TimePeriodTest {

    /**
     * 判断一个时间段是否包含另一个时间段，包含：TRUE，不包含：FALSE
     *
     * @param date1
     * @param date2
     * @param startTime
     * @param endTime
     * @return
     */
    public static Boolean judge(Date date1, Date date2, Date startTime, Date endTime) {
        long d1 = date1.getTime();
        long d2 = date2.getTime();
        long v = d2 - d1;
        long start = startTime.getTime();
        long end = endTime.getTime();
        if (((d1 - start) <= 0) && ((end - d2) <= 0) || ((d2 - start) >= 0) && ((d1 - end) <= 0)) {
            return true;
        }
        return false;

    }

}
