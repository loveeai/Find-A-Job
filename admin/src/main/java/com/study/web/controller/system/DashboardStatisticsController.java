package com.study.web.controller.system;

import com.study.common.response.ResponseResult;
import com.study.web.controller.BaseController;
import com.study.web.controller.domin.Statistics;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
public class DashboardStatisticsController extends BaseController {

    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/dashboard/statistics")
    public ResponseResult getDashboardStatistics() {
        Map<String, Object> data = new LinkedHashMap<>();
        Map<String, Object> summary = new LinkedHashMap<>();

        summary.put("userCount", count("select count(1) from sys_user where role_id = 3"));
        summary.put("enterpriseUserCount", count("select count(1) from sys_user where role_id = 2"));
        summary.put("enterpriseCount", count("select count(1) from enterprise"));
        summary.put("activeEnterpriseCount", count("select count(1) from enterprise where status = 1"));
        summary.put("activeJobCount", count("select count(1) from job where status = 1 and (end_time is null or date(end_time) >= curdate())"));
        summary.put("applicationCount", count("select count(1) from application"));
        summary.put("resumeCount", count("select count(1) from resume"));
        summary.put("commentCount", count("select count(1) from `comment`"));

        data.put("summary", summary);
        data.put("userRoleStats", buildUserRoleStats());
        data.put("enterpriseStatusStats", buildEnterpriseStatusStats());
        data.put("applicationStatusStats", buildApplicationStatusStats());
        data.put("jobAuditStats", buildJobAuditStats());
        data.put("monthlyJobPublishStats", buildMonthlyJobPublishStats());
        data.put("topEnterpriseJobStats", buildTopEnterpriseJobStats());
        return getResult(data);
    }

    private long count(String sql) {
        Long value = jdbcTemplate.queryForObject(sql, Long.class);
        return value == null ? 0L : value;
    }

    private List<Statistics> buildUserRoleStats() {
        List<Statistics> result = new ArrayList<>();
        result.add(new Statistics("管理员", (int) count("select count(1) from sys_user where role_id = 1")));
        result.add(new Statistics("企业用户", (int) count("select count(1) from sys_user where role_id = 2")));
        result.add(new Statistics("普通用户", (int) count("select count(1) from sys_user where role_id = 3")));
        return result;
    }

    private List<Statistics> buildEnterpriseStatusStats() {
        List<Statistics> result = new ArrayList<>();
        result.add(new Statistics("正常企业", (int) count("select count(1) from enterprise where status = 1")));
        result.add(new Statistics("禁用企业", (int) count("select count(1) from enterprise where status = 0 or status is null")));
        return result;
    }

    private List<Statistics> buildApplicationStatusStats() {
        List<Statistics> result = new ArrayList<>();
        result.add(new Statistics("待查看", (int) count("select count(1) from application where status = 0 or status is null")));
        result.add(new Statistics("待面试", (int) count("select count(1) from application where status = 1")));
        result.add(new Statistics("不合适", (int) count("select count(1) from application where status = 2")));
        result.add(new Statistics("已录用", (int) count("select count(1) from application where status = 3")));
        return result;
    }

    private List<Statistics> buildJobAuditStats() {
        List<Statistics> result = new ArrayList<>();
        result.add(new Statistics("禁用", (int) count("select count(1) from job where status = 0")));
        result.add(new Statistics("审核通过", (int) count("select count(1) from job where status = 1")));
        result.add(new Statistics("待审核", (int) count("select count(1) from job where status = 2")));
        result.add(new Statistics("审核未通过", (int) count("select count(1) from job where status = 3")));
        return result;
    }

    private List<Statistics> buildMonthlyJobPublishStats() {
        YearMonth currentMonth = YearMonth.now();
        YearMonth startMonth = currentMonth.minusMonths(5);
        Map<String, Integer> countMap = new LinkedHashMap<>();
        YearMonth cursor = startMonth;
        while (!cursor.isAfter(currentMonth)) {
            countMap.put(cursor.format(MONTH_FORMATTER), 0);
            cursor = cursor.plusMonths(1);
        }

        List<Statistics> dbStats = jdbcTemplate.query(
                "select date_format(create_time, '%Y-%m') as name, count(1) as nums " +
                        "from job " +
                        "where create_time >= date_sub(date_format(curdate(), '%Y-%m-01'), interval 5 month) " +
                        "group by date_format(create_time, '%Y-%m') " +
                        "order by name",
                (rs, rowNum) -> new Statistics(rs.getString("name"), rs.getInt("nums"))
        );

        for (Statistics statistics : dbStats) {
            if (countMap.containsKey(statistics.getName())) {
                countMap.put(statistics.getName(), statistics.getNums());
            }
        }

        List<Statistics> result = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : countMap.entrySet()) {
            result.add(new Statistics(entry.getKey(), entry.getValue()));
        }
        return result;
    }

    private List<Statistics> buildTopEnterpriseJobStats() {
        return jdbcTemplate.query(
                "select ifnull(e.name, '未命名企业') as name, count(j.id) as nums " +
                        "from enterprise e " +
                        "left join job j on e.id = j.enterprise_id " +
                        "group by e.id, e.name " +
                        "order by nums desc, e.id asc " +
                        "limit 6",
                this::mapStatistics
        );
    }

    private Statistics mapStatistics(ResultSet rs, int rowNum) throws SQLException {
        return new Statistics(rs.getString("name"), rs.getInt("nums"));
    }
}
